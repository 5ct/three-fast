import { Base } from "./Base";
import { MapControls, OrbitControls } from "three/examples/jsm/controls/OrbitControls";
let THREE;
export class Control extends Base {
    constructor(scope, options) {
        super(scope);
        THREE = this.THREE;
        this.init(options);
    }
    /*
    * 初始化控制器
     */
    init(options = {}) {
        const self = this;
        self.initRenderer();
        switch (options.type * 1) {
            case 1:
                self.createMapControl(options);
                break;
            case 2:
            default:
                self.createModelControl(options);
                break;
        }
    }
    //创建地图控制器
    createMapControl(data = {}) {
        data = Object.assign({
            maxDistance: 500,
            minDistance: 30,
            rotateSpeed: 0.5,
            zoomSpeed: 1.2,
            panSpeed: 0.8,
            maxPolarAngle: Math.PI / 180 * 90,
            minPolarAngle: Math.PI / 180 * 0,
            change(event) {
            }
        }, data);
        const self = this;
        let control = new MapControls(self.$scope.Camera, self.$scope.LabelRenderer.domElement);
        control.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        control.dampingFactor = 0.1;
        control.screenSpacePanning = true;
        control.minDistance = data.minDistance;
        control.maxDistance = data.maxDistance;
        control.maxPolarAngle = data.maxPolarAngle;
        control.minPolarAngle = data.minPolarAngle;
        control.minAzimuthAngle = data.minAzimuthAngle;
        control.maxAzimuthAngle = data.maxAzimuthAngle;
        control.minZoom = data.minZoom;
        control.maxZoom = data.maxZoom;
        control.addEventListener("change", function (event) {
            data.change.call(self, event);
        });
        control.addEventListener("changeEnd", function (event) {
            data.changeEnd.call(self, event);
        });
        control.addEventListener("mousewheel", function (event) {
            data.change.call(self, event);
        });
        control.userData = {
            data: data
        };
        control.target.copy(self.Camera.lookAt);
        control.update();
        self.$scope.Control = control;
    }
    //创建模型控制器
    createModelControl(data = {}) {
        const self = this;
        data = Object.assign({
            maxDistance: 5000,
            minDistance: 1,
            rotateSpeed: 0.5,
            zoomSpeed: 1.2,
            panSpeed: 0.8,
            maxPolarAngle: self.Angle * 180,
            minPolarAngle: self.Angle * 0,
            enabled: true,
            change(event) {
            }
        }, data);
        let control = new OrbitControls(self.$scope.Camera, self.$scope.LabelRenderer.domElement);
        control.maxDistance = data.maxDistance;
        control.minDistance = data.minDistance;
        control.rotateSpeed = data.rotateSpeed;
        control.zoomSpeed = data.zoomSpeed;
        control.panSpeed = data.panSpeed;
        control.maxPolarAngle = data.maxPolarAngle;
        control.enablePan = data.enablePan;
        control.minPolarAngle = data.minPolarAngle;
        control.staticMoving = data.staticMoving || true;
        control.enabled = data.enabled;
        control.dynamicDampingFactor = data.dynamicDampingFactor || 0.3;
        control.addEventListener("change", function (event) {
            data.change.call(self, event);
        });
        control.addEventListener("mousewheel", function (event) {
            data.change.call(self, event);
        });
        control.userData = {
            data: data
        };
        if (self.Camera.userData.data.position) {
            control.target.copy(self.Camera.userData.data.position[1]);
        }
        control.update();
        self.$scope.Control = control;
    }
    //限制只能左右控制
    leftRightControl() {
        const self = this, control = self.$scope.Control;
        self.resetControl();
        control.enabled = false;
        control.maxPolarAngle = 0;
        control.minPolarAngle = 0;
    }
    //限制只能上下控制
    upDownControl() {
        const self = this, control = self.$scope.Control;
        self.resetControl();
        control.maxAzimuthAngle = 0;
        control.minAzimuthAngle = 0;
        control.enablePan = false;
        control.enabled = false;
        control.update();
    }
    //限制只能上下控制
    moveControl() {
        const self = this, control = self.$scope.Control;
        self.resetControl();
        control.enableZoom = false;
        control.enableRotate = false;
        control.update();
    }
    enabledControl(enabled) {
        const self = this, control = self.$scope.Control;
        control.maxDistance = 0;
        control.minDistance = 0;
        control.panSpeed = 0;
        control.enablePan = false;
        control.enabled = false;
        control.enableZoom = false;
        control.enableRotate = true;
        control.enableKeys = false;
        control.enableDamping = false;
        control.update();
    }
    //重置控制
    resetControl() {
        const self = this, control = self.$scope.Control;
        let data = control.userData.data;
        control.maxDistance = data.maxDistance;
        control.minDistance = data.minDistance;
        control.rotateSpeed = data.rotateSpeed;
        control.zoomSpeed = data.zoomSpeed;
        control.panSpeed = data.panSpeed;
        control.maxPolarAngle = data.maxPolarAngle;
        control.enablePan = data.enablePan;
        control.minPolarAngle = data.minPolarAngle;
        control.staticMoving = data.staticMoving || true;
        control.enabled = data.enabled;
        control.dynamicDampingFactor = data.dynamicDampingFactor || 0.3;
    }
    //注销相机
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
        self.$scope.Control.update();
    }
}
