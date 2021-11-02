import { Base } from "./Base";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
let THREE;
export class HelpPoint extends Base {
    constructor(scope) {
        super(scope);
        THREE = this.THREE;
    }
    //初始化辅助线
    init(points = [{ x: 0, y: 30, z: 0 }]) {
        const self = this;
        let scene = self.Scene, geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        self.destroyed();
        let splineHelperObjects = [], splinePointsLength = 0, positions = [], ARC_SEGMENTS = 300;
        let addLine = {
            init() {
                const that = this;
                that.load(points.map(point => {
                    return new THREE.Vector3(point.x, point.y, point.z);
                }));
            },
            addSplineObject(position) {
                let object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
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
            },
            removePoint() {
                if (splinePointsLength < 1) {
                    return;
                }
                splinePointsLength--;
                positions.pop();
                scene.remove(splineHelperObjects.pop());
            },
            exportSpline() {
                if (splineHelperObjects.length) {
                    String.prototype.format = function () {
                        let str = this;
                        for (let i = 0; i < arguments.length; i++) {
                            str = str.replace('{' + i + '}', arguments[i]);
                        }
                        return str;
                    };
                    let position = splineHelperObjects[0].position;
                    prompt('设置参数', JSON.stringify({
                        x: position.x.toFixed(4) * 1,
                        y: position.y.toFixed(4) * 1,
                        z: position.z.toFixed(4) * 1
                    }));
                    return position;
                }
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
            }
        };
        self.addLine = addLine;
        let gui = new GUI(), params = {
            uniform: true,
            tension: 0.5,
            centripetal: true,
            chordal: true,
            addPoint: addLine.addPoint,
            removePoint: addLine.removePoint,
            exportSpline: addLine.exportSpline
        };
        gui.domElement.style = 'position:absolute;top:0px;right:0px;z-index:9999999;margin: 0;';
        self.Container.appendChild(gui.domElement);
        gui.add(params, 'uniform');
        gui.add(params, 'tension', 0, 1).step(0.01).onChange(function (value) {
            addLine.updateSplineOutline();
        });
        gui.add(params, 'centripetal');
        gui.add(params, 'chordal');
        gui.add(params, 'addPoint');
        gui.add(params, 'removePoint');
        gui.add(params, 'exportSpline');
        gui.open();
        self.initDragControl(splineHelperObjects);
        for (let i = 0; i < splinePointsLength; i++) {
            addLine.addSplineObject(positions[i]);
        }
        positions = [];
        for (let i = 0; i < splinePointsLength; i++) {
            positions.push(splineHelperObjects[i].position);
        }
        let geometry1 = new THREE.BufferGeometry();
        geometry1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));
        addLine.init();
    }
    //初始化拖拽控制器
    initDragControl(objects) {
        const self = this;
        self.initTransformControl();
        let dragControls = new DragControls(objects, self.Camera, self.LabelRenderer.domElement); //
        dragControls.enabled = false;
        // 鼠标略过事件
        dragControls.addEventListener('hoveron', function (event) {
            self.transformControl.attach(event.object);
            self.cancelHideTransform();
        });
        dragControls.addEventListener('hoveroff', function () {
            self.delayHideTransform();
        });
        return dragControls;
    }
    //初始化模型坐标系
    initTransformControl() {
        const self = this;
        let transformControl = new TransformControls(self.Camera, self.LabelRenderer.domElement);
        self.transformControl = transformControl;
        transformControl.setSize(0.4);
        transformControl.addEventListener('dragging-changed', function (event) {
            self.Control.enabled = !event.value;
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
        self.Scene.add(transformControl);
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
    //注销
    destroyed() {
        const self = this;
        if (self.addLine) {
            self.transformControl.detach(self.transformControl.object);
            self.transformControl.dispose();
            self.addLine.removePoint();
        }
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
