import { Base } from "./Base";
let THREE;
/**
 * 模型炸裂
 */
export class ModeMove extends Base {
    constructor(scope) {
        super(scope);
        THREE = this.THREE;
    }
    //初始化
    init(data = {}) {
        data = Object.assign({
            group: {}
        }, data);
        const self = this, camera = self.$scope.Camera;
        let t1 = self.TweenMax;
        let position = new THREE.Vector3().copy(data.group.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-10));
        self.Control.target.copy(data.group.position);
        camera.lookAt(data.group.position);
        t1.to(camera.position, 1, {
            x: position.x,
            y: position.y,
            z: position.z,
            onComplete() {
                self.event(data.group);
            }
        });
    }
    event(group) {
        const self = this, camera = self.$scope.Camera;
        let t1 = self.TweenMax;
        window.addEventListener('keypress', function (e) {
            let position = new THREE.Vector3().copy(group.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-10));
            self.Control.target.copy(group.position);
            camera.position.copy(position);
            camera.lookAt(group.position);
            let speed = self.$scope.$scope.Delta * 20;
            let vector = camera.getWorldDirection();
            let theta = Math.atan2(vector.x, vector.z);
            let angle = theta * 180 / Math.PI;
            let x, z;
            switch (e.key) {
                case "w":
                    x = speed * Math.sin(theta);
                    z = speed * Math.cos(theta);
                    group.position.x += x;
                    group.position.z += z;
                    break;
                case "d":
                    x = speed * Math.cos(theta);
                    z = speed * Math.sin(theta);
                    if (angle >= -90 && angle < 0) {
                        group.position.x -= x;
                        group.position.z -= z;
                    }
                    else {
                        group.position.x -= x;
                        group.position.z += z;
                    }
                    break;
                case "s":
                    x = speed * Math.sin(theta);
                    z = speed * Math.cos(theta);
                    group.position.x -= x;
                    group.position.z -= z;
                    break;
                case "a":
                    x = speed * Math.cos(theta);
                    z = speed * Math.sin(theta);
                    if (angle >= -90 && angle < 0) {
                        group.position.x += x;
                        group.position.z -= z;
                    }
                    else {
                        group.position.x += x;
                        group.position.z -= z;
                    }
                    break;
            }
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
