import { Base } from "./Base";
let THREE;
export class Camera extends Base {
    constructor(scope, options) {
        super(scope);
        this.lookAtCircleOBJ = [];
        this.lookAtOBJ = null;
        THREE = this.THREE;
        this.init(options);
    }
    /**
     * 初始化相机
     * @param type 相机类型
     * 1、正交相机
     * 2、透视相机
     */
    init(options = {}) {
        const self = this;
        switch (options.type * 1) {
            case 1:
                self.creatOrthographicCamera(options);
                break;
            case 2:
            default:
                self.creatPerspectiveCamera(options);
                break;
        }
    }
    //创建透视相机
    creatPerspectiveCamera(data = {}) {
        data = Object.assign({
            position: [{ "x": 0, "y": 0, "z": 0 }, { "x": 0, "y": 0, "z": 0 }],
            fov: 30,
            near: 1,
            far: 8000,
            zoom: 1
        }, data);
        const self = this;
        let camera = new THREE.PerspectiveCamera(data.fov, self.Width / self.Height, data.near, data.far, data.zoom);
        let points = {
            position: new THREE.Vector3().set(data.position[0].x, data.position[0].y, data.position[0].z),
            target: new THREE.Vector3().set(data.position[1].x, data.position[1].y, data.position[1].z),
        };
        camera.position.copy(points.position);
        camera.lookAt(points.target);
        camera.userData.data = data;
        self.$scope.Camera = camera;
        return camera;
    }
    //创建正交相机
    creatOrthographicCamera(data = {}) {
        data = Object.assign({
            position: [{ "x": 0, "y": 0, "z": 0 }, { "x": 0, "y": 0, "z": 0 }],
            fov: 30,
            near: 1,
            far: 8000
        }, data);
        const self = this;
        let camera = new THREE.OrthographicCamera(-self.Width / 6, self.Width / 6, self.Height / 6, -self.Height / 6, 1, 5000);
        let points = {
            position: new THREE.Vector3().set(data.position[0].x, data.position[0].y, data.position[0].z),
            target: new THREE.Vector3().set(data.position[1].x, data.position[1].y, data.position[1].z),
        };
        camera.position.copy(points.position);
        camera.lookAt(points.target);
        camera.userData.data = data;
        self.$scope.Camera = camera;
        return camera;
    }
    lookAt(positions, focus, time = 0, onComplete) {
        const self = this;
        let camera = self.$scope.Camera, position = camera.position, t1 = new self.TimelineLite();
        let points = [];
        positions.forEach(item => {
            points.push(new THREE.Vector3(item.x, item.y, item.z));
        });
        let curve = new THREE.CatmullRomCurve3(points, false, "catmullrom");
        curve.tension = 0;
        let geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(4));
        let material = new THREE.LineBasicMaterial({
            linewidth: 1,
            color: self.colorRGBtoHex("rgb(255,255,0"),
            visible: true,
        });
        let curveObject = new THREE.Line(geometry, material);
        curveObject.curve = curve;
        if (time == 0) {
            camera.position.copy(positions[positions.length - 1]);
            self.$scope.Control.target.copy(new THREE.Vector3(focus.x, focus.y, focus.z));
        }
        else {
            self.lookAtOBJ = curveObject;
            curveObject.options = {
                time: time,
                index: 0,
                onComplete: onComplete
            };
        }
    }
    lookAtCircle(options) {
        const self = this;
        options = Object.assign({
            position: { "x": 0, "y": 0, "z": 0 },
            target: { "x": 0, "y": 0, "z": 0 },
            radius: 150,
            time: 30,
            times: 1000,
            repeat: -1,
            angle: 0,
            isRunning: true
        }, options);
        self.lookAtCircleOBJ.push(options);
        console.info(options);
        return options;
    }
    //时钟渲染
    render() {
        const self = this;
        let camera = self.$scope.Camera;
        if (self.lookAtCircleOBJ.length) {
            self.lookAtCircleOBJ.forEach(options => {
                if (options.isRunning) {
                    let target = new THREE.Vector3(options.target.x, options.target.y, options.target.z);
                    options.angle += (360 / options.time) / 60;
                    let position = new THREE.Vector3(options.radius * Math.sin(options.angle * self.Angle), options.position.y, options.radius * Math.cos(options.angle * self.Angle));
                    camera.position.copy(position);
                    self.$scope.Control.target.copy(target);
                }
            });
        }
        if (self.lookAtOBJ != null) {
            let options = self.lookAtOBJ.options;
            let curve = self.lookAtOBJ.curve, time = 60 / Math.abs(options.time);
            if (options.index * time < 1) {
                options.index++;
                let prev = options.index, next = options.index + 1;
                camera.position.copy(curve.getPoint(prev * time, new THREE.Vector3()));
                camera.lookAt(curve.getPoint(next * time, new THREE.Vector3()));
            }
            else {
                if (options.onComplete) {
                    options.onComplete();
                }
                self.lookAtOBJ = null;
            }
        }
        /*    self.initRenderGUI({
                positionX:camera.position.x,
                positionY:camera.position.y,
                positionZ:camera.position.z,
                targetX:self.$scope.Control.target.x,
                targetY:self.$scope.Control.target.y,
                targetZ:self.$scope.Control.target.z,
            });*/
        // self.$scope.Camera.updateProjectionMatrix();
    }
}
