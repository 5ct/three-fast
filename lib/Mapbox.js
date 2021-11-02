import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { OrbitControls, MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import store from '../../../store';
class Mapbox {
    constructor(options = {}) {
        this.original = {};
        const self = this;
        self.original = Object.assign({
            THREE: THREE,
            FBXLoader: new FBXLoader(),
            scene: {
                color: "#bbb"
            },
            composer: {},
            clock: new THREE.Clock(),
            width: options.dom.clientWidth,
            height: options.dom.clientHeight,
            camera: {
                position: [-252, 110, 106],
                fov: 30,
                near: 1,
                far: 8000
            },
            hemisphereLight: [{
                    color: [0xffffff, 0x444444],
                    position: [0, 1000, 1000]
                }],
            pointLight: [{
                    distance: 1000,
                    intensity: 1,
                    color: 0x444444,
                    position: [0, 100, 500]
                }, {
                    distance: 1000,
                    intensity: 1,
                    color: "#fff",
                    position: [-200, -500, 500]
                }],
            background: {
                width: 220,
                height: 220,
                color: "rgba(165,85,23,0.6)"
            },
            grid: {
                size: 220,
                divisions: 40,
                color: ["rgb(255,0,255)", "rgb(255,255,0)"],
                opacity: 0.5
            },
            FBXData: [],
            renderer: {},
            dom: null,
            selectModel: {
                color: "#00c0ff",
                activeColor: "#00c0ff",
                msgColor: "red"
            },
            boxName: "Sky_Night Moon High Clear_Cam",
            modelClick(potision) { },
            modelChange() { },
            modelControl: {
                isUse: true,
                maxDistance: 500,
                minDistance: 30,
                rotateSpeed: 0.5,
                zoomSpeed: 1.2,
                panSpeed: 0.8,
                maxPolarAngle: Math.PI * 88 / 180,
                minPolarAngle: Math.PI * 0 / 180
            },
            diffWidth: 0,
            diffHeight: 0,
            msgArray: [],
            controls: {},
            PI: Math.PI / 180,
            isRunning: true,
            patrolIndex: 0,
            patrolTime: 0,
            lineObj: {},
            toolTipArray: [],
            person: null,
            config: {
                center: [121.463995, 31.210130],
                zoom: 20,
                minzoom: 8,
                pitch: 30,
                // style: 'mapbox://styles/mapbox/satellite-v9'
                style: "mapbox://styles/mapbox/streets-v9"
            },
            map: null
        }, options);
        Object.assign(self, self.original);
        self.initThree();
    }
    initThree() {
        const self = this;
        self.initScene();
        self.initPerspectiveCamera();
        self.initLine();
        // self.initPerson();
        // self.initHelper();
        // self.initHemisphereLight();
        // self.initPointLight();
        //self.initGrid();
        // self.initSurface();
        self.initFBXData().then(res => {
            self.loadMapBox().then(res => {
                self.initEffectComposer();
                // self.modelControl.isUse?self.initModelControl():self.initMapControl();
                self.mouseDown();
                // self.running();
                self.windowResize();
                if (self.init) {
                    self.init();
                }
                self.onLoadModel();
            });
        });
    }
    loadMapBox() {
        const self = this;
        let scene = self.scene, camera = self.camera, config = self.config;
        mapboxgl.accessToken = "pk.eyJ1Ijoiemhhb3Blbmd3ZWkiLCJhIjoiY2szNDI2NGNlMHRpdDNvbW1yYTlxb2E5NSJ9.inU4ZoruWtf8xSkxU41LqQ"; // 英文标注转换为中文
        let map = new mapboxgl.Map({
            attribution_enabled: false,
            container: self.dom,
            style: config.style,
            center: config.center,
            minzoom: config.minzoom,
            pitch: config.pitch,
            zoom: config.zoom,
            bearing: -96,
        });
        // 英文标注转换为中文
        mapboxgl.setRTLTextPlugin("https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js");
        map.addControl(new MapboxLanguage({ defaultLanguage: "zh" }));
        // 地图导航
        map.addControl(new mapboxgl.NavigationControl(), "top-left");
        // 比例尺
        let scale = new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: "imperial"
        });
        map.addControl(scale);
        scale.setUnit("metric");
        // 全屏
        map.addControl(new mapboxgl.FullscreenControl());
        // 定位
        map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));
        return self.loadModel(map);
    }
    loadModel(map) {
        const self = this;
        let scene = self.scene, camera = self.camera, config = self.config;
        return new Promise(function (resolve, reject) {
            let modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(config.center, 0);
            let modelTransform = {
                translateX: modelAsMercatorCoordinate.x,
                translateY: modelAsMercatorCoordinate.y,
                translateZ: modelAsMercatorCoordinate.z,
                rotateX: Math.PI / 2,
                rotateY: Math.PI * 90 / 180,
                rotateZ: 0,
                scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
            };
            let customLayer = {
                id: '3d-model',
                type: 'custom',
                renderingMode: '3d',
                onAdd: function (map, gl) {
                    self.FBXData.forEach(object => {
                        scene.add(object);
                    });
                    let renderer = new THREE.WebGLRenderer({
                        canvas: map.getCanvas(),
                        context: gl,
                        antialias: true
                    });
                    renderer.autoClear = false;
                    self.renderer = renderer;
                    resolve(1);
                },
                render: function (gl, matrix) {
                    var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
                    var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
                    var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);
                    var m = new THREE.Matrix4().fromArray(matrix);
                    var l = new THREE.Matrix4().makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                        .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
                        .multiply(rotationX)
                        .multiply(rotationY)
                        .multiply(rotationZ);
                    camera.projectionMatrix = m.multiply(l);
                    if (self.original.run) {
                        self.original.run(self.Delta);
                    }
                    /* if(self.composer.render){
                         if(self.selectModel.position){
                             self.composer.passes[1].selectedObjects = [self.selectModel];
                         }else{
                             self.composer.passes[1].selectedObjects = []
                         }
                         self.composer.render(delta);//使用组合器来渲染，而不再用webGLRenderer
                     }*/
                    self.renderer.state.reset();
                    self.renderer.render(scene, camera);
                    self.controlChange();
                    map.triggerRepaint();
                }
            };
            map.on('style.load', function () {
                map.addLayer(customLayer);
            });
        });
    }
    //初始化场景
    initScene() {
        const self = this;
        let data = self.original.scene;
        let scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 400, 5000);
        self.scene = scene;
    }
    initCamera() {
        const self = this;
        let data = self.original.camera;
        self.camera = new THREE.Camera();
        // self.camera.position.set( data.position[0],data.position[1], data.position[2]);
    }
    //初始化透视相机
    initPerspectiveCamera() {
        const self = this;
        let data = self.original.camera;
        self.camera = new THREE.PerspectiveCamera(data.fov, self.width / self.height, data.near, data.far);
        // self.camera.position.set( data.position[0],data.position[1], data.position[2]);
    }
    //初始化正交相机
    initOrthographicCamera() {
        const self = this;
        let data = self.original.camera, scene = self.scene;
        self.camera = new THREE.OrthographicCamera(-self.width / 6, self.width / 6, self.height / 6, -self.height / 6, 1, 5000);
        self.camera.position.set(data.position[0], data.position[1], data.position[2]);
    }
    //初始化巡视人
    initPerson() {
        const self = this;
        let person = new THREE.Object3D(), data = self.original.camera;
        self.scene.add(person);
        person.add(self.camera);
        person.position.set(data.position[0], data.position[1], data.position[2]);
        self.person = person;
    }
    //初始化辅助工具
    initHelper() {
        const self = this;
        let helper = new THREE.AxesHelper(500);
        self.scene.add(helper);
    }
    //初始化自然光
    initHemisphereLight() {
        const self = this;
        let data = self.original.hemisphereLight, scene = self.scene;
        self.hemisphereLight = [];
        data.forEach(item => {
            let light = new THREE.HemisphereLight(item.color[0], item.color[1]);
            light.position.set(item.position[0], item.position[1], item.position[2]);
            scene.add(light);
            self.hemisphereLight.push(light);
        });
    }
    //初始化点光
    initPointLight() {
        const self = this;
        let data = self.original.pointLight, scene = self.scene, sphere = new THREE.SphereBufferGeometry(0.5, 16, 8);
        self.pointLight = [];
        data.forEach(item => {
            let light = new THREE.PointLight(item.color, item.intensity, item.distance);
            light.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: item.color })));
            light.position.set(item.position[0], item.position[1], item.position[2]);
            scene.add(light);
            self.pointLight.push(light);
        });
    }
    //初始化网格
    initGrid() {
        const self = this;
        let data = self.original.grid, scene = self.scene;
        let grid = new THREE.GridHelper(data.size, data.divisions, data.color[0], data.color[1]);
        grid.material.opacity = data.opacity;
        grid.material.transparent = true;
        scene.add(grid);
        self.grid = grid;
    }
    //初始化地表
    initSurface() {
        const self = this;
        let data = self.original.grid, scene = self.scene;
        self.FBXLoader.load("./three/tzf/basemap.FBX", function (object) {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.receiveShadow = true;
                    let texture = new THREE.TextureLoader().load('./three/img/basemap.png');
                    let material = new THREE.MeshPhysicalMaterial({ emissive: "#fff", emissiveMap: texture, emissiveIntensity: 1, map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
                    child.rotateZ(-self.PI * 90);
                    child.material = material;
                }
            });
            object.position.set(41.497, 0, 24.06);
            scene.add(object);
        });
    }
    // 行车道路
    initLine() {
        const self = this;
        let data = self.original.grid, scene = self.scene;
        self.FBXLoader.load("./three/tzf/line_01.FBX", function (object) {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.receiveShadow = true;
                    let texture = new THREE.TextureLoader().load('./three/tzf/line01.png', function (texture) {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(1, 1);
                    });
                    child.material.emissiveMap = texture;
                    child.material.emissiveIntensity = 5;
                    child.material.emissive.set("#fff");
                    child.material.transparent = true;
                    child.material.depthWrite = true;
                    child.rotateZ(-self.PI * 90);
                }
            });
            self.original.lineObj = object;
            object.position.set(18.97, 0.2, 45.389);
            scene.add(object);
        });
    }
    //初始化FBX数据
    initFBXData() {
        const self = this;
        let data = self.original.FBXData, modelData = self.original.selectModel, scene = self.scene;
        self.FBXData = [];
        return new Promise(function (resolve, reject) {
            data.forEach((item, index) => {
                self.FBXLoader.load("./" + item.path, function (object) {
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            if (child.material instanceof Array) {
                                child.material.map((a, index) => {
                                    let texture = new THREE.TextureLoader().load("./three/tzf/" + a.name + ".png", function (texture) {
                                        texture.wrapS = THREE.RepeatWrapping;
                                        texture.wrapT = THREE.RepeatWrapping;
                                        texture.repeat.set(1, 1);
                                    });
                                    // a.color = "red";
                                    a.shininess = 200;
                                    a.clipShadows = true;
                                    a.emissiveMap = texture;
                                    a.emissiveIntensity = item.emissiveIntensity || 2;
                                    a.emissive.set("#00fcff");
                                    a.transparent = true;
                                    a.opacity = item.opacity || 1;
                                    return a;
                                });
                            }
                            else {
                                let pngs = ["tree_01"];
                                let texture = new THREE.TextureLoader().load("./" + item.path.replace(/tzf\/[\s\S]*$/gi, "tzf/") + child.material.name + (pngs.includes(child.material.name) ? ".png" : ".jpg"), function (texture) {
                                    texture.wrapS = THREE.RepeatWrapping;
                                    texture.wrapT = THREE.RepeatWrapping;
                                    texture.repeat.set(1, 1);
                                });
                                child.material = new THREE.MeshPhongMaterial({
                                    map: texture,
                                    color: modelData.color,
                                    transparent: true,
                                    lightMap: texture,
                                    lightMapIntensity: 0,
                                    reflectivity: true,
                                    opacity: item.opacity || 1,
                                    depthWrite: !pngs.includes(child.material.name),
                                    clipShadows: true,
                                    emissiveMap: texture,
                                    emissiveIntensity: 1.3,
                                    castShadow: true,
                                    receiveShadow: true,
                                    emissive: "#fff"
                                });
                            }
                            child.castShadow = true;
                            child.receiveShadow = true;
                            child.rotateZ(-self.PI * 90);
                        }
                    });
                    object.data = item;
                    object.position.set(item.x, item.y, item.z);
                    switch (item.matrix_code) {
                        case "2a8b5c89-8430-4d63-a8bb-975d89911a8f":
                            object.name = "田子坊综合服务点";
                            self.initTip(self.transPosition(object.position), object);
                            break;
                        case "ac119c88-1fb6-4b34-9077-dbd199ce6952":
                            object.name = "泰康菜场";
                            self.initTip(self.transPosition(object.position), object);
                            break;
                        case "d49881bc-a6ef-4862-8eb5-dea94c321be2":
                            object.name = "消防队";
                            self.initTip(self.transPosition(object.position), object);
                            break;
                        case "8dca6268-adca-4af6-bc46-d9bf9d5aad94":
                            object.name = "田子坊管理办";
                            self.initTip(self.transPosition(object.position), object);
                            break;
                    }
                    self.FBXData.push(object);
                    // scene.add(object);
                    if (index == data.length - 1) {
                        resolve(1);
                    }
                });
            });
        });
    }
    //生成模型包围盒实体，方便标签判断位置
    creatBoundingBox(object) {
        const self = this;
        //计算包围盒长宽高
        let Box = new THREE.Box3();
        Box.setFromObject(object);
        if (Box.isEmpty())
            return;
        let min = Box.min;
        let max = Box.max;
        let width = max.x - min.x;
        let height = max.y - min.y;
        let deepth = max.z - min.z;
        //计算包围盒中心点
        let centerX = (max.x + min.x) / 2;
        let centerY = (max.y + min.y) / 2 + 27;
        let centerZ = (max.z + min.z) / 2;
        //画一个boundingbox的cube实体
        let boxGeometry = new THREE.BoxGeometry(25, 25, 0);
        var materialArray = [];
        for (let i = 0; i < 6; i++) {
            materialArray.push(new THREE.MeshBasicMaterial({
                map: i > 3 ? new THREE.TextureLoader().load("./three/img/toolTip.png") : new THREE.TextureLoader().load(""),
                color: "rgba(255,255,0,0)",
                transparent: true,
                opacity: 1,
                side: THREE.BackSide
            }));
        }
        let boxMaterial = new THREE.MeshFaceMaterial(materialArray);
        let box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(centerX, centerY, centerZ);
        object.children.push(box);
        return box;
    }
    //初始渲染器
    initRenderer() {
        const self = this;
        let data = self.original.renderer, canvas = self.dom;
        let renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true //设置成透明
        });
        renderer.sortObjects = false;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(self.width, self.height);
        self.dom.appendChild(renderer.domElement);
        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        self.renderer = renderer;
    }
    initEffectComposer() {
        const self = this;
        let renderer = self.renderer;
        let renderPass = new RenderPass(self.scene, self.camera); //配置通道
        /*const bloomPass = new BloomPass(3, 10, 1.0, 256);
        bloomPass.renderToScreen=true;*/
        const outlinePass = new OutlinePass(new THREE.Vector2(self.width, self.height), self.scene, self.camera);
        outlinePass.renderToScreen = true;
        // console.info(outlinePass)
        // outlinePass.visibleEdgeColor = new THREE.Color(255,0,0);
        //outlinePass.tempPulseColor2 = new THREE.Color(255,0,0);
        outlinePass.visibleEdgeColor = new THREE.Color(255, 150, 0);
        outlinePass.tempPulseColor2 = new THREE.Color(255, 192, 40);
        outlinePass.edgeStrength = 2;
        outlinePass.edgeThickness = 4;
        outlinePass.selectedObjects = self.FBXData.slice(1, 4);
        // console.info(self.FBXData)
        // console.info(outlinePass.selectedObjects)
        /* let effectFXAA = new ShaderPass( THREE.FXAAShader );
         // effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
         effectFXAA.renderToScreen = true;*/
        /*    const filmPass = new FilmPass(
                0,   // noise intensity
                0,  // scanline intensity
                0,    // scanline count
                false,  // grayscale
            );
            filmPass.renderToScreen = true;*/
        // let webGLRenderer = new THREE.WebGLRenderer(renderer)
        // let marsMask = new MaskPass(self.scene, self.camera);
        let composer = new EffectComposer(renderer); //配置composer
        composer.addPass(renderPass); //将通道加入composer
        composer.addPass(outlinePass); //添加光效
        // composer.addPass(bloomPass);
        //  composer.addPass(filmPass);//输出到屏幕
        //composer.addPass(marsMask); // 添加月球掩膜通道，以后所有的通道效果都只对月球有效，直到clearMask通道
        // composer.addPass(effectColorify); // 添加颜色着色器通道
        // composer.addPass(clearMash); //清理掩膜通道
        self.composer = composer;
    }
    //初始化地图控制器
    initMapControl() {
        const self = this;
        let camera = self.camera, scene = self.scene;
        let controls = new MapControls(camera, self.renderer.domElement);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.1;
        controls.screenSpacePanning = true;
        controls.minDistance = 100;
        controls.maxDistance = 500;
        controls.maxPolarAngle = Math.PI / (180 / 80);
        controls.minPolarAngle = Math.PI / (180 / 30);
        controls.minAzimuthAngle = 100;
        controls.maxAzimuthAngle = 500;
        controls.minZoom = Math.PI / (180 / 10);
        controls.maxZoom = Math.PI / (180 / 80);
        controls.addEventListener('change', function (event) {
            self.controlChange(event.target);
        });
        controls.update();
        self.controls = controls;
    }
    //初始化模型控制器
    initModelControl() {
        const self = this;
        let camera = self.camera, scene = self.scene, data = self.original.modelControl;
        let controls = new OrbitControls(camera, self.renderer.domElement);
        controls.maxDistance = data.maxDistance;
        controls.minDistance = data.minDistance;
        controls.rotateSpeed = data.rotateSpeed;
        controls.zoomSpeed = data.zoomSpeed;
        controls.panSpeed = data.panSpeed;
        controls.maxPolarAngle = data.maxPolarAngle;
        controls.minPolarAngle = data.minPolarAngle;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.target = new THREE.Vector3(0, 0, 0);
        controls.addEventListener('change', function (event) {
            self.controlChange(event.target);
        });
        self.dom.addEventListener('mousewheel', function (event) {
            self.controlChange(event.target);
        });
        controls.update();
        self.controls = controls;
    }
    /***************事件************************/
    /**
     * 切换相机
     * @param type 相机类型
     * 1、正交相机
     * 2、透视相机
     */
    changeCamera(type) {
        const self = this;
        let scene = self.scene, camera = self.camera, renderer = self.renderer;
        switch (type * 1) {
            case 1:
                self.initOrthographicCamera();
                break;
            case 2:
                self.initPerspectiveCamera();
                break;
        }
    }
    /**
     * 控制改变
     * @param target 当前选中元素
     */
    controlChange(target) {
        const self = this;
        if (self.selectModel && self.selectModel.position) {
            self.modelChange(self.transPosition(self.selectModel.position), self.selectModel);
        }
        self.setMsgDomStyle();
        self.setToolTipDomStyle();
    }
    //给模型添加提示框
    addDom(models) {
        const self = this;
        self.clearDom();
        models.forEach(item => {
            let addDivDom = document.createElement('div');
            self.dom.insertBefore(addDivDom, self.dom.lastChild);
            addDivDom.id = item.uuid + "_tap";
            addDivDom.classList = 'three_tap';
            addDivDom.model = item;
            self.msgArray.push({ dom: addDivDom });
        });
        self.setMsgDomStyle();
        return self.msgArray;
    }
    //给模型提示框添加样式
    setMsgDomStyle() {
        const self = this;
        self.msgArray = self.msgArray.map(msg => {
            let dom = msg.dom;
            let position = self.transPosition(dom.model.position), model = dom.model;
            dom.style.width = model.msgWidth + "px";
            dom.style.height = model.msgHeight + "px";
            dom.style.left = (position.x - model.msgWidth / 2) + "px";
            dom.style.top = (position.y - model.msgHeight) + "px";
            return msg;
        });
    }
    initTip(position, item, className = "three_tooltip", iconClass) {
        const self = this;
        let addDivDom = document.createElement('div');
        let tipDom = document.createElement('div');
        tipDom.classList = iconClass;
        tipDom.innerHTML = item.name;
        addDivDom.appendChild(tipDom);
        self.dom.insertBefore(addDivDom, self.dom.lastChild);
        addDivDom.id = item.uuid + "_tap";
        addDivDom.classList = className;
        addDivDom.model = item;
        addDivDom.onclick = function () {
            if (item.click) {
                item.click(self.transPosition(item.position));
            }
        };
        addDivDom.style.left = (position.x - 10) + "px";
        addDivDom.style.top = (position.y - 20) + "px";
        self.toolTipArray.push({ dom: addDivDom, model: item });
    }
    //给模型提示框添加样式
    setToolTipDomStyle() {
        const self = this;
        self.toolTipArray = self.toolTipArray.map(msg => {
            let dom = msg.dom, model = dom.model, isClick = model.isClick;
            let position = self.transPosition(model.position);
            model.isClick = false;
            dom.style.left = (position.x - 10) + "px";
            dom.style.top = (position.y - 20) + "px";
            if (model.click && isClick) {
                model.isClick = true;
                model.click(position, true);
            }
            return msg;
        });
    }
    //清空提示文字
    clearToolTipDom(className) {
        const self = this;
        self.toolTipArray = self.toolTipArray.filter(msg => {
            let dom = msg.dom;
            if (dom && dom.classList.value.indexOf(className) != -1) {
                if (msg.model) {
                    self.deleteGroup(msg.model);
                }
                msg.dom.parentNode.removeChild(msg.dom);
            }
            else {
                return msg;
            }
        });
    }
    //模型加载完成
    onLoadModel() {
        const self = this;
        setTimeout(function () {
            if (self.onLoad instanceof Object) {
                self.onLoad();
            }
        }, 3000);
    }
    //鼠标点击触发事件
    mouseDown() {
        const self = this;
        let camera = self.camera, renderer = self.renderer, mouse = new THREE.Vector3();
        let raycaster = new THREE.Raycaster(), data = self.original.selectModel, FBXData = self.FBXData;
        //监听全局点击事件,通过ray检测选中哪一个object
        document.addEventListener("mousedown", (event) => {
            store.commit('CLICK_EVENT', false);
            if ((event.target.tagName == "CANVAS" || event.target.classList.value.indexOf("point2d") != -1) && event.button == 0 && self.isRunning) {
                mouse.set(((event.clientX - self.diffWidth) / self.width) * 2 - 1, -((event.clientY - self.diffHeight) / self.height) * 2 + 1, 1);
                // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
                raycaster.setFromCamera(mouse, camera);
                // 获取raycaster直线和所有3d模型相交的数组集合
                let intersects3D = raycaster.intersectObjects(FBXData, true).map(function (a) {
                    return a.object.parent;
                });
                store.commit('CHANGE_MODEL', false);
                if (intersects3D instanceof Array && intersects3D.length) {
                    intersects3D = [intersects3D[0]];
                    self.selectModel = false;
                    FBXData.forEach((object, index) => {
                        object.children = object.children.slice(0, 1);
                        if (intersects3D.includes(object)) {
                            if (object.data.isData) {
                                self.modelClick();
                                store.commit('CLICK_EVENT', true);
                                self.selectModel = object;
                                store.commit('CHANGE_MODEL', true);
                                if (self.selectModel && self.selectModel.position) {
                                    self.modelClick(self.transPosition(self.selectModel.position), self.selectModel);
                                }
                                object.traverse(function (child) {
                                    if (child.isMesh && !(child.material instanceof Array)) {
                                        child.material.opacity = 0.5;
                                        child.material.emissiveIntensity = 2;
                                        if (child.material.emissive) {
                                            child.material.emissive.set(object.msgData ? data.msgColor : data.activeColor);
                                        }
                                    }
                                });
                            }
                            /*  if(object.data.device_name){
                                  self.selectModel = object;
                                  store.commit('CLICK_EVENT', false)
                                  self.deviceClick(self.transPosition(self.selectModel.position),self.selectModel);
                              }*/
                        }
                        else {
                            object.traverse(function (child) {
                                if (child.isMesh && !(child.material instanceof Array)) {
                                    child.material.opacity = 1;
                                    child.material.emissiveIntensity = 1.3;
                                    if (child.material.emissive) {
                                        child.material.emissive.set(data.color);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }, false);
    }
    //鼠标经过
    mouseOver() {
        const self = this;
        self.map.on('mousemove', function (e) {
            var features = map.queryRenderedFeatures(e.point);
            console.info(features);
        });
    }
    //刷新
    running() {
        const self = this;
        let renderer = self.renderer, scene = self.scene, camera = self.camera, controls = self.controls;
        let stats = new Stats();
        let animate = function () {
            if (self.isRunning) {
                // renderer.clear();
                if (self.original.run) {
                    self.original.run(self.Delta);
                }
                renderer.render(scene, camera);
                if (self.composer.render) {
                    if (self.selectModel.position) {
                        self.composer.passes[1].selectedObjects = [self.selectModel];
                    }
                    else {
                        self.composer.passes[1].selectedObjects = [];
                    }
                    self.composer.render(delta); //使用组合器来渲染，而不再用webGLRenderer
                }
                // controls.update();
                // stats.update();
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    //窗口重置初始化
    windowResize() {
        const self = this;
        let camera = self.camera, renderer = self.renderer, composer = self.composer;
        window.addEventListener('resize', function () {
            self.width = self.dom.clientWidth;
            self.height = self.dom.clientHeight;
            camera.aspect = self.width / self.height;
            camera.updateProjectionMatrix();
            renderer.setSize(self.width, self.height);
            composer.setSize(self.width, self.height);
        }, false);
    }
    /*****************注销three*****************************/
    //清除模型提示框
    clearDom() {
        const self = this;
        self.msgArray.forEach(msg => {
            if (msg.model) {
                msg.model.destroy();
            }
            if (msg.container) {
                msg.container.destroy();
            }
            msg.dom.parentNode.removeChild(msg.dom);
        });
        self.msgArray = [];
    }
    //清除模型提示框
    clearMsgData() {
        const self = this;
        self.FBXData = self.FBXData.map(object => {
            delete object.msgData;
            return object;
        });
    }
    /**
     * 清除模型，模型中有 group 和 scene,需要进行判断,释放内存
     * @param scene
     * @returns
     */
    deleteGroupAndScene() {
        const self = this;
        let scene = self.scene;
        scene.children.forEach(currObj => {
            if (currObj instanceof THREE.Scene) {
                let children = currObj.children;
                for (let i = 0; i < children.length; i++) {
                    self.deleteGroup(children[i]);
                }
            }
            else {
                self.deleteGroup(currObj);
            }
            scene.remove(currObj);
        });
    }
    // 删除group，释放内存
    deleteGroup(group) {
        const self = this;
        let scene = self.scene;
        if (!group)
            return;
        // 删除掉所有的模型组内的mesh
        group.traverse(function (item) {
            if (item instanceof THREE.Mesh) {
                item.geometry.dispose(); // 删除几何体
                if (item.material instanceof Array) {
                    item.material.forEach(materialItem => {
                        materialItem.dispose(); // 删除材质
                    });
                }
                else {
                    item.material.dispose();
                }
            }
        });
        scene.remove(group);
    }
    destroyed() {
        const self = this;
        self.isRunning = false;
        self.clearDom();
        self.deleteGroupAndScene();
    }
    /***********************UTILS**********************************/
    //三维坐标转屏幕坐标
    transPosition(position = { x: 0, y: 0, z: 0 }) {
        const self = this;
        let world_vector = new THREE.Vector3(position.x, position.y, position.z);
        let vector = world_vector.project(self.camera);
        let halfWidth = self.width / 2, halfHeight = self.height / 2;
        /* return {*/
        /*     x:Math.round(vector.x * halfWidth + halfWidth),*/
        /*     y:Math.round(-vector.y * halfHeight + halfHeight)*/
        /* }*/
        return {
            x: Math.round((0.5 + vector.x / 2) * self.width),
            y: Math.round((0.5 - vector.y / 2) * self.height)
        };
    }
    /**
     * 已知两点获取两点之间在x坐标的3维向量坐标
     * @param x：当点的x坐标时
     * @param point1：起始点
     * @param point2：结束点
     * @returns {Vector3} 3维向量坐标
     */
    getLinePoint(x, point1, point2) {
        /* k = (y - point1.y)/(point2.y - point1.y);
         k * (point2.y - point1.y) = y - point1.y;
         y = k * (point2.y - point1.y) + point1.y
         同理得z
         */
        let k = 0, y = 0, z = 0;
        if (point2.x == point1.x) {
            if (point2.y == point1.y) {
                z = x;
                x = point2.x;
                y = point2.y;
            }
            else {
                k = (x - point1.y) / (point2.y - point1.y);
                y = x;
                x = point2.x;
                z = k * (point2.z - point1.z) + point1.z;
            }
        }
        else {
            k = (x - point1.x) / (point2.x - point1.x);
            y = k * (point2.y - point1.y) + point1.y;
            z = k * (point2.z - point1.z) + point1.z;
        }
        return new THREE.Vector3().set(x, y, z);
    }
    getPointAt(points) {
        const self = this, defaultPoint = { x: 0, y: 0, z: 0, t: 10000 };
        let index = self.patrolIndex, starPoint = Object.assign({}, defaultPoint, points[index]), endPoint = Object.assign({}, defaultPoint, points[index + 1]), direction = endPoint.x > starPoint.x ? 1 : -1, prevTime = self.patrolTime++, prevDelta = Math.abs(endPoint.x - starPoint.x) * prevTime * direction / (starPoint.t / 60), //增量
        prevX = prevDelta + starPoint.x, time = self.patrolTime, delta = Math.abs(endPoint.x - starPoint.x) * time * direction / (starPoint.t / 60), //增量
        x = delta + starPoint.x;
        if (direction == -1 && x <= endPoint.x || direction == 1 && x >= endPoint.x) {
            self.patrolTime = 0;
            if (index <= points.length - 1) {
                self.patrolIndex++;
            }
            else {
                self.patrolIndex = 0;
            }
        }
        return {
            prevPoint: self.getLinePoint(prevX, starPoint, endPoint),
            point: self.getLinePoint(x, starPoint, endPoint)
        };
    }
}
export { Mapbox };
