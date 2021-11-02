var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Base } from "./Base";
import { Storm } from "./Storm";
import { Particles } from "./Particles";
import { LineMove } from "./LineMove";
import { CSS2D } from "./CSS2D";
import { Burst } from "./Burst";
import { Landing } from "./Landing";
import { ModeMove } from "./ModeMove";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
let THREE;
/**
 * 加载FBX模型
 */
export class FBXMode extends Base {
    constructor(target, options) {
        super(target);
        this.FBXLoader = new FBXLoader(); //加载FBX模型文件-依赖
        this.LineMoves = [];
        this.FBXData = [];
        this.mixers = [];
        THREE = this.THREE;
        this._CSS2D = new CSS2D(this);
        this._Particles = new Particles(this);
        this._Burst = new Burst(this);
        this._Landing = new Landing(this);
        this._ModeMove = new ModeMove(this);
        this._LineMove = new LineMove(this);
        this.mouseDown(options);
    }
    //初始化FBX数据
    init(data = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                return self.loadModeByData(item);
            })));
        });
    }
    loadModeByData(item) {
        const self = this, scene = self.Scene;
        switch (item.modeType) {
            case "storm":
                self._Storm = new Storm(self, item);
                break;
            case "particles":
                return self._Particles.init(item).then(object => {
                    scene.add(object);
                });
                break;
            //按线路径移动
            case "moveLine":
                let lineMove = new LineMove(self, item);
                item = Object.assign(item, item.line[0]);
                self.loadFBXData(item).then(object => {
                    if (object.animations) {
                        let mixer = new THREE.AnimationMixer(object);
                        let action = mixer.clipAction(object.animations[0]);
                        action.setDuration(item.playTime || 30).play();
                        self.mixers.push(mixer);
                    }
                    scene.add(object);
                    let lineObject = lineMove.init(object, item);
                    lineObject.visible = !!item.isHideLine;
                    self.LineMoves.push(lineMove);
                    scene.add(lineObject);
                    self.FBXData.push(object);
                    return object;
                });
                break;
            //创建点模型
            case "point":
                item.position = item.positions[0];
                let object = self.creatPointMode(item);
                object.userData.data = item;
                if (item.lable) {
                    self._CSS2D.init(object, item);
                }
                scene.add(object);
                self.FBXData.push(object);
                break;
            case "traffic":
                return self.loadFBXData(item).then(object => {
                    self.$scope._Traffic.init(object);
                    scene.add(object);
                    self.FBXData.push(object);
                });
                break;
            //模型动画
            case "move":
                return self.loadFBXData(item).then(object => {
                    if (object.animations) {
                        let mixer = new THREE.AnimationMixer(object);
                        let action = mixer.clipAction(object.animations[0]);
                        action.setDuration(item.playTime || 30).play();
                        self.mixers.push(mixer);
                    }
                    self._ModeMove.init({
                        group: object
                    });
                    scene.add(object);
                    self.FBXData.push(object);
                });
                break;
            case "ground":
                return self.loadFBXData(item).then(object => {
                    scene.add(object);
                    self.FBXData.push(object);
                });
                break;
            case "randomMeshShow":
                return self.loadFBXData(item).then(object => {
                    self.randomMeshShow.clear(object);
                    scene.add(object);
                    self.FBXData.push(object);
                });
                break;
            //人员轨迹
            case "elevator":
                return self.loadFBXData(item).then(object => {
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            switch (child.name) {
                                case "Stair_KT01":
                                    self._CSS2D.init(child, {
                                        lable: {
                                            textContent: "1",
                                            top: 2
                                        },
                                        className: "elevator",
                                        visible: item.visible
                                    });
                                    break;
                                case "Stair_KT02":
                                    self._CSS2D.init(child, {
                                        lable: {
                                            textContent: "1",
                                            top: 2
                                        },
                                        className: "elevator",
                                        visible: item.visible
                                    });
                                    break;
                                case "Stair_HT":
                                    self._CSS2D.init(child, {
                                        lable: {
                                            textContent: "1",
                                            top: 2
                                        },
                                        className: "elevator",
                                        visible: item.visible
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                    scene.add(object);
                    self.FBXData.push(object);
                });
                break;
            //交通路灯
            case "trafficLight":
                return self.loadFBXData(item).then(object => {
                    scene.add(object);
                    self.FBXData.push(object);
                });
                break;
            case "flag":
                let objects = self.$scope._Flutter.initData(item.positions);
                self.FBXData = self.FBXData.concat(objects);
                break;
            default:
                return self.loadFBXData(item).then(object => {
                    if (object.animations) {
                        let mixer = new THREE.AnimationMixer(object);
                        object.animations.forEach(animation => {
                            const action = mixer.clipAction(animation);
                            action.setDuration(item.playTime || 30);
                            action.reset();
                            action.play();
                        });
                        self.mixers.push(mixer);
                    }
                    self._Burst.init({
                        group: object
                    });
                    scene.add(object);
                    self.FBXData.push(object);
                });
        }
    }
    //加载FBX模型
    loadFBXData(data) {
        const self = this;
        data.emissiveColor = data.emissiveColor ? self.colorRGBtoHex(data.emissiveColor) : null;
        data.emissiveMap = data.emissiveMap ? new THREE.TextureLoader().load(data.emissiveMap) : null;
        return new Promise(function (resolve) {
            self.FBXLoader.load(data.path, function (object) {
                object.traverse(function (child) {
                    child.layers.mask = data.bloom ? data.bloom : -1;
                    if (child.isMesh) {
                        child.oldPosition = Object.assign({}, child.position);
                        child.oldRotation = Object.assign({}, child.rotation);
                        if (data.isUpdate) {
                            if (child.material instanceof Array && child.material.length) {
                                child.material = child.material.map((a) => {
                                    if (data.updateMaterial || data.updateMaterials.includes(child.material.name)) {
                                        return self.updateMaterialByMaterial(a, data);
                                    }
                                    else {
                                        Object.assign(a, Object.assign({
                                            shininess: 10,
                                            clipShadows: true,
                                            depthWrite: true,
                                            emissiveIntensity: 1,
                                            transparent: true,
                                            opacity: 1
                                        }, data));
                                        a.emissive.set(data.emissiveColor);
                                        return a;
                                    }
                                });
                            }
                            else {
                                if (data.updateMaterial || data.updateMaterials.includes(child.material.name)) {
                                    child.material = self.updateMaterialByMaterial(child.material, data);
                                }
                                else {
                                    child.material.emissive.set(data.emissiveColor);
                                    child.material.emissiveIntensity = data.emissiveIntensity;
                                    child.material.reflectivity = true;
                                    child.material.castShadow = true;
                                }
                            }
                        }
                        child.castShadow = data.shadow;
                        child.receiveShadow = data.shadow;
                        if (data.rotateX != undefined) {
                            child.rotateX(self.Angle * data.rotateX);
                        }
                        if (data.rotateY != undefined) {
                            child.rotateY(self.Angle * data.rotateY);
                        }
                        if (data.rotateZ != undefined) {
                            child.rotateZ(self.Angle * data.rotateZ);
                        }
                    }
                });
                if (data.visible == false) {
                    object.visible = false;
                }
                object.userData.data = data;
                object.layers.mask = data.bloom ? data.bloom : -1;
                object.scale.set(data.scale || 1, data.scale || 1, data.scale || 1);
                object.position.set(data.x || 0, data.y || 0, data.z || 0);
                // data.rotate =[0,0,0];
                if (data.rotate) {
                    object.rotation.set(data.rotate[0] * self.Angle, data.rotate[1] * self.Angle, data.rotate[2] * self.Angle);
                }
                if (data.lable) {
                    self._CSS2D.init(object, data);
                }
                if (data.fire) {
                    self._Particles.fire(object, data);
                }
                resolve(object);
            });
        });
    }
    updateMaterialByMaterial(material, data) {
        const self = this;
        let options = {
            map: material.map,
            transparent: data.transparent || true,
            lightMap: data.emissive || material.map,
            lightMapIntensity: 1,
            reflectivity: true,
            shininess: 1,
            opacity: data.opacity || 1,
            clipShadows: true,
            emissiveMap: data.emissiveMap ? data.emissiveMap : material.map.image ? material.map : null,
            fog: true,
            emissiveIntensity: data.emissiveIntensity || 0,
        }, name = material.name, newMaterial;
        if (data.name == "tree") {
            options.depthWrite = false;
            options.depthTest = true;
            options.side = THREE.DoubleSide; //侧面渲染方式 两面
        }
        if (data.depthTest != undefined) {
            options.depthTest = data.depthTest;
        }
        if (data.depthWrite != undefined) {
            options.depthWrite = data.depthWrite;
        }
        if (data.material == "MeshStandardMaterial") {
            Object.assign(options, {
                // 默认 0.5. 0.0到1.0之间的值可用于生锈的金属外观
                metalness: 0.5,
                // 材料的粗糙程度. 0.0表示平滑的镜面反射，1.0表示完全漫反射. 默认 0.5
                roughness: 0.5,
                color: 0xffffff,
                // envMap: self.Scene.background,
                envMapIntensity: 1,
            });
            newMaterial = new THREE.MeshStandardMaterial(options);
            if (["ZL_boli", "ST_ding"].includes(name)) {
                newMaterial.emissive.set(self.colorRGBtoHex("rgb(11,15,101)"));
            }
            else {
                newMaterial.emissive.set(data.emissiveColor);
                newMaterial.transparent = false;
            }
        }
        else {
            newMaterial = new THREE.MeshPhongMaterial(options);
            newMaterial.emissive.set(data.emissiveColor);
        }
        return newMaterial;
    }
    updateMaterialMap(material, options) {
        const self = this;
        let texture = new THREE.TextureLoader().load(options.img);
        material.map = texture;
        return material;
    }
    //鼠标点击触发事件
    mouseDown(options) {
        const self = this;
        //监听全局点击事件,通过ray检测选中哪一个object
        self.Container.addEventListener("mousedown", (event) => {
            self.initDown(event, options);
        }, true);
        self.Container.addEventListener("touchsend", (event) => {
            self.initDown(event, options);
        }, true);
        self.Container.addEventListener("mousemove", (event) => {
            self.initDown(event, options, "mouseover");
        }, true);
    }
    initDown(event, options, type = "mousedown") {
        event = event || window.event;
        const self = this;
        self.Container.style.cursor = "auto";
        if (event.button == 0 && event.target.getAttribute("type") == "labelRenderer") {
            let raycaster = new self.THREE.Raycaster();
            let mouse = new self.THREE.Vector3().set(((event.clientX - self.diffWidth) / self.Width) * 2 - 1, -((event.clientY - self.diffHeight) / self.Height) * 2 + 1, 1);
            // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
            raycaster.setFromCamera(mouse, self.Camera);
            // 获取raycaster直线和所有3d模型相交的数组集合
            let isClick = true;
            self.FBXData.map(object => {
                if (object.userData.data && object.userData.data.isClick) {
                    object.traverse(child => {
                        if (child.type == "Object3D") {
                            child.element.style.visibility = child.parent.userData.data.isActive ? "visible" : "hidden";
                        }
                    });
                }
            });
            raycaster.intersectObjects(self.FBXData, true).map(function (a) {
                let object = self.getGroup(a.object);
                if (object.userData.data && object.userData.data.isClick) {
                    object.traverse(child => {
                        if (child.type == "Object3D") {
                            child.element.style.visibility = "visible";
                        }
                    });
                    self.Container.style.cursor = "pointer";
                    if (type == "mousedown" && isClick) {
                        isClick = false;
                        options.click.call(self, object, object.userData.data, a.object);
                    }
                }
                return a;
            });
        }
    }
    getGroup(objects) {
        return objects.type != "Scene" ? objects.userData.data ? objects : this.getGroup(objects.parent) : null;
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
            if (object.userData.data.name == name) {
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
            if (object.userData.data.name == name) {
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
            if (object.userData.data.name == name) {
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
        const self = this;
        this.FBXData = this.FBXData.filter(group => {
            if (group.userData.data.name != name) {
                return group;
            }
            else {
                // 删除掉所有的模型组内的mesh
                self.removeGroup(group);
            }
        });
    }
    /**
     * 通过模型删除模型
     * @param name 模型名称
     */
    deleteFBXDataByGroup(group) {
        const self = this;
        this.FBXData = this.FBXData.filter(object => {
            if (object == group) {
                self.removeGroup(group);
            }
            else {
                return object;
            }
        });
    }
    removeGroup(group) {
        const self = this;
        // 删除掉所有的模型组内的mesh
        group.traverse(function (item) {
            if (item instanceof THREE.Mesh) {
                item.geometry.dispose(); // 删除几何体
                item.material.dispose(); // 删除材质
            }
            if (item instanceof CSS2DObject) {
                item.remove();
                group.remove(item);
            }
        });
        self.Scene.remove(group);
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
        if (self._Storm) {
            self._Storm.render();
        }
        if (self._Particles) {
            self._Particles.render();
        }
        if (self.LineMoves.length) {
            self.LineMoves.forEach(lineMove => {
                lineMove.render();
            });
        }
        if (self.mixers.length) {
            self.mixers.forEach(mixer => {
                mixer.update(self.$scope.$scope.Delta);
            });
        }
        if (self._CSS2D) {
            self._CSS2D.render();
        }
        if (self._CSS3D) {
            self._CSS3D.render();
        }
        if (self._FireObject) {
            self._FireObject.render();
        }
        if (self._ModeMove) {
            self._ModeMove.render();
        }
    }
}
