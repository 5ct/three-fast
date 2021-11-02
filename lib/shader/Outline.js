import { Base } from "../Base";
let THREE;
export class Outline extends Base {
    constructor(scope, options) {
        super(scope);
        THREE = this.THREE;
        this.init(options);
        this.$scope.Composer = this.composer;
    }
    /**
     * 初始化
     */
    init() {
        const self = this;
    }
    /**
     *  渲染辉光
     * @param renderPass
     */
    outlineShader(renderPass) {
        const self = this;
        return self.THREE.ShaderMaterial({
            uniforms: {
                offset: {
                    type: "f",
                    value: 1
                }
            },
            vertexShader: [
                "uniform float offset;",
                "void main() {",
                "vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );",
                "gl_Position = projectionMatrix * pos;",
                "}"
            ].join("\n"),
            fragmentShader: [
                "void main(){",
                "gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );",
                "}"
            ].join("\n"),
            defines: {}
        });
    }
    //时钟渲染
    render() {
        const self = this, scene = self.Scene;
        let composer = self.composer;
    }
    //注销
    destroyed() {
    }
}
