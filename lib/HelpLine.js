import { Base } from "./Base";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
let THREE;
/**
 * 创建辅助线
 */
export class HelpLine extends Base {
    constructor(scope, options) {
        super(scope);
        THREE = this.THREE;
        this.init(options);
    }
    //初始化辅助线
    init(line = [{ "x": -50.73763171708531, "y": 0, "z": 129.20111968531933 },
        { "x": -24.583523909635453, "y": 0.1, "z": 92.41697806658786 },
        { "x": 241.71141675825726, "y": 0.1, "z": 25.928043697660442 },
        { "x": -26.901031045131823, "y": 223.3387430654442, "z": 121.27769858027311 }]) {
        const self = this;
        let scene = self.Scene, point = new THREE.Vector3(), geometry = new THREE.BoxBufferGeometry(10, 10, 10);
        let splineHelperObjects = [], splinePointsLength = 4, positions = [], splines = {}, ARC_SEGMENTS = 300;
        let addLine = {
            line: line,
            init() {
                const that = this;
                that.load(that.line.map(point => {
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
                    strPlace.push('{"x":{0}, "y":{1}, "z":{2}}'.format(p.x, p.y, p.z));
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
        let gui = new GUI(), params = {
            uniform: true,
            tension: 0.5,
            centripetal: true,
            chordal: true,
            addPoint: addLine.addPoint,
            removePoint: addLine.removePoint,
            exportSpline: addLine.exportSpline
        };
        gui.domElement.style = 'position:absolute;top:0px;right:0px;z-index:99999;margin: 0;';
        self.Container.appendChild(gui.domElement);
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
        let geometry1 = new THREE.BufferGeometry();
        geometry1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));
        let curve = new THREE.CatmullRomCurve3(positions);
        curve.curveType = 'catmullrom';
        curve.mesh = new THREE.Line(geometry1.clone(), new THREE.LineBasicMaterial({
            color: 0xff0000,
            opacity: 0.35,
        }));
        splines.uniform = curve;
        curve = new THREE.CatmullRomCurve3(positions);
        curve.curveType = 'centripetal';
        curve.mesh = new THREE.Line(geometry1.clone(), new THREE.LineBasicMaterial({
            color: 0x00ff00,
            opacity: 0.35
        }));
        splines.centripetal = curve;
        curve = new THREE.CatmullRomCurve3(positions);
        curve.curveType = 'chordal';
        curve.mesh = new THREE.Line(geometry1.clone(), new THREE.LineBasicMaterial({
            color: 0x0000ff,
            opacity: 0.35
        }));
        splines.chordal = curve;
        for (let k in splines) {
            scene.add(splines[k].mesh);
        }
        addLine.init();
        self.splines = splines;
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
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
