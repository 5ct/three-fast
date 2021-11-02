import { Base } from "./Base";
let THREE;
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
/**
 * 模型炸裂
 */
export class Mirror extends Base {
    constructor(scope) {
        super(scope);
        this.index = 0;
        THREE = this.THREE;
    }
    //初始化
    init(data = {}) {
        const self = this, scene = self.Scene;
        var geometry = new THREE.PlaneBufferGeometry(100, 100);
        var verticalMirror = new Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: 2000 * window.devicePixelRatio,
            textureHeight: 2000 * window.devicePixelRatio,
            color: 0x889999,
            recursion: 1
        });
        verticalMirror.position.y = 50;
        verticalMirror.position.z = -50;
        scene.add(verticalMirror);
    }
    render() {
    }
}
