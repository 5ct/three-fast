import { Base } from "./Base";
import { LineMove } from "./LineMove";
import { Power0 } from "gsap";
let THREE;
/**
 * 模型炸裂
 */
export class Burst extends Base {
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
        const self = this;
        data.group.traverse(function (object) {
            if (object.isMesh) {
                //模型包围盒
                /*        let meshBox3 = new THREE.Box3();
                        meshBox3.setFromObject(object);
                        //获取每个mesh的中心点，爆炸方向为爆炸中心点指向mesh中心点
                        let worldPs = new THREE.Vector3().addVectors( meshBox3.min,meshBox3.max).multiplyScalar(0.5);
                        if(isNaN(worldPs.x))return;*/
                //计算爆炸方向
                object.worldDir = new THREE.Vector3().subVectors(self.getModeCenterPoint(object), self.getModeCenterPoint(data.group)).normalize();
            }
        });
    }
    //炸裂特效
    applyScalar(group, scalar) {
        const self = this, TweenMax = self.TweenMax;
        let data = group.userData.data;
        group.traverse(function (object) {
            if (!object.isMesh || !object.worldDir)
                return;
            //爆炸公式
            let position = scalar == 0 ? new THREE.Vector3(data.x, data.y, data.z).multiplyScalar(0) : new THREE.Vector3(data.x, data.y, data.z).add(new THREE.Vector3().copy(object.worldDir).multiplyScalar(scalar));
            // object.position.copy(new THREE.Vector3(data.x,data.y,data.z).add(new THREE.Vector3().copy(object.worldDir).multiplyScalar(scalar)))
            TweenMax.to(object.position, 1, {
                x: position.x,
                y: position.y,
                z: position.z,
                ease: self.Bounce.easeOut,
            });
        });
    }
    //炸裂特效1
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
    //炸裂特效2 弹出mesh并且旋转30度
    applyScalar2(group, z, floor) {
        const self = this, t1 = new self.TimelineLite();
        group.traverse(function (object) {
            if (!object.isMesh || !object.worldDir)
                return;
            //爆炸公式
            let floorNum = object.name.replace(/[^\d]/gi, "");
            if (object.name == floor) {
                t1.to(object.position, 0, {
                    z: z,
                    // ease: self.Bounce.easeOut,
                });
            }
            else if (floor != -1 && (floorNum * 1 > floor.replace(/[^\d]/gi, "") * 1 || object.name == "QPDX_Z_roof")) {
                object.position.z = z * 2;
            }
            else {
                object.position.z = object.oldPosition.z;
            }
        });
    }
    //炸裂特效3
    applyScalar3(group, x, floor) {
        const self = this, t1 = new self.TimelineLite() /*,camera = self.Camera*/;
        // let data = camera.userData.data;
        /*let a = {x:data.position.x,y:data.position.y,z:data.position.z};
        let b = {x:data.target.x,y:data.target.y,z:data.position.z};*/
        // let d = new THREE.Vector3().subVectors(b,a).normalize();
        group.traverse(function (object) {
            if (!object.isMesh)
                return;
            if (object.name == floor) {
                /* let c = new THREE.Vector3(0,object.oldPosition.y,0);
                 let e = new THREE.Vector3().addVectors(c,d).multiplyScalar(1);*/
                t1.to(object.position, 0, {
                    // x:e.x,
                    y: -3,
                    ease: self.Bounce.easeOut,
                });
            }
            else {
                object.position.copy(object.oldPosition);
            }
        });
    }
    //炸裂特效4
    applyScalar4(group, z, floor) {
        const self = this, t1 = new self.TimelineLite();
        let newLineMove = new LineMove();
        let data = {
            index: 0
        }, prevPoint, nextPoint;
        let curveObject = newLineMove.initMoveLine({
            line: [{ "x": 85.21793210477223, "y": 16, "z": 24.53992559680419 },
                { "x": 58.30241443261704, "y": 16, "z": 21.379419703029612 },
                { "x": 49.99811227727326, "y": 12, "z": 19.066692612842424 },
                { "x": 43.937550069407635, "y": 5, "z": 17.31874315507688 }]
        });
        t1.to(data, 1, {
            index: 1,
            onUpdate() {
                nextPoint = curveObject.curve.getPoint(data.index / 1, new THREE.Vector3());
                if (prevPoint) {
                    group.position.copy(prevPoint);
                    group.lookAtPotision = nextPoint;
                    group.lookAt(nextPoint);
                    group.rotateY(data.index * 30 * self.Angle);
                }
                prevPoint = nextPoint;
            },
            ease: Power0.easeNone,
        });
        self.Control.target.copy(group.position);
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
