var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Comm } from "./Comm.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import * as _THREE from "three";
class ThreeMap extends Comm {
    constructor(options = {}) {
        super(Object.assign({
            composer: {},
            FBXData: [],
            renderer: {},
            modelClick() { },
            modelChange() { },
            diffWidth: 0,
            diffHeight: 0,
            msgArray: [],
            controls: {},
            isRunning: true,
            patrolIndex: 0,
            patrolTime: 0,
            toolTipArray: [],
            materials: {},
            index: 1,
            controlEnabled: true
        }, options));
        this.initTHREE();
    }
    initTHREE() {
        const self = this;
        self.initScene();
        self.initPerspectiveCamera();
        self.initRenderer();
        self.initEffectComposer();
        self.control.type == "model" ? self.initModelControl() : self.initMapControl();
        self.initFBXData().then(res => {
            self.mouseDown();
            self.running();
            self.windowResize();
            self.controlChange();
            self.onLoadModel();
        });
    }
    //初始化FBX数据
    initFBXData() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let data = self.original.FBXData, modelData = self.original.selectModel, scene = self.scene;
            self.FBXData = [];
            yield Promise.all(data.map((item, index) => __awaiter(this, void 0, void 0, function* () {
                switch (item.type) {
                    case "storm":
                        self.createStorm();
                        break;
                    case "particles":
                        return yield self.createParticles(item).then(object => {
                            scene.add(object);
                        });
                        break;
                    case "moveLine":
                        return yield self.initMoveData(item).then((objects) => {
                            let object = objects[0];
                            if (item.name == "walk") {
                                let mixer = new _THREE.AnimationMixer(object);
                                let action = mixer.clipAction(object.animations[0]);
                                action.setDuration(item.playTime || 30).play();
                                self.Mixer = mixer;
                            }
                            scene.add(object);
                            scene.add(objects[1]);
                            self.FBXData.push(object);
                        });
                        break;
                    default:
                        return yield self.loadFBXData(item).then(object => {
                            scene.add(object);
                            self.FBXData.push(object);
                        });
                }
            })));
        });
    }
    initEffectComposer() {
        const self = this;
        let renderer = self.renderer;
        let renderPass = new RenderPass(self.scene, self.camera); //配置通道
        const outlinePass = new OutlinePass(new self._THREE.Vector2(self.width, self.height), self.scene, self.camera);
        outlinePass.renderToScreen = true;
        outlinePass.visibleEdgeColor = new self._THREE.Color(255, 150, 0);
        outlinePass.tempPulseColor2 = new self._THREE.Color(255, 192, 40);
        outlinePass.edgeStrength = 2;
        outlinePass.edgeThickness = 4;
        let composer = new EffectComposer(renderer); //配置composer
        composer.renderToScreen = false; // 模版缓冲（stencil buffer）
        composer.renderTarget1.stencilBuffer = true;
        composer.renderTarget2.stencilBuffer = true;
        composer.addPass(renderPass); //将通道加入composer
        composer.addPass(outlinePass); //添加光效
        self.composer = composer;
        self.renderBloomPass(renderPass);
    }
    renderBloomPass(renderPass) {
        const self = this;
        let composer = self.composer, renderer = self.renderer, finalComposer = new EffectComposer(renderer);
        let finalPass = new ShaderPass(new self._THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: composer.renderTarget2.texture }
            },
            vertexShader: "varying vec2 vUv;" +
                "void main() {" +
                "vUv = uv;" +
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );" +
                "}",
            fragmentShader: "uniform sampler2D baseTexture;" +
                "uniform sampler2D bloomTexture;" +
                "varying vec2 vUv;" +
                "vec4 getTexture( sampler2D texelToLinearTexture ) {" +
                "return mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );" +
                "}" +
                "void main() {" +
                "gl_FragColor = ( getTexture( baseTexture ) + vec4( 0.5 ) * getTexture( bloomTexture ) );" +
                "}" +
                "",
            defines: {}
        }), "baseTexture");
        finalPass.needsSwap = true;
        finalComposer.addPass(renderPass);
        finalComposer.addPass(finalPass);
        self.finalComposer = finalComposer;
        let unrealBloomPass = new UnrealBloomPass(new self._THREE.Vector2(0, 0), 1, 0.5, 0.2);
        composer.addPass(unrealBloomPass);
    }
    initText(object, data) {
        const self = this, THREE = self._THREE, CSS2DObject = self._CSS2DObject;
        let scene = self.scene, element = document.createElement('div');
        element.className = 'THREE_label';
        element.textContent = data.lable.textContent;
        element.style.marginTop = "-1em";
        let objectLabel = new CSS2DObject(element);
        objectLabel.position.set(0, data.lable.top, 0);
        object.add(objectLabel);
    }
    /***************事件************************/
    /**
     * 控制改变
     * @param target 当前选中元素
     */
    controlChange(target) {
        const self = this;
        self.controls.enabled = self.controlEnabled;
        if (self.selectModel && self.selectModel.position) {
            self.modelChange(self.transPosition(self.selectModel.position), self.selectModel);
        }
        self.setMsgDomStyle();
        self.setToolTipDomStyle();
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
    //鼠标点击触发事件
    mouseDown() {
        const self = this;
        //监听全局点击事件,通过ray检测选中哪一个object
        document.addEventListener("mousedown", (event) => {
            self.initDown(event);
        }, false);
        document.addEventListener("touchsend", (event) => {
            self.initDown(event);
        }, false);
    }
    initDown(event) {
        event = event || window.event;
        const self = this;
        let camera = self.camera, renderer = self.renderer, mouse = new self._THREE.Vector3();
        let raycaster = new self._THREE.Raycaster(), data = self.original.selectModel, FBXData = self.FBXData;
        if ((event.target.tagName == "CANVAS" || event.target.classList.value.indexOf("point2d") != -1) && event.button == 0 && self.isRunning) {
            mouse.set(((event.clientX - self.diffWidth) / self.width) * 2 - 1, -((event.clientY - self.diffHeight) / self.height) * 2 + 1, 1);
            // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
            raycaster.setFromCamera(mouse, camera);
            // 获取raycaster直线和所有3d模型相交的数组集合
            let intersects3D = raycaster.intersectObjects(FBXData, true).map(function (a) {
                return a.object.parent;
            });
            if (intersects3D instanceof Array && intersects3D.length) {
                intersects3D = [intersects3D[0]];
                self.selectModel = false;
                FBXData.forEach((object, index) => {
                    if (intersects3D.includes(object)) {
                        if (object.data.isData) {
                            self.modelClick();
                            self.selectModel = object;
                            if (self.selectModel && self.selectModel.position) {
                                self.modelClick(self.transPosition(self.selectModel.position), self.selectModel);
                            }
                            object.traverse(function (child) {
                                if (child.isMesh && !(child.material instanceof Array)) {
                                    child.material.opacity = 0.5;
                                    if (child.material.emissive) {
                                        child.material.emissive.set(object.msgData ? data.msgColor : data.activeColor);
                                    }
                                }
                            });
                        }
                    }
                    else {
                        object.traverse(function (child) {
                            if (child.isMesh && !(child.material instanceof Array)) {
                                child.material.opacity = 1;
                                if (child.material.emissive) {
                                    child.material.emissive.set(data.color);
                                }
                            }
                        });
                    }
                });
            }
        }
    }
    //刷新
    running() {
        const self = this;
        let renderer = self.renderer, scene = self.scene, camera = self.camera, controls = self.controls;
        let stats = new self._Stats(), composer = self.composer;
        let animate = function () {
            if (self.isRunning) {
                self.render();
                stats.update();
                scene.traverse(obj => self.storeMaterial(obj));
                if (composer.render) {
                    composer.passes[1].selectedObjects = self.selectModel.position ? [self.selectModel] : [];
                    composer.render(); //使用组合器来渲染，而不再用webGLRenderer
                }
                scene.traverse(obj => self.restoreMaterial(obj));
                self.finalComposer.render();
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    //存储模型材质
    storeMaterial(obj) {
        const self = this;
        if (obj.isMesh && obj.layers.mask == -1) {
            self.materials[obj.uuid] = obj.material;
            obj.material = new self._THREE.MeshBasicMaterial({ color: "black" });
        }
    }
    //重置模型材质
    restoreMaterial(obj) {
        const self = this;
        if (self.materials[obj.uuid]) {
            obj.material = self.materials[obj.uuid];
            delete self.materials[obj.uuid];
        }
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
    initTip(position, item, className = "three_tooltip", iconClass) {
        const self = this;
        let addDivDom = document.createElement('div');
        let tipDom = document.createElement('div');
        tipDom.innerHTML = iconClass ? "<svg class='icon " + iconClass + "' aria-hidden=\"true\">\n" +
            "            <use xlink:href='#" + iconClass + "'></use>\n" +
            "        </svg>" : item.name;
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
}
export { ThreeMap };
