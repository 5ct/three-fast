import { Base } from "./Base";
let THREE;
/**
 * 模型落地
 */
export class Landing extends Base {
    constructor(scope) {
        super(scope);
        this.index = 0;
        THREE = this.THREE;
    }
    //初始化
    init(data = {}) {
        data = Object.assign({
            group: {}
        }, data);
        //模型包围盒
        let modelBox3 = new THREE.Box3(), meshBox3 = new THREE.Box3();
        //获取模型的包围盒
        modelBox3.expandByObject(data.group);
        //计算模型的中心点坐标，这个为爆炸中心
        let modelWorldPs = new THREE.Vector3().addVectors(modelBox3.min, modelBox3.max);
        data.group.traverse(function (object) {
            if (object.isMesh) {
                meshBox3.setFromObject(object);
                //获取每个mesh的中心点，爆炸方向为爆炸中心点指向mesh中心点
                let worldPs = new THREE.Vector3().addVectors(meshBox3.min, meshBox3.max).multiplyScalar(0.5);
                if (isNaN(worldPs.x))
                    return;
                //计算爆炸方向
                object.worldDir = new THREE.Vector3().subVectors(worldPs, modelWorldPs).normalize();
            }
        });
    }
    //落地特效
    applyScalar(groups, scalar) {
        const self = this, t1 = new self.TimelineLite();
        groups.forEach(group => {
            let data = group.userData.data;
            group.visible = false;
            group.traverse(function (object) {
                if (!object.isMesh || !object.worldDir)
                    return;
                //爆炸公式
                let position = scalar == 0 ? new THREE.Vector3(data.x, data.y, data.z).multiplyScalar(0) : new THREE.Vector3(data.x, data.y, data.z).add(new THREE.Vector3().copy(object.worldDir).multiplyScalar(scalar));
                // object.position.copy(new THREE.Vector3(data.x,data.y,data.z).add(new THREE.Vector3().copy(object.worldDir).multiplyScalar(scalar)))
                object.position.setY(50);
                t1.set(group, { visible: true });
                t1.to(object.position, 0.25, {
                    y: 0
                });
            });
        });
    }
    //落地特效
    applyScalar1(group, scalar) {
        const self = this, t1 = new self.TimelineLite();
        let data = group.userData.data;
        self.index = self.index == 0 ? 1 : 0;
        group.traverse(function (object) {
            if (!object.isMesh || !object.worldDir)
                return;
            //爆炸公式
            let position = scalar == 0 ? new THREE.Vector3(data.x, data.y, data.z).multiplyScalar(0) : new THREE.Vector3(data.x, data.y, data.z).add(new THREE.Vector3().copy(object.worldDir).multiplyScalar(scalar));
            // object.position.copy(new THREE.Vector3(data.x,data.y,data.z).add(new THREE.Vector3().copy(object.worldDir).multiplyScalar(scalar)))
            t1.to(object.position, 1, {
                x: position.x,
                y: position.y,
                z: position.z,
            }).to(object.rotation, 1, {
                z: self.Angle * (self.index == 0 ? 270 : -90),
                ease: self.Bounce.easeOut,
            });
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
