import { Base } from "./Base";
import { LineMove } from "./LineMove";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { Power1 } from "gsap";
let THREE;
/**
 * 轨迹
 */
export class Trajectory extends Base {
    constructor(target) {
        super(target);
        this.options = {
            number: 10000,
            percent: 0.001,
            tension: 0.1,
            time: 10,
            repeat: -1,
            color: "rgb(255,255,0)"
        };
        this.isFrist = true;
        THREE = this.THREE;
    }
    //初始化场景
    init(options = {}) {
        const self = this;
        options = Object.assign({}, options);
    }
    createLintMove(options) {
        const self = this, scene = self.Scene, t1 = new self.TimelineLite();
        self.options = Object.assign(self.options, options);
        let curveObject = new LineMove().initMoveLine({
            line: self.options.line,
            tension: self.options.tension,
            isClose: true
        });
        self.curveObject = curveObject;
        let geometry = curveObject.geometry;
        // curveObject.layers.mask = 1;
        scene.add(curveObject);
        let data = {
            index: 0
        };
        t1.to(data, self.options.time, {
            index: self.options.number,
            repeat: self.options.repeat,
            onUpdate() {
                let color = [];
                let vertices = [];
                let point = new THREE.Vector3();
                let num = self.options.number * (self.isFrist ? 0.1 : self.options.percent) + data.index;
                self.isFrist = false;
                for (let i = data.index; i < Math.floor(num); i++) {
                    curveObject.curve.getPoint(i / (self.options.number), point);
                    vertices.push(point.x, point.y, point.z);
                    let c = self.getColor(self.options.color);
                    color.push(c[0], c[1], c[2]);
                }
                geometry.attributes.position = new THREE.Float32BufferAttribute(vertices, 3);
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
                geometry.attributes.position.needsupdate = true;
                geometry.attributes.color.needsupdate = true;
            },
            ease: Power1.easeOut
        });
        // self.initGUI();
    }
    getColor(color) {
        let rgb = color.split(',');
        if (rgb.length < 3)
            return;
        return [parseInt(rgb[0].split('(')[1]), parseInt(rgb[1]), parseInt(rgb[2].split(')')[0])];
    }
    exportData() {
        const self = this;
        let code = "number:" + self.number + ",\n" +
            "            percent:" + self.percent + ",\n" +
            "            tension:" + self.tension + ",\n" +
            "            color: " + self.color;
        prompt('copy and paste code', code);
    }
    initGUI() {
        const self = this;
        let gui = new GUI(), params = {
            number: self.options.number,
            percent: self.options.percent,
            tension: self.options.tension,
            exportData: self.exportData,
        };
        gui.domElement.style = 'position:absolute;top:300px;right:0px;z-index:99999;margin: 0;';
        self.Container.appendChild(gui.domElement);
        gui.add(params, 'number', 1, 10000).name("线段数量").step(1).onChange(function (value) {
            self.options.number = value;
        });
        gui.add(params, 'percent', 0.01, 10).name("显示线段%").step(0.01).onChange(function (value) {
            self.options.percent = value / 100;
        });
        gui.add(params, 'tension', 0, 1).name("线曲率").step(0.01).onChange(function (value) {
            self.options.tension = value;
            self.curveObject.curve.tension = self.options.tension;
            self.curveObject.curve.needsupdate = true;
            console.info(self.curveObject.curve);
        });
        gui.add(params, 'exportData');
        gui.open();
    }
    render() {
    }
}
