import * as THREE from "three";
let deepAssign = require('deep-assign');
require("./TweenMax.min");
import { Bounce, TimelineLite, TimelineMax } from "gsap";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
export class Base {
    constructor(scope = this) {
        this.$scope = {};
        this.Width = 0;
        this.Height = 0;
        this.preserveDrawingBuffer = false;
        this.diffWidth = 0;
        this.diffHeight = 0;
        this.deepAssign = deepAssign;
        this.TimelineLite = TimelineLite;
        this.TimelineMax = TimelineMax;
        this.TweenMax = window.TweenMax; //动画库
        this.Bounce = Bounce; //
        this.THREE = THREE; //ThreeJs-依赖
        this.Stats = new Stats(); //状态
        this.CLOCK = new THREE.Clock(); //时钟
        this.Angle = Math.PI / 180; //角度
        //随机显示单个mesh
        this.randomMeshShow = {
            clear(object) {
                if (!object)
                    return;
                object.traverse(child => {
                    if (child.isMesh) {
                        child.visible = false;
                    }
                });
            },
            full(object) {
                object.traverse(child => {
                    if (child.isMesh) {
                        child.visible = true;
                    }
                });
            },
            add(object, number) {
                const self = this;
                let meshs = [];
                if (object) {
                    if (!object || number <= 0)
                        return;
                    object.traverse(child => {
                        if (child.isMesh) {
                            if (!child.visible) {
                                meshs.push(child);
                            }
                        }
                    });
                    let index = Math.floor((meshs.length - 1) * Math.random());
                    meshs.forEach((mesh, i) => {
                        mesh.visible = i == index;
                    });
                    this.add(object, number - 1);
                }
            },
            sub(object) {
                const self = this;
                let meshs = [];
                object.traverse(child => {
                    if (child.isMesh) {
                        if (child.visible) {
                            meshs.push(child);
                        }
                    }
                });
                let index = Math.floor((meshs.length - 1) * Math.random());
                meshs.forEach((mesh, i) => {
                    mesh.visible = i == index ? false : true;
                });
            },
            save(object) {
                const self = this;
                let meshs = [];
                object.traverse(child => {
                    if (child.isMesh) {
                        if (child.visible) {
                            meshs.push(child);
                        }
                    }
                });
                object.saveMeshStatues = meshs;
            },
            reset(object) {
                const self = this;
                let saveMesh = object.saveMeshStatues;
                if (!saveMesh || !saveMesh.length)
                    return;
                saveMesh.forEach((mesh, i) => {
                    mesh.visible = true;
                });
            }
        };
        this.initAttr(scope);
        this.$scope = scope;
    }
    initAttr(scope) {
        for (let item in scope) {
            this[item] = scope[item];
        }
    }
    //初始化渲染器
    initRenderer() {
        const self = this;
        let renderer = new self.THREE.WebGLRenderer({
            preserveDrawingBuffer: self.preserveDrawingBuffer,
            antialias: true,
            alpha: false,
            autoClear: false,
        });
        renderer.sortObjects = false; //按顺序显示层级
        renderer.toneMapping = 1;
        renderer.setClearColor(0xffffff, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(self.Width, self.Height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.autoUpdate = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        self.Container.appendChild(renderer.domElement);
        self.$scope.Renderer = renderer;
        let labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(self.Width, self.Height);
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0";
        labelRenderer.domElement.style.outline = "none";
        labelRenderer.domElement.style.zIndex = "1";
        labelRenderer.shadowMapEnabled = true;
        labelRenderer.domElement.setAttribute("type", "labelRenderer");
        self.Container.appendChild(labelRenderer.domElement);
        self.$scope.LabelRenderer = labelRenderer;
    }
    //初始化坐标轴
    initHelper(data = { size: 100 }) {
        this.Scene.add(new THREE.AxesHelper(data.size));
    }
    //初始化网格
    initGrid(data = {
        size: 220,
        divisions: 40,
        color: ["rgb(255,0,255)", "rgb(255,255,0)"],
        opacity: 0.5
    }) {
        const self = this, scene = self.Scene;
        let grid = new THREE.GridHelper(data.size, data.divisions, data.color[0], data.color[1]);
        grid.material.opacity = data.opacity;
        grid.material.transparent = true;
        scene.add(grid);
    }
    //创建3维点模型
    creatPointMode(data) {
        data = Object.assign({
            visible: false,
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            width: 0.01,
            height: 0.01,
            depth: 0.01,
            opacity: 1
        }, data);
        let group = new THREE.Group();
        group.add(new THREE.Mesh(new THREE.BoxGeometry(data.width, data.height, data.depth), new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: data.opacity
        })));
        group.visible = data.visible;
        group.position.set(data.position.x, data.position.y, data.position.z);
        return group;
    }
    // 删除object，释放内存
    deleteGroup(object) {
        const self = this;
        let scene = self.Scene;
        if (!object)
            return;
        // 删除掉所有的模型组内的mesh
        object.traverse(function (item) {
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
        scene.remove(object);
    }
    /**
     * 清除模型，模型中有 group 和 scene,需要进行判断,释放内存
     * @param scene
     * @returns
     */
    deleteGroupAndScene() {
        const self = this;
        let scene = self.Scene;
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
    createOutline(objectsArray, visibleColor = "rgb(255,150,0)", tempColor = "rgb(255,0,40)") {
        const self = this, composer = self.Composer, scene = self.Scene, camera = self.Camera;
        let outlinePass = new OutlinePass(new THREE.Vector2(self.Width, self.Height), scene, camera, objectsArray);
        outlinePass.renderToScreen = true;
        outlinePass.edgeStrength = 3;
        outlinePass.edgeThickness = 1;
        outlinePass.edgeGlow = 0.7;
        outlinePass.visibleEdgeColor = self.color(visibleColor);
        outlinePass.tempPulseColor2 = self.color(tempColor);
        outlinePass.hiddenEdgeColor.set(0);
        composer.addPass(outlinePass);
        return outlinePass;
    }
    //窗口重置初始化
    windowResize() {
        const self = this;
        let camera = self.Camera, renderer = self.Renderer, composer = self.Composer, LabelRenderer = self.LabelRenderer;
        window.addEventListener("resize", function () {
            self.Width = self.Container.clientWidth;
            self.Height = self.Container.clientHeight;
            camera.aspect = self.Width / self.Height;
            camera.updateProjectionMatrix();
            renderer.setSize(self.Width, self.Height);
            LabelRenderer.setSize(self.Width, self.Height);
            if (composer) {
                composer.setSize(self.Width, self.Height);
            }
        }, false);
    }
    /***********************辅助工具**********************************/
    //三维坐标转屏幕坐标
    getTransPosition2D(position = { x: 0, y: 0, z: 0 }) {
        const self = this;
        /*     let world_vector = new THREE.Vector3(position.x, position.y, position.z);
             let vector = world_vector.project(self.Camera);
             return {
                 x:Math.round((0.5 + vector.x / 2) * self.Renderer.domElement.clientWidth),
                 y:Math.round((0.5 - vector.y / 2) * self.Renderer.domElement.clientHeight)
             }
             */
        // let projector = new THREE.Projector();
        let world_vector = new THREE.Vector3(position.x, position.y, position.z);
        let vector = world_vector.project(self.Camera);
        let halfWidth = window.innerWidth / 2, halfHeight = window.innerHeight / 2;
        return {
            x: Math.round((vector.x + 1) * halfWidth),
            y: Math.round(-vector.y * halfHeight + halfHeight)
        };
    }
    //二维坐标转世界坐标
    getTransPosition3D(position = { x: 0, y: 0 }) {
        const self = this;
        let mouse = new THREE.Vector2();
        mouse.x = (position.x / window.innerWidth) * 2 - 1;
        mouse.y = -(position.y / window.innerHeight) * 2 + 1;
        return new THREE.Vector3(mouse.x, mouse.y, -1).unproject(self.Camera);
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
    //模型的中心点坐标
    getModeCenterPoint(group) {
        return new THREE.Box3().expandByObject(group).getCenter();
    }
    colorRGBtoHex(color) {
        let rgb = color.split(',');
        if (rgb.length < 3)
            return;
        let r = parseInt(rgb[0].split('(')[1]);
        let g = parseInt(rgb[1]);
        let b = parseInt(rgb[2].split(')')[0]);
        let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }
    color(color) {
        const self = this;
        return new THREE.Color(self.colorRGBtoHex(color));
    }
    /**
     *
     * @param object
     * @param params
     * @param rangs 名称 最大值 最小值 间距
     */
    initGUI(object, params, rangs) {
        const self = this;
        let gui = new GUI();
        params.exportData = function () {
            self.export(params);
        };
        gui.domElement.style = 'position:absolute;top:300px;right:0px;z-index:99999;margin: 0;';
        self.Container.appendChild(gui.domElement);
        Object.keys(params).forEach((param, i) => {
            if (param != "exportData") {
                gui.add(params, param, rangs[i][1], rangs[i][2]).name(rangs[i][0]).step(rangs[i][3]).onChange(function (value) {
                    object[param] = value;
                });
            }
        });
        gui.add(params, 'exportData');
        gui.open();
    }
    /*
    **
    * @param params
    */
    initRenderGUI(params, rangs) {
        const self = this;
        if (!self.renderGUI) {
            let gui = new GUI();
            params.exportData = function () {
                self.export(params);
            };
            gui.domElement.style = 'position:absolute;top:300px;right:0px;z-index:99999;margin: 0;';
            self.Container.appendChild(gui.domElement);
            Object.keys(params).forEach(param => {
                if (["number"].includes(typeof (params[param]))) {
                    if (rangs) {
                        gui.add(params, param, rangs[i][1], rangs[i][2]).name(rangs[i][0]).step(rangs[i][3]).onChange(function (value) {
                            object[param] = value;
                        });
                    }
                    else {
                        gui.add(params, param, -10000, 10000).name(param).step(1).onChange(function (value) {
                            params[param] = value;
                        });
                    }
                }
            });
            gui.add(params, 'exportData');
            gui.open();
            console.info(gui);
            self.renderGUI = gui;
        }
        else {
            Object.keys(params).filter(param => {
                if (["number"].includes(typeof (params[param]))) {
                    return param;
                }
            }).forEach((param, i) => {
                if (["number"].includes(typeof (params[param]))) {
                    self.renderGUI.__controllers[i].setValue(params[param]);
                }
            });
        }
    }
    export(params) {
        let a = Object.assign({}, params);
        delete a.export;
        prompt('设置参数', JSON.stringify(a));
    }
    //加载图片
    loadTextLoad(img) {
        return new THREE.TextureLoader().load(img, function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
        });
    }
}
