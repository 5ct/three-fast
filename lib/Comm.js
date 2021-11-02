var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as _THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { MapControls, OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { Fire } from 'three/examples/jsm/objects/Fire.js';
import { LightningStorm } from 'three/examples/jsm/objects/LightningStorm.js';
class Comm {
    constructor(options) {
        this._THREE = _THREE;
        this._CSS2DObject = CSS2DObject;
        this._Stats = Stats;
        this._FBXLoader = new FBXLoader();
        this._CLOCK = new _THREE.Clock();
        this._PI = Math.PI / 180;
        this.original = {};
        this.dom = {};
        this.curveIndex = 0;
        this.stormIndex = 1;
        this.stormTime = 0;
        this.isRunning = true;
        this.particles = []; //粒子的数组模型
        this.moveObjects = []; //移动物体的数组模型
        const self = this;
        options.width = options.dom.clientWidth;
        options.height = options.dom.clientHeight;
        options.scene = Object.assign({
            color: "#ddd",
            boxSize: [2000, 2000, 2000],
            fog: ["#16284e", 400, 700]
        }, options.scene);
        options.camera = Object.assign({
            position: [-252, 110, 106],
            target: [0, 0, 0],
            fov: 30,
            near: 1,
            far: 8000
        }, options.camera);
        options.helper = Object.assign({
            size: 100
        }, options.helper);
        options.hemisphereLight = Object.assign([{
                color: [0xffffff, 0x444444],
                position: [0, 1000, 1000]
            }], options.hemisphereLight);
        options.pointLight = Object.assign([{
                distance: 1000,
                intensity: 1,
                color: 0x444444,
                position: [0, 100, 500]
            }, {
                distance: 1000,
                intensity: 1,
                color: "#fff",
                position: [-200, -500, 500]
            }], options.pointLight);
        options.background = Object.assign({
            width: 220,
            height: 220,
            color: "rgba(165,85,23,0.6)"
        }, options.background);
        options.grid = Object.assign({
            size: 220,
            divisions: 40,
            color: ["rgb(255,0,255)", "rgb(255,255,0)"],
            opacity: 0.5
        }, options.grid);
        options.selectModel = Object.assign({
            color: "#00c0ff",
            activeColor: "#00c0ff",
            msgColor: "red"
        }, options.selectModel);
        options.control = Object.assign({
            type: "model",
            maxDistance: 1000,
            minDistance: 30,
            rotateSpeed: 0.5,
            zoomSpeed: 1.2,
            panSpeed: 0.8,
            maxPolarAngle: Math.PI / 180 * 120,
            minPolarAngle: Math.PI / 180 * 0
        }, options.control);
        Object.assign(self, options);
        self.original = options;
    }
    //初始化场景
    initScene() {
        const self = this;
        let data = self.original.scene, scene = new _THREE.Scene();
        let materialArray = [];
        for (let i = 0; i < data.imgs.length; i++) {
            materialArray.push(new _THREE.MeshBasicMaterial({
                map: new _THREE.TextureLoader().load(data.imgs[i]),
                side: _THREE.BackSide
            }));
        }
        let mesh = new _THREE.Mesh(new _THREE.BoxGeometry(data.boxSize[0], data.boxSize[1], data.boxSize[1]), new _THREE.MeshFaceMaterial(materialArray));
        mesh.layers.mask = -1;
        scene.add(mesh);
        scene.fog = new _THREE.Fog(data.fog[0], data.fog[1], data.fog[2]);
        self.scene = scene;
    }
    //初始化透视相机
    initPerspectiveCamera() {
        const self = this;
        let data = self.original.camera, camera = new _THREE.PerspectiveCamera(data.fov, self.width / self.height, data.near, data.far);
        let points = {
            position: new _THREE.Vector3().set(data.position.y, data.position.z, data.position.x),
            target: new _THREE.Vector3().set(data.target.y, data.target.z, data.target.x),
        };
        self.original.camera = points;
        camera.position.copy(points.position);
        camera.lookAt(points.target);
        self.camera = camera;
    }
    //初始化正交相机
    initOrthographicCamera() {
        const self = this;
        let data = self.original.camera, scene = self.scene, camera = new _THREE.OrthographicCamera(-self.width / 6, self.width / 6, self.height / 6, -self.height / 6, 1, 5000);
        let points = {
            position: new _THREE.Vector3().set(data.position.z, data.position.y, data.position.x),
            target: new _THREE.Vector3().set(data.target.z, data.target.y, data.target.z),
        };
        self.original.camera = points;
        camera.position.copy(points.position);
        camera.lookAt(points.target);
        self.camera = camera;
    }
    //初始化地图控制器
    initMapControl() {
        const self = this;
        let camera = self.camera, scene = self.scene, data = self.original.control;
        let controls = new MapControls(camera, self.renderer.domElement);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.1;
        controls.screenSpacePanning = true;
        controls.minDistance = data.minDistance;
        controls.maxDistance = data.maxDistance;
        controls.maxPolarAngle = data.maxPolarAngle;
        controls.minPolarAngle = data.minPolarAngle;
        controls.minAzimuthAngle = data.minAzimuthAngle;
        controls.maxAzimuthAngle = data.maxAzimuthAngle;
        controls.minZoom = data.minZoom;
        controls.maxZoom = data.maxZoom;
        controls.addEventListener("change", function (event) {
            self.controlChange(event.target);
        });
        controls.update();
        self.controls = controls;
    }
    //初始化模型控制器
    initModelControl() {
        const self = this;
        let camera = self.camera, scene = self.scene, data = self.original.control;
        let controls = new OrbitControls(camera, self.labelRenderer.domElement);
        controls.maxDistance = data.maxDistance;
        controls.minDistance = data.minDistance;
        controls.rotateSpeed = data.rotateSpeed;
        controls.zoomSpeed = data.zoomSpeed;
        controls.panSpeed = data.panSpeed;
        controls.maxPolarAngle = data.maxPolarAngle;
        controls.enablePan = data.enablePan;
        controls.minPolarAngle = data.minPolarAngle;
        controls.staticMoving = data.staticMoving || true;
        controls.dynamicDampingFactor = data.dynamicDampingFactor || 0.3;
        controls.target = self.original.camera.target;
        controls.addEventListener("change", function (event) {
            self.controlChange(event.target);
        });
        self.dom.addEventListener("mousewheel", function (event) {
            self.controlChange(event.target);
        });
        controls.update();
        self.controls = controls;
    }
    //初始化拖拽控制器
    initDragControl(objects) {
        const self = this;
        self.initTransformControl();
        let dragControls = new DragControls(objects, self.camera, self.labelRenderer.domElement); //
        dragControls.enabled = false;
        // 鼠标略过事件
        dragControls.addEventListener('hoveron', function (event) {
            self.transformControl.attach(event.object);
            self.cancelHideTransform();
        });
        dragControls.addEventListener('hoveroff', function () {
            self.delayHideTransform();
        });
        self.dragControls = dragControls;
    }
    //初始化拖拽控制器
    initTransformControl() {
        const self = this;
        let transformControl = new TransformControls(self.camera, self.labelRenderer.domElement);
        self.transformControl = transformControl;
        transformControl.addEventListener('dragging-changed', function (event) {
            self.controls.enabled = !event.value;
        });
        transformControl.addEventListener('change', function () {
            self.cancelHideTransform();
        });
        transformControl.addEventListener('mouseDown', function () {
            self.cancelHideTransform();
        });
        transformControl.addEventListener('mouseUp', function () {
            self.delayHideTransform();
        });
        self.scene.add(transformControl);
    }
    hideTransform() {
        const self = this;
        self.hiding = setTimeout(function () {
            self.transformControl.detach(self.transformControl.object);
        }, 2500);
    }
    cancelHideTransform() {
        const self = this;
        if (self.hiding)
            clearTimeout(self.hiding);
    }
    delayHideTransform() {
        const self = this;
        self.cancelHideTransform();
        self.hideTransform();
    }
    //初始化自然光
    initHemisphereLight() {
        const self = this;
        let data = self.original.hemisphereLight, scene = self.scene;
        self.hemisphereLight = [];
        data.forEach(item => {
            let light = new _THREE.HemisphereLight(item.color[0], item.color[1]);
            light.position.set(item.position[0], item.position[1], item.position[2]);
            scene.add(light);
            self.hemisphereLight.push(light);
        });
    }
    //初始化点光
    initPointLight() {
        const self = this;
        let data = self.original.pointLight, scene = self.scene, sphere = new _THREE.SphereBufferGeometry(0.5, 16, 8);
        self.pointLight = [];
        data.forEach(item => {
            let light = new _THREE.PointLight(item.color, item.intensity, item.distance);
            light.add(new _THREE.Mesh(sphere, new _THREE.MeshBasicMaterial({ color: item.color })));
            light.position.set(item.position[0], item.position[1], item.position[2]);
            scene.add(light);
            self.pointLight.push(light);
        });
    }
    //模型加载完成
    onLoadModel() {
        const self = this;
        if (self.onLoad instanceof Object) {
            self.onLoad();
        }
    }
    //生成模型包围盒实体，方便标签判断位置
    creatBoundingBox(object) {
        const self = this;
        //计算包围盒长宽高
        let Box = new _THREE.Box3();
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
        let boxGeometry = new _THREE.BoxGeometry(25, 25, 0);
        var materialArray = [];
        for (let i = 0; i < 6; i++) {
            materialArray.push(new _THREE.MeshBasicMaterial({
                map: i > 3 ? new _THREE.TextureLoader().load("./_THREE/img/toolTip.png") : new _THREE.TextureLoader().load(""),
                color: "rgba(255,255,0,0)",
                transparent: true,
                opacity: 1,
                side: _THREE.BackSide
            }));
        }
        let boxMaterial = new _THREE.MeshFaceMaterial(materialArray);
        let box = new _THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(centerX, centerY, centerZ);
        object.children.push(box);
        return box;
    }
    //初始化移动数据
    initMoveData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            Object.assign(data, data.line[0]);
            return new Promise(function (resolve, reject) {
                self.loadFBXData(data).then(object => {
                    let curveObject = self.initMoveLine(data);
                    object.curveObject = curveObject;
                    self.moveObjects.push(object);
                    resolve([object, curveObject]);
                });
            });
        });
    }
    initMoveLine(data) {
        const self = this, _THREE = self._THREE, scene = self.scene;
        let positions = [];
        data.line.forEach(point => {
            if (point) {
                let geometry = new _THREE.BoxBufferGeometry(0.5, 0.5, 0.5), newPoint = new _THREE.Vector3(point.x, point.y, point.z);
                let mesh = new _THREE.Mesh(geometry, new _THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
                mesh.position.copy(newPoint);
                scene.add(mesh);
                positions.push(newPoint);
            }
        });
        let curve = new _THREE.CatmullRomCurve3(positions, true, data.curveType || 'catmullrom', data.tension != undefined ? data.tension : 0.5), points = curve.getPoints(data.number);
        let geometry = new _THREE.BufferGeometry().setFromPoints(points);
        let material = new _THREE.LineBasicMaterial({
            color: 0xff0000,
            opacity: 0.35,
            linecap: 'round',
            linejoin: 'round',
            fog: false
        });
        let curveObject = new _THREE.Line(geometry, material);
        curveObject.curve = curve;
        return curveObject;
    }
    //初始渲染器
    initRenderer() {
        const self = this;
        let data = self.original.renderer, canvas = self.dom;
        let renderer = new self._THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            // 把自动清除颜色缓存关闭 这个如果不关闭 后期处理这块会不能有效显示
            // 书上的描述是 如果不这样做，每次调用效果组合器的render()函数时，之前渲染的场景会被清理掉。通过这种方法，我们只会在render循环开始时，把所有东西清理一遍。
            autoClear: false,
        });
        renderer.sortObjects = false;
        renderer.toneMapping = 1;
        // 背景透明 配合 alpha
        renderer.setClearColor(0xffffff, 0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(self.width, self.height);
        self.dom.appendChild(renderer.domElement);
        self.renderer = renderer;
        let labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(self.width, self.height);
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0";
        labelRenderer.domElement.style.outline = "none";
        labelRenderer.domElement.style.border = "none";
        self.dom.appendChild(labelRenderer.domElement);
        self.labelRenderer = labelRenderer;
    }
    //实时渲染
    render() {
        const self = this;
        let renderer = self.renderer, scene = self.scene, camera = self.camera, controls = self.controls;
        let delta = self._CLOCK.getDelta();
        renderer.clear();
        self.renderParticles();
        self.renderStorm();
        if (self.original.run) {
            self.original.run(delta);
        }
        if (controls && controls.update) {
            controls.update();
        }
        if (self.moveObjects && self.moveObjects.length) {
            self.moveObjects.forEach(group => {
                let data = group.data;
                if (data.isRunning) {
                    let curve = group.curveObject.curve, time = data.time / 60;
                    if (data.path) {
                        group.position.copy(curve.getPoint(self.curveIndex++ / time, new _THREE.Vector3()));
                        group.lookAt(curve.getPoint((self.curveIndex + 1) / time, new _THREE.Vector3()));
                    }
                    else {
                        camera.position.copy(curve.getPoint(self.curveIndex++ / time, new _THREE.Vector3()));
                        camera.lookAt(curve.getPoint((self.curveIndex + 1) / time, new _THREE.Vector3()));
                    }
                }
            });
        }
        if (self.Mixer)
            self.Mixer.update(delta);
        renderer.render(scene, camera);
        self.labelRenderer.render(scene, camera);
    }
    //窗口重置初始化
    windowResize() {
        const self = this;
        let camera = self.camera, renderer = self.renderer, composer = self.composer;
        window.addEventListener("resize", function () {
            self.width = self.dom.clientWidth;
            self.height = self.dom.clientHeight;
            camera.aspect = self.width / self.height;
            camera.updateProjectionMatrix();
            renderer.setSize(self.width, self.height);
            composer.setSize(self.width, self.height);
        }, false);
    }
    /*****************事件*****************************/
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
    /*****************注销_THREE*****************************/
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
            if (currObj instanceof _THREE.Scene) {
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
    // 删除object，释放内存
    deleteGroup(object) {
        const self = this;
        let scene = self.scene;
        if (!object)
            return;
        // 删除掉所有的模型组内的mesh
        object.traverse(function (item) {
            if (item instanceof _THREE.Mesh) {
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
        scene.remove(object);
    }
    destroyed() {
        const self = this;
        self.isRunning = false;
        self.clearDom();
        self.deleteGroupAndScene();
    }
    /***********************辅助工具**********************************/
    //生成粒子的方法
    createParticles(options = {}) {
        const self = this, scene = self.scene;
        options = Object.assign({
            range: 1200,
            size: 10,
            transparent: true,
            number: 15000,
            opacity: 0.7,
            vertexColors: true,
            sizeAttenuation: true,
            depthTest: false,
            speed: {
                y: 1
            },
            img: "",
            color: "#fff"
        }, options);
        return new Promise(function (resolve, reject) {
            let texture = new _THREE.TextureLoader().load(options.img), range = options.range;
            //存放粒子数据的网格
            let geom = new _THREE.Geometry();
            //样式化粒子的THREE.PointCloudMaterial材质
            let material = new _THREE.PointCloudMaterial({
                size: options.size,
                maxSize: 20,
                transparent: options.transparent,
                opacity: options.opacity,
                vertexColors: options.vertexColors,
                sizeAttenuation: options.sizeAttenuation,
                color: options.color,
                map: texture,
                depthTest: options.depthTest //设置解决透明度有问题的情况
            });
            for (let i = 0; i < options.number; i++) {
                //添加顶点的坐标
                let particle = new _THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
                particle.velocityY = 0.1 + Math.random() / 5;
                particle.velocityX = (Math.random() - 0.5) / 3;
                geom.vertices.push(particle);
                //随机当前每个粒子的亮度
                // color.setHSL(color.getHSL().h, color.getHSL().s, Math.random() * color.getHSL().l);
                geom.colors.push(new _THREE.Color(0xffffff));
            }
            //生成模型，添加到场景当中
            let particle = new _THREE.Points(geom, material);
            particle.data = options;
            particle.verticesNeedUpdate = true;
            self.particles.push(particle);
            resolve(particle);
        });
    }
    //动态渲染粒子的方法
    renderParticles() {
        const self = this;
        let particles = self.particles;
        particles.forEach(particle => {
            let speed = particle.data.speed;
            //产生雨滴动画效果
            particle.geometry.vertices.forEach(function (v) {
                v.y = v.y - (v.velocityY) * speed.y;
                v.x = v.x - (v.velocityX) * .5;
                if (v.y <= -60)
                    v.y = 60;
                if (v.x <= -20 || v.x >= 20)
                    v.velocityX = v.velocityX * -1;
            });
            //设置实时更新网格的顶点信息
            particle.geometry.verticesNeedUpdate = true;
        });
    }
    //生成雷击的方法
    createStorm(options = {}) {
        const self = this, scene = self.scene;
        let lightningMaterial = new _THREE.MeshBasicMaterial({ color: new _THREE.Color(0xB0FFFF) });
        let rayDirection = new _THREE.Vector3(0, -1, 0);
        let rayLength = 0;
        let vec1 = new _THREE.Vector3();
        let vec2 = new _THREE.Vector3();
        options = Object.assign({
            radius0: 1,
            radius1: 0.5,
            minRadius: 0.3,
            maxIterations: 7,
            timeScale: 0.05,
            propagationTimeFactor: 0.1,
            vanishingTimeFactor: 0.9,
            subrayPeriod: 5,
            subrayDutyCycle: 0.6,
            maxSubrayRecursion: 3,
            ramification: 5,
            recursionProbability: 0.4,
            roughness: 0.85,
            straightness: 0.65,
            onSubrayCreation: function (segment, parentSubray, childSubray, lightningStrike) {
                lightningStrike.subrayConePosition(segment, parentSubray, childSubray, 0.6, 0.6, 0.5);
                // Plane projection
                rayLength = lightningStrike.rayParameters.sourceOffset.y;
                vec1.subVectors(childSubray.pos1, lightningStrike.rayParameters.sourceOffset);
                let proj = rayDirection.dot(vec1);
                vec2.copy(rayDirection).multiplyScalar(proj);
                vec1.sub(vec2);
                let scale = proj / rayLength > 0.5 ? rayLength / proj : 1;
                vec2.multiplyScalar(scale);
                vec1.add(vec2);
                childSubray.pos1.addVectors(vec1, lightningStrike.rayParameters.sourceOffset);
            }
        }, options);
        // 雷击的标记
        let starVertices = [];
        let prevPoint = new _THREE.Vector3(0, 0, 1);
        let currPoint = new _THREE.Vector3();
        let number = 2;
        for (let i = 1; i <= number; i++) {
            currPoint.set(Math.sin(2 * Math.PI * i / number), 0, Math.cos(2 * Math.PI * i / number));
            if (i % 2 === 1) {
                currPoint.multiplyScalar(0.3);
            }
            starVertices.push(0, 0, 0);
            starVertices.push(prevPoint.x, prevPoint.y, prevPoint.z);
            starVertices.push(currPoint.x, currPoint.y, currPoint.z);
            prevPoint.copy(currPoint);
        }
        let starGeometry = new _THREE.BufferGeometry();
        starGeometry.setAttribute('position', new _THREE.Float32BufferAttribute(starVertices, 3));
        let starMesh = new _THREE.Mesh(starGeometry, new _THREE.MeshBasicMaterial({ color: new _THREE.Color(0xB0FFFF) }));
        starMesh.scale.multiplyScalar(6);
        let storm = new LightningStorm({
            size: 1200,
            minHeight: 400,
            maxHeight: 600,
            maxSlope: 0.3,
            maxLightnings: 30,
            lightningParameters: options,
            lightningMaterial: lightningMaterial,
            onLightningDown: function (lightning) {
                console.info(lightning);
                let star1 = starMesh.clone();
                star1.position.copy(lightning.rayParameters.destOffset);
                star1.position.y = 0.05;
                star1.rotation.y = 2 * Math.PI * Math.random();
                console.info(star1);
                scene.add(star1);
            }
        });
        console.info(storm);
        scene.add(storm);
        self.createOutline(storm.lightningsMeshes, rgb(255, 0, 255));
        self.storm = storm;
    }
    renderStorm() {
        const self = this;
        self.stormTime += self.stormIndex * self._CLOCK.getDelta() * 30;
        if (self.storm && self.storm.update) {
            self.storm.update(self.stormTime);
        }
    }
    createFire(object) {
        const self = this;
        var plane = new _THREE.BufferGeometry();
        let params = {};
        params.windX = 0.0;
        params.windY = 0.75;
        params.colorBias = 0.8;
        params.burnRate = 0.3;
        params.diffuse = 1.33;
        params.viscosity = 0.25;
        params.expansion = -0.25;
        params.swirl = 50.0;
        params.drag = 0.35;
        params.airSpeed = 12.0;
        params.speed = 500.0;
        params.massConservation = false;
        let fire = new Fire(plane, Object.assign({
            textureWidth: 512,
            textureHeight: 512,
            debug: false
        }, params));
        fire.position.copy(object.position);
        fire.clearSources();
        fire.addSource(0.5, 0.1, 0.1, 1.0, 0.0, 1.0);
        self.scene.add(fire);
    }
    renderFire() {
        const self = this;
        // Fire
        var plane = new _THREE.PlaneBufferGeometry(20, 20);
        let fire = new Fire(plane, {
            textureWidth: 512,
            textureHeight: 512,
            debug: false
        });
    }
    createOutline(objectsArray, visibleColor) {
        const self = this, composer = self.composer, scene = self.scene, camera = self.camera;
        let outlinePass = new OutlinePass(new _THREE.Vector2(self.width, self.height), scene, camera, objectsArray);
        outlinePass.edgeStrength = 2.5;
        outlinePass.edgeGlow = 0.7;
        outlinePass.edgeThickness = 2.8;
        outlinePass.visibleEdgeColor = visibleColor;
        outlinePass.hiddenEdgeColor.set(0);
        composer.addPass(outlinePass);
        scene.userData.outlineEnabled = true;
        return outlinePass;
    }
    //初始化坐标轴
    initHelper() {
        const self = this;
        let data = self.original.helper;
        if (data) {
            let helper = new _THREE.AxesHelper(data.size);
            self.scene.add(helper);
        }
    }
    //初始化辅助线
    initHelperLine() {
        const self = this;
        let scene = self.scene, point = new _THREE.Vector3(), geometry = new _THREE.BoxBufferGeometry(1, 1, 1);
        let splineHelperObjects = [], splinePointsLength = 4, positions = [], splines = {}, ARC_SEGMENTS = 300;
        let addLine = {
            line: [{ x: 14.271522112544734, y: 23.486780619037344, z: 109.01322214336776 },
                { x: -5.56300074753207, y: 11.49711742836848, z: -1.495472686253045 },
                { x: 16.647128850770535, y: 40.78006211141001, z: 13.345086460742316 },
                { x: -77.97301509626567, y: 31.913872568581315, z: -44.55679763538218 }],
            init() {
                const that = this;
                that.load(that.line.map(point => {
                    return new _THREE.Vector3(point.x, point.y, point.z);
                }));
            },
            addSplineObject(position) {
                let object = new _THREE.Mesh(geometry, new _THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
                if (position) {
                    object.position.copy(position);
                }
                else {
                    object.position.x = Math.random() * 100 - 50;
                    object.position.y = Math.random() * 60;
                    object.position.z = Math.random() * 80 - 40;
                }
                object.castShadow = true;
                object.receiveShadow = true;
                scene.add(object);
                splineHelperObjects.push(object);
                return object;
            },
            addPoint() {
                splinePointsLength++;
                positions.push(addLine.addSplineObject().position);
                addLine.updateSplineOutline();
            },
            removePoint() {
                if (splinePointsLength <= 4) {
                    return;
                }
                splinePointsLength--;
                positions.pop();
                scene.remove(splineHelperObjects.pop());
                addLine.updateSplineOutline();
            },
            updateSplineOutline() {
                for (let k in splines) {
                    let spline = splines[k];
                    let position = spline.mesh.geometry.attributes.position;
                    for (let i = 0; i < ARC_SEGMENTS; i++) {
                        let t = i / (ARC_SEGMENTS - 1);
                        spline.getPoint(t, point);
                        position.setXYZ(i, point.x, point.y, point.z);
                    }
                    position.needsUpdate = true;
                }
            },
            exportSpline() {
                const that = this;
                let strPlace = [];
                String.prototype.format = function () {
                    let str = this;
                    for (let i = 0; i < arguments.length; i++) {
                        str = str.replace('{' + i + '}', arguments[i]);
                    }
                    return str;
                };
                for (let i = 0; i < splinePointsLength; i++) {
                    let p = splineHelperObjects[i].position;
                    strPlace.push('{x:{0}, y:{1}, z:{2}}'.format(p.x, p.y, p.z));
                }
                let code = '[' + (strPlace.join(',\n\t')) + ']';
                prompt('copy and paste code', code);
            },
            load(new_positions) {
                while (new_positions.length > positions.length) {
                    addLine.addPoint();
                }
                while (new_positions.length < positions.length) {
                    addLine.removePoint();
                }
                for (let i = 0; i < positions.length; i++) {
                    positions[i].copy(new_positions[i]);
                }
                addLine.updateSplineOutline();
            }
        };
        self.initDragControl(splineHelperObjects);
        self.transformControl.addEventListener('objectChange', function () {
            addLine.updateSplineOutline();
        });
        self.transformControl.addEventListener('change', function () {
            splines.uniform.mesh.visible = params.uniform;
            splines.centripetal.mesh.visible = params.centripetal;
            splines.chordal.mesh.visible = params.chordal;
            self.render();
        });
        for (let i = 0; i < splinePointsLength; i++) {
            addLine.addSplineObject(positions[i]);
        }
        positions = [];
        for (let i = 0; i < splinePointsLength; i++) {
            positions.push(splineHelperObjects[i].position);
        }
        let geometry1 = new _THREE.BufferGeometry();
        geometry1.setAttribute('position', new _THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));
        let curve = new _THREE.CatmullRomCurve3(positions);
        curve.curveType = 'catmullrom';
        curve.mesh = new _THREE.Line(geometry1.clone(), new _THREE.LineBasicMaterial({
            color: 0xff0000,
            opacity: 0.35,
        }));
        splines.uniform = curve;
        curve = new _THREE.CatmullRomCurve3(positions);
        curve.curveType = 'centripetal';
        curve.mesh = new _THREE.Line(geometry1.clone(), new _THREE.LineBasicMaterial({
            color: 0x00ff00,
            opacity: 0.35
        }));
        splines.centripetal = curve;
        curve = new _THREE.CatmullRomCurve3(positions);
        curve.curveType = 'chordal';
        curve.mesh = new _THREE.Line(geometry1.clone(), new _THREE.LineBasicMaterial({
            color: 0x0000ff,
            opacity: 0.35
        }));
        splines.chordal = curve;
        for (let k in splines) {
            scene.add(splines[k].mesh);
        }
        let gui = new GUI(), params = {
            uniform: true,
            tension: 0.5,
            centripetal: true,
            chordal: true,
            addPoint: addLine.addPoint,
            removePoint: addLine.removePoint,
            exportSpline: addLine.exportSpline
        };
        gui.add(params, 'uniform');
        gui.add(params, 'tension', 0, 1).step(0.01).onChange(function (value) {
            splines.uniform.tension = value;
            addLine.updateSplineOutline();
        });
        gui.add(params, 'centripetal');
        gui.add(params, 'chordal');
        gui.add(params, 'addPoint');
        gui.add(params, 'removePoint');
        gui.add(params, 'exportSpline');
        gui.open();
        addLine.init();
        self.splines = splines;
    }
    //加载FBX模型
    loadFBXData(data) {
        const self = this;
        let modelData = self.original.selectModel;
        return new Promise(function (resolve, reject) {
            self._FBXLoader.load("./" + data.path, function (object) {
                if (data.lable) {
                    self.initText(object, data);
                }
                /*if(data.fire){
                    self.createFire(object);
                }*/
                object.traverse(function (child) {
                    child.layers.mask = data.bloom ? data.bloom : -1;
                    if (child.isMesh) {
                        if (child.material instanceof Array) {
                            child.material.map((a, index) => {
                                let name = a.name, baseUrl = "./" + data.path.replace(/tzf\/[\s\S]*$/gi, "tzf/");
                                let imgName = name.indexOf("_png") != -1 ? name.replace(/_png/gi, ".png") : name.indexOf("_jpg") != -1 ? name.replace(/_jpg/gi, ".jpg") : (a.name + ".png");
                                let texture = new self._THREE.TextureLoader().load(data.img || (baseUrl + imgName), function (texture) {
                                    texture.wrapS = self._THREE.RepeatWrapping;
                                    texture.wrapT = self._THREE.RepeatWrapping;
                                    texture.repeat.set(1, 1);
                                });
                                Object.assign(a, Object.assign({
                                    map: texture,
                                    reflectivity: 1,
                                    shininess: 10,
                                    clipShadows: true,
                                    depthWrite: false,
                                    emissiveMap: texture,
                                    emissiveIntensity: 1,
                                    transparent: true,
                                    opacity: 1
                                }, data));
                                a.emissive.set("#fff");
                                return a;
                            });
                        }
                        else {
                            let name = child.material.name, baseUrl = "./" + data.path.replace(/tzf\/[\s\S]*$/gi, "tzf/");
                            let imgName = name.indexOf("_png") != -1 ? name.replace(/_png/gi, ".png") : name.indexOf("_jpg") != -1 ? name.replace(/_jpg/gi, ".jpg") : (child.material.name + ".jpg");
                            let texture = new self._THREE.TextureLoader().load(baseUrl + (data.img || imgName), function (texture) {
                                texture.wrapS = self._THREE.RepeatWrapping;
                                texture.wrapT = self._THREE.RepeatWrapping;
                                texture.repeat.set(1, 1);
                            });
                            if (!data.isPerson) {
                                child.material = new self._THREE.MeshPhongMaterial({
                                    map: texture,
                                    color: modelData.color,
                                    transparent: data.transparent ? data.transparent : true,
                                    lightMap: texture,
                                    lightMapIntensity: 0,
                                    reflectivity: true,
                                    opacity: data.opacity || 1,
                                    depthWrite: data.depthWrite,
                                    clipShadows: true,
                                    emissiveMap: texture,
                                    emissiveIntensity: data.emissiveIntensity || 0.5,
                                    castShadow: true,
                                    receiveShadow: true,
                                    emissive: "#fff"
                                });
                            }
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.rotateZ(-self._PI * (data.rotateZ != undefined ? data.rotateZ : 90));
                        child.rotateX(-self._PI * (data.rotateX != undefined ? data.rotateX : 0));
                        child.rotateY(-self._PI * (data.rotateY != undefined ? data.rotateY : 0));
                    }
                });
                object.layers.mask = data.bloom ? data.bloom : -1;
                object.data = data;
                object.position.set(data.x, data.y, data.z);
                resolve(object);
            });
        });
    }
    //初始化网格
    initGrid() {
        const self = this;
        let data = self.original.grid, scene = self.scene;
        let grid = new _THREE.GridHelper(data.size, data.divisions, data.color[0], data.color[1]);
        grid.material.opacity = data.opacity;
        grid.material.transparent = true;
        scene.add(grid);
        self.grid = grid;
    }
    //三维坐标转屏幕坐标
    transPosition(position = { x: 0, y: 0, z: 0 }) {
        const self = this;
        let world_vector = new _THREE.Vector3(position.x, position.y, position.z);
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
        return new _THREE.Vector3().set(x, y, z);
    }
    getPointAt(points) {
        const self = this, defaultPoint = { x: 0, y: 0, z: 0, t: 10000 };
        let index = self.patrolIndex, starPoint = Object.assign({}, defaultPoint, points[index]), endPoint = Object.assign({}, defaultPoint, points[index + 1]), direction = endPoint.x > starPoint.x ? 1 : -1, prevTime = self.patrolTime++, prevDelta = Math.abs(endPoint.x - starPoint.x) * prevTime * direction / (starPoint.t / 60), //增量
        prevX = prevDelta + starPoint.x, time = self.patrolTime, delta = Math.abs(endPoint.x - starPoint.x) * time * direction / (starPoint.t / 60), //增量
        x = delta + starPoint.x;
        if (direction == -1 && x <= endPoint.x || direction == 1 && x >= endPoint.x) {
            if (index <= points.length - 1) {
                self.patrolIndex++;
            }
            else {
                self.patrolIndex = 0;
                self.patrolTime = 0;
            }
        }
        else {
            self.patrolIndex = 0;
        }
        return {
            prevPoint: self.getLinePoint(prevX, starPoint, endPoint),
            point: self.getLinePoint(x, starPoint, endPoint)
        };
    }
    /*=====================模型筛选===========================*/
    /**
     * 通过UUID查询存在模型
     * @param uuid 模型唯一id
     * @return {Array} 查询到的模型列表
     */
    findFBXDataByUUID(uuid) {
        return this.FBXData.filter(object => {
            if (object.uuid == uuid) {
                return object;
            }
        });
    }
    /**
     * 通过模型名称查询存在模型
     * @param name 模型名称
     * @return {Array} 查询到的模型列表
     */
    findFBXDataByName(name) {
        return this.FBXData.filter(object => {
            if (object.data.name == name) {
                return object;
            }
        });
    }
    /**
     * 通过UUID查询是否存在模型
     * @param uuid 模型唯一id
     */
    isExistFBXDataByUUID(uuid) {
        return Boolean(this.FBXData.filter(object => {
            if (object.uuid == uuid) {
                return object;
            }
        }).length);
    }
    /**
     * 通过模型名称查询是否存在模型
     * @param name 模型名称
     */
    isExistFBXDataByName(name) {
        return Boolean(this.FBXData.filter(object => {
            if (object.data.name == name) {
                return object;
            }
        }).length);
    }
    /**
     * 通过UUID隐藏或显示模型
     * @param uuid 模型唯一id
     * @param isHide 是否隐藏
     */
    isHideFBXDataByUUID(uuid, isHide = false) {
        const self = this;
        self.FBXData.map(object => {
            if (object.uuid == uuid) {
                object.visible = isHide;
            }
            return object;
        });
    }
    /**
     * 通过模型名称隐藏或显示模型
     * @param name 模型名称
     * @param isHide 是否隐藏
     */
    isHideFBXDataByName(name, isHide = false) {
        const self = this;
        self.FBXData.map(object => {
            if (object.data.name == name) {
                object.visible = isHide;
            }
            return object;
        });
    }
    /**
     * 通过UUID删除模型
     * @param uuid 模型唯一id
     * @param isHide 是否隐藏
     */
    deleteFBXDataByUUID(uuid) {
        this.FBXData = this.FBXData.filter(object => {
            if (object.uuid == uuid) {
                return object;
            }
        });
    }
    /**
     * 通过模型名称删除模型
     * @param name 模型名称
     */
    deleteFBXDataByName(name) {
        this.FBXData = this.FBXData.filter(object => {
            if (object.data.name == name) {
                return object;
            }
        });
    }
}
export { Comm };
