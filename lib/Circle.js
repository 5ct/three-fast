import { Base } from "./Base";
require("./TweenMax.min");
import { Back } from "gsap";
let THREE;
export class Circle extends Base {
    constructor(scope) {
        super(scope);
        THREE = this.THREE;
    }
    /*
    * 初始化控制器
     */
    init(options = {}) {
        const self = this;
    }
    circle1() {
        const self = this;
        let mesh1 = new THREE.Mesh(new THREE.TorusGeometry(30, 0.1, 12, 50), new THREE.MeshPhongMaterial({
            color: 0xffff00,
            transparent: true,
            fog: true,
            lightMapIntensity: 100,
            reflectivity: true,
            clipShadows: true,
            emissive: 0xffff00,
            emissiveIntensity: 200,
        }));
        /*   var spotLight = new THREE.SpotLight( 0xffff00, 1, 100);
           spotLight.position.set(0,40,0);
           self.Scene.add(spotLight);*/
        mesh1.layers.mask = 1;
        new TweenMax(mesh1.scale, 5, {
            x: 10,
            y: 10,
            z: 10,
            repeat: -1,
            easy: Back.easeOut.config(17),
            onUpdate: function () {
                mesh1.geometry.groupsNeedUpdate = true;
            }
        });
        new TweenMax(mesh1.material, 5, {
            opacity: 0,
            visible: false,
            repeat: -1,
        });
        mesh1.rotateX(self.Angle * 90);
        mesh1.position.set(0, 1, 0);
        return mesh1;
    }
    //注销相机
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
