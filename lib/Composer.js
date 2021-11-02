import { Base } from "./Base";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
let THREE;
export class Composer extends Base {
    constructor(scope, options) {
        super(scope);
        this.materials = [];
        THREE = this.THREE;
        this.init(options);
        this.$scope.Composer = this.composer;
    }
    /**
     * 初始化
     */
    init() {
        const self = this, renderer = self.Renderer;
        let renderPass = new RenderPass(self.$scope.Scene, self.$scope.Camera); //配置通道
        const outlinePass = new OutlinePass(new THREE.Vector2(self.Width, self.Height), self.Scene, self.$scope.Camera);
        outlinePass.renderToScreen = true;
        outlinePass.visibleEdgeColor = new THREE.Color(255, 150, 0);
        outlinePass.tempPulseColor2 = new THREE.Color(255, 192, 40);
        outlinePass.edgeStrength = 1;
        outlinePass.edgeThickness = 400;
        let composer = new EffectComposer(renderer); //配置composer
        composer.renderToScreen = false; // 模版缓冲（stencil buffer）
        composer.renderTarget1.stencilBuffer = true;
        composer.renderTarget2.stencilBuffer = true;
        composer.addPass(renderPass); //将通道加入composer
        composer.addPass(outlinePass); //添加光效
        self.composer = composer;
        self.renderBloomPass(renderPass);
    }
    /**
     *  渲染辉光
     * @param renderPass
     */
    renderBloomPass(renderPass) {
        const self = this;
        let composer = self.composer, renderer = self.Renderer, finalComposer = new EffectComposer(renderer);
        let finalPass = new ShaderPass(new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: composer.renderTarget2.texture }
            },
            vertexShader: "varying vec2 vUv;" +
                "void main() {" +
                "vUv = uv;" +
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );" +
                "}",
            fragmentShader: "uniform sampler2D baseTexture;" +
                "uniform sampler2D bloomTexture;" +
                "varying vec2 vUv;" +
                "vec4 getTexture( sampler2D texelToLinearTexture ) {" +
                "return mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );" +
                "}" +
                "void main() {" +
                "gl_FragColor = ( getTexture( baseTexture ) + vec4(0.3) * getTexture( bloomTexture ) );" +
                "}" +
                "",
            defines: {}
        }), "baseTexture");
        finalPass.needsSwap = true;
        finalComposer.addPass(renderPass);
        finalComposer.addPass(finalPass);
        self.finalComposer = finalComposer;
        let unrealBloomPass = new UnrealBloomPass(new self.THREE.Vector2(10, 10), 4, 0.5, 0);
        composer.addPass(unrealBloomPass);
    }
    //时钟渲染
    render() {
        const self = this, scene = self.Scene;
        let composer = self.composer;
        scene.traverse(obj => self.storeMaterial(obj));
        composer.render(); //使用组合器来渲染，而不再用webGLRenderer
        scene.traverse(obj => self.restoreMaterial(obj));
        self.finalComposer.render();
    }
    //注销
    destroyed() {
    }
    /*======================工具===============================*/
    //存储模型材质
    storeMaterial(obj) {
        const self = this;
        if (obj.isMesh && obj.layers.mask == -1) {
            self.materials[obj.uuid] = obj.material;
            obj.material = new THREE.MeshBasicMaterial({ color: "black" });
        }
    }
    //重置模型材质
    restoreMaterial(obj) {
        const self = this;
        if (self.materials[obj.uuid]) {
            obj.material = self.materials[obj.uuid];
            delete self.materials[obj.uuid];
        }
    }
}
