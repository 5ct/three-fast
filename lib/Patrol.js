import { Base } from "./Base";
let THREE;
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { Power0 } from "gsap";
/**
 * 巡视特效
 */
export class Patrol extends Base {
    constructor(target) {
        super(target);
        THREE = this.THREE;
    }
    /**
     * 通过点位创建巡视曲线
     * @param data
     * @returns {THREE.Line|*|THREE.Line|THREE.Line}
     */
    init(data) {
        const self = this;
        let camera = self.$scope.Camera;
        data = Object.assign({
            line: [{ x: 0, y: 0, z: 0 }],
            curveType: "catmullrom",
            isClose: false,
            tension: 0,
            time: 1,
            curveIndex: 0,
            isRunning: true,
            number: 4
        }, data);
        let positions = [];
        data.line.forEach(point => {
            positions.push(new THREE.Vector3(point.x, point.y, point.z));
        });
        let curve = new THREE.CatmullRomCurve3(positions, data.isClose, data.curveType);
        curve.tension = data.tension;
        let points = curve.getPoints(data.number);
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let material = new THREE.LineBasicMaterial({
            linewidth: 1000,
            color: self.colorRGBtoHex("rgb(255,255,0"),
            opacity: 0.35,
        });
        let curveObject = new THREE.Line(geometry, material);
        curveObject.curve = curve;
        // curveObject.layers.mask = 1;
        let t1 = new TimelineMax({ delay: 1, onUpdate: function () {
                camera.position.copy(curve.getPoint(data.curveIndex / data.time, new THREE.Vector3()));
                camera.updateProjectionMatrix();
            } });
        t1.to(data, data.time, {
            curveIndex: data.time,
        });
        self.curveObject = curveObject;
    }
    circle(object, params) {
        const self = this, camera = self.$scope.Camera;
        params = Object.assign({
            position: { x: 0, y: 0, z: 0 },
            target: { x: 0, y: 0, z: 0 },
        }, params);
        self.Control.target.set(params.target.x, params.target.y, params.target.z);
        camera.position.copy(new THREE.Vector3(params.position.x, params.position.y, params.position.z));
        camera.lookAt(new THREE.Vector3(params.target.x, params.target.y, params.target.z));
        let t1 = new TimelineMax();
        t1.to(object.rotation, 1, {
            x: self.Angle * params.rotateX,
            y: self.Angle * params.rotateY,
            z: self.Angle * params.rotateZ,
            ease: Power0.easeNone,
        });
        // self.initGUI(object,params)
    }
    resetCircle(object, params) {
        const self = this;
        let t1 = new TimelineMax();
        t1.to(object.rotation, 0, {
            x: self.Angle * params.rotateX,
            y: self.Angle * params.rotateY,
            z: self.Angle * params.rotateZ,
            // ease: self.Bounce.easeOut,
        });
    }
    initGUI(object, params = {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        x: 0,
        y: 0,
        z: 0
    }) {
        const self = this;
        let gui = new GUI();
        params.exportData = function () {
            let code = "rotateX:" + params.rotateX + ",\n" +
                "            rotateY:" + params.rotateY + ",\n" +
                "            rotateZ:" + params.rotateZ + ",\n" +
                "            x:" + params.x + ",\n" +
                "            y:" + params.y + ",\n" +
                "            z:" + params.z + "";
            console.info(object.rotation, self.Camera.position);
            prompt('copy and paste code', code);
        },
            gui.domElement.style = 'position:absolute;top:300px;right:0px;z-index:99999;margin: 0;';
        self.Container.appendChild(gui.domElement);
        gui.add(params, 'rotateX', -360, 360).name("rotateX").step(1).onChange(function (value) {
            params.rotateX = value;
            self.resetCircle(object, params);
        });
        gui.add(params, 'rotateY', -360, 360).name("rotateY").step(1).onChange(function (value) {
            params.rotateY = value;
            self.resetCircle(object, params);
        });
        gui.add(params, 'rotateZ', -360, 360).name("rotateZ").step(1).onChange(function (value) {
            params.rotateZ = value;
            self.resetCircle(object, params);
        });
        gui.add(params, 'y', 0, 500).name("高度").step(1).onChange(function (value) {
            params.y = value;
            self.resetCircle(object, params);
        });
        gui.add(params, 'x', -100, 100).name("偏移X").step(1).onChange(function (value) {
            params.x = value;
            self.resetCircle(object, params);
        });
        gui.add(params, 'z', -100, 100).name("偏移Z").step(1).onChange(function (value) {
            params.z = value;
            self.resetCircle(object, params);
        });
        gui.add(params, 'exportData');
        gui.open();
    }
    //注销
    destroyed() {
        const self = this;
        self.data = {};
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
