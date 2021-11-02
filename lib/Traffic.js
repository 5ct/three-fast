import { Base } from "./Base";
let THREE;
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
/**
 * 车流动效特效
 */
export class Traffic extends Base {
    constructor(target) {
        super(target);
        this.objects = [];
        THREE = this.THREE;
    }
    /**
     * 通过点位创建巡视曲线
     * @param data
     * @returns {THREE.Line|*|THREE.Line|THREE.Line}
     */
    init(object) {
        const self = this;
        self.objects.push(object);
    }
    initGUI() {
        const self = this;
        let gui = new GUI();
        self.params = {
            MASS: self.MASS,
            export: function () {
                self.export(self.params);
            },
        };
        gui.domElement.style = 'position:absolute;top:300px;right:0px;z-index:99999;margin: 0;';
        self.Container.appendChild(gui.domElement);
        gui.add(params, 'MASS', 0.001, 0.1).step(0.0001).onChange(function (value) {
            self.MASS = value;
            self.gravity = new THREE.Vector3(self.gravityY, self.gravityX, 0).multiplyScalar(self.MASS); //设置重力
        });
        gui.add(params, 'export');
        gui.open();
    }
    render() {
        const self = this;
        if (self.objects.length) {
            self.objects.forEach(group => {
                group.traverse(function (child) {
                    if (child.isMesh) {
                        child.material.map.offset.x -= 1 / 200;
                        child.material.map.offset.y -= 1 / 200;
                    }
                });
            });
        }
    }
}
