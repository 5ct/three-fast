import { Base } from "./Base";
let THREE;
export class Scene extends Base {
    constructor(scope, options) {
        super(scope);
        THREE = this.THREE;
        this.init(options);
    }
    //创建场景data
    init(data = {}) {
        const self = this;
        let scene = new THREE.Scene();
        if (self.$scope.Scene) {
            scene = self.$scope.Scene;
        }
        data = Object.assign({
            background: "rgba(7, 26, 40)",
            boxSize: [2000, 2000, 2000],
        }, data);
        if (data.images) {
            scene.background = new THREE.CubeTextureLoader().load(data.images);
            // self.createSkyBox(data.images,scene,data.boxSize);
        }
        else {
            scene.background = new THREE.Color(data.background);
        }
        if (data.fog) {
            let fog = new THREE.Fog(data.fog[0], data.fog[1], data.fog[2]);
            scene._fog = fog;
            scene.fog = fog;
        }
        self.$scope.Scene = scene;
    }
    //创建天空盒
    createSkyBox(images) {
        this.$scope.Scene.background = new THREE.CubeTextureLoader().load(images);
    }
    createBg(color) {
        this.$scope.Scene.background = new THREE.Color(color);
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
