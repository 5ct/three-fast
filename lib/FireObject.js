import { Base } from "./Base";
let THREE;
/**
 * 创建火焰
 */
export class FireObject extends Base {
    constructor(target) {
        super(target);
        THREE = this.THREE;
    }
    //初始化
    fire(object, data = {}) {
        data = Object.assign({
            colorBias: 0.8,
            burnRate: 0.35,
            diffuse: 1.33,
            viscosity: 0.25,
            expansion: -0.25,
            swirl: 50.0,
            drag: 0.35,
            airSpeed: 12.0,
            windX: 0.0,
            windY: 0.75,
            speed: 500.0,
            massConservation: false, //质量守恒
        }, data);
        const self = this, scene = self.Scene;
        let plane = new THREE.PlaneBufferGeometry(120, 120, 20);
        var cube = new THREE.InstancedBufferGeometry(1, 15, 40, 40, 40);
        let fire = new Fire(cube, Object.assign({
            textureWidth: self.Width,
            textureHeight: self.Height,
            debug: false
        }, data));
        fire.position.y = 20;
        fire.clearSources();
        fire.addSource(0.1, 0.1, 0.1, 2, 0.0, 0);
        fire.addSource(0.4, 0.1, 0.1, 0.5, 0.0, 1.0);
        fire.addSource(0.7, 0.1, 0.1, 0.5, 0.0, 1.0);
        scene.add(fire);
        self.fire = fire;
        // self.textFire();
    }
    textFire(data) {
        data = Object.assign({
            text: "Three JS",
            color: "#ff0040"
        }, data);
        let canvas = document.createElement("canvas"), fire = self.fire;
        canvas.width = 1024;
        canvas.height = 1024;
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '180pt Arial';
        ctx.lineWidth = 5;
        ctx.strokeStyle = data.color;
        ctx.strokeText(data.data, canvas.width / 2, canvas.height * 0.75);
        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        fire.setSourceMap(texture);
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
