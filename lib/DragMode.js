import { Base } from "./Base";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DragControls } from "three/examples/jsm/controls/DragControls";
let THREE;
/**
 * 模型拖拽
 */
export class DragMode extends Base {
    constructor(scope) {
        super(scope);
        THREE = this.THREE;
    }
    //初始化拖拽控制器
    init(objects) {
        const self = this;
        self.initTransformControl();
        let dragControls = new DragControls(objects, self.$scope.Camera, self.LabelRenderer.domElement); //
        dragControls.activate();
        dragControls.addEventListener('hoveron', function (event) {
            self.transformControl.attach(event.object);
            self.cancelHideTransform();
        });
        dragControls.addEventListener('hoveroff', function () {
            self.delayHideTransform();
        });
        self.dragControls = dragControls;
        // 鼠标略过事件
    }
    //初始化模型坐标系
    initTransformControl() {
        const self = this;
        let transformControl = new TransformControls(self.$scope.Camera, self.LabelRenderer.domElement);
        transformControl.setSize(0.4);
        transformControl.addEventListener('dragging-changed', function (event) {
            self.Control.enabled = !event.value;
        });
        transformControl.addEventListener('change', function () {
            self.cancelHideTransform();
        });
        transformControl.addEventListener('mouseDown', function () {
            self.cancelHideTransform();
        });
        transformControl.addEventListener('mouseUp', function () {
            self.delayHideTransform();
        });
        self.Scene.add(transformControl);
        self.transformControl = transformControl;
    }
    hideTransform() {
        const self = this;
        self.hiding = setTimeout(function () {
            self.transformControl.detach(self.transformControl.object);
        }, 0);
    }
    cancelHideTransform() {
        const self = this;
        if (self.hiding)
            clearTimeout(self.hiding);
    }
    delayHideTransform() {
        const self = this;
        self.cancelHideTransform();
        self.hideTransform();
    }
    //注销
    destroyed() {
        const self = this;
        if (self.transformControl) {
            self.transformControl.detach();
            self.Control.enabled = true;
            self.dragControls.dispose();
            self.transformControl.dispose();
            self.Scene.remove(self.transformControl);
        }
    }
    //时钟渲染
    render() {
        const self = this;
    }
}
