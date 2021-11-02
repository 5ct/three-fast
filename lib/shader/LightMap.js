import { Base } from "./Base";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
let THREE;
/**
 * 模型炸裂
 */
export class LightMap extends Base {
    constructor(scope) {
        super(scope);
        this.index = 0;
        THREE = this.THREE;
    }
    //初始化
    init(data = {}) {
    }
    renderShadowPass() {
        const self = this;
        return new ShaderPass(new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 400 },
                exponent: { value: 0.6 }
            },
            vertexShader: "varying vec3 vWorldPosition;" +
                "void main() {" +
                "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );" +
                "vWorldPosition = worldPosition.xyz;" +
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );" +
                "}",
            fragmentShader: "uniform vec3 topColor;" +
                "uniform vec3 bottomColor;" +
                "uniform float offset;" +
                "uniform float exponent;" +
                "varying vec3 vWorldPosition;" +
                "void main() {" +
                "float h = normalize( vWorldPosition + offset ).y;" +
                "gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );" +
                "}",
            defines: {}
        }), "baseTexture");
    }
    render() {
    }
}
