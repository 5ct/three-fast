import { Base } from "./Base";
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
let THREE;
/**
* 创建灯效
*/
export class Light extends Base {
    constructor(scope) {
        super(scope);
        THREE = this.THREE;
    }
    //创建化自然光
    createHemisphereLight(data = [{
            color: [0xffffff, 0x444444],
            position: [0, 1000, 1000]
        }]) {
        const self = this, scene = self.Scene;
        let lights = [];
        data.forEach(item => {
            let light = new THREE.HemisphereLight(item.color[0], item.color[1], 1);
            light.position.set(item.position[0], item.position[1], item.position[2]);
            scene.add(light);
            lights.push(light);
        });
        return lights;
    }
    //创建点光
    createPointLight(data = [{
            distance: 1000,
            intensity: 1,
            color: 0x444444,
            position: [0, 100, 500]
        }, {
            distance: 1000,
            intensity: 1,
            color: "#fff",
            position: [-200, -500, 500]
        }]) {
        const self = this, scene = self.Scene;
        let lights = [];
        data.forEach(item => {
            let light = new THREE.PointLight(item.color, item.intensity, item.distance);
            /*light.castShadow = true;
            light.shadow.mapSize.width = 4000;
            light.shadow.mapSize.height = 4000;*/
            light.position.set(item.position[0], item.position[1], item.position[2]);
            scene.add(light);
            lights.push(light);
        });
        return lights;
    }
    //创建炫光晕
    dazzle(data = [{
            distance: 1000,
            intensity: 1,
            color: 0x444444,
            size: 400,
            position: [0, 100, 500]
        }, {
            distance: 1000,
            intensity: 1,
            color: "#fff",
            size: 400,
            position: [-200, -500, 500]
        }]) {
        const self = this, scene = self.Scene;
        // lensflares
        let textureLoader = new THREE.TextureLoader();
        var textureFlare0 = textureLoader.load("./three/qp/lensflare0.png");
        var textureFlare2 = textureLoader.load("./three/qp/lensflare2.png");
        var textureFlare3 = textureLoader.load("./three/qp/lensflare3.png");
        let lights = [];
        data.forEach(item => {
            let light = new THREE.PointLight(item.color, item.intensity, item.distance);
            light.oldPosition = new THREE.Vector3(item.position[0], item.position[1], item.position[2]);
            light.position.set(item.position[0], item.position[1], item.position[2]);
            if (item.shadow) {
                light.castShadow = true;
                light.shadow.mapSize.width = 512;
                light.shadow.mapSize.height = 512;
            }
            let flareColor = new THREE.Color(0xffffff);
            flareColor.setHSL(0.55, 0.9, 1.0);
            let lensFlare = new Lensflare();
            lensFlare.addElement(new LensflareElement(textureFlare0, data.size || 300, 0.0, flareColor));
            lensFlare.addElement(new LensflareElement(textureFlare2, data.size || 300, 0.0));
            lensFlare.addElement(new LensflareElement(textureFlare2, data.size || 300, 0.0));
            lensFlare.addElement(new LensflareElement(textureFlare2, data.size || 300, 0.0));
            lensFlare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
            lensFlare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
            lensFlare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
            lensFlare.addElement(new LensflareElement(textureFlare3, 70, 1.0));
            lensFlare.position.copy(light.position);
            light.add(lensFlare);
            scene.add(light);
            lights.push(light);
        });
        return lights;
    }
    //改变灯光位置
    changeLightPosition(lights, positions) {
        lights.forEach(light => {
            console.info(light);
        });
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
