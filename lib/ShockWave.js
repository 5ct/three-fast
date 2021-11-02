import { Base } from "./Base";
let THREE;
/**
 * 冲击波特效
 */
export class ShockWave extends Base {
    constructor(scope) {
        super(scope);
        this.index = 0;
        this.ShaderBar = {
            uniforms: {
                boxH: { value: -25.0 },
            },
            vertexShader: [
                'varying vec3 vColor;',
                'varying vec3	vVertexNormal;',
                "varying vec2 vUv;",
                'varying float v_pz; ',
                'void main(){',
                "   vUv = uv;",
                '   v_pz = position.y; ',
                '	vVertexNormal	= normalize(normal);',
                '   vColor = color;',
                '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform float	boxH;',
                'varying vec3	vVertexNormal;',
                'varying vec3 vColor;',
                "varying vec2 vUv;",
                'varying float v_pz; ',
                'float plot (vec2 st, float pct){',
                'return  smoothstep( pct-8.0, pct, v_pz) -',
                'smoothstep( pct, pct+0.02, v_pz);',
                '}',
                'void main(){',
                'float f1 = plot(vUv,boxH);',
                'vec4 b1 = mix(vec4(1.0,1.0,1.0,1.0),vec4(f1,f1,f1,1.0),0.8);',
                'gl_FragColor = mix(vec4(vColor,1.0),b1,f1);',
                'gl_FragColor = vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,0.9);',
                ' if(vVertexNormal.y > 0.5){gl_FragColor = vec4(vColor, 1.0);}',
                '}'
            ].join('\n'),
        };
        THREE = this.THREE;
    }
    //初始化
    init(data = {}) {
        data = Object.assign({
            group: {}
        }, data);
        const self = this, scene = self.Scene;
        let cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
        cubeGeo.addAttribute('color', new THREE.BufferAttribute(new Float32Array(24 * 3), 3));
        let colors1 = cubeGeo.attributes.color;
        for (let i = 0; i < 24; i += 2) {
            let r = Math.random() * 0.8, g = Math.random() * 0.7, b = Math.random() * 0.5;
            colors1.setXYZ(i, r, g, b);
            colors1.setXYZ(i + 1, r, g, b);
        }
        let k = 2;
        colors1.setXYZ(k * 4 + 0, .0, 1.0, 1.0);
        colors1.setXYZ(k * 4 + 1, .0, 1.0, 1.0);
        colors1.setXYZ(k * 4 + 2, .0, 1.0, 1.0);
        colors1.setXYZ(k * 4 + 3, .0, 1.0, 1.0);
        let material = new THREE.ShaderMaterial({
            uniforms: self.ShaderBar.uniforms,
            vertexShader: self.ShaderBar.vertexShader,
            fragmentShader: self.ShaderBar.fragmentShader,
            vertexColors: self.ShaderBar,
        });
        let cube = new THREE.Mesh(cubeGeo, material);
    }
    render() {
    }
}
