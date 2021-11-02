import { Base } from "./Base";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { LineMove } from "./LineMove";
let THREE;
/**
 * 模型添加平面文字
 */
export class CSS2D extends Base {
    constructor(scope) {
        super(scope);
        this.labelObjects = [];
        THREE = this.THREE;
        this._LineMove = new LineMove(this);
    }
    //初始化
    init(object, data = {}) {
        const self = this;
        data = self.deepAssign({
            className: 'THREE_label',
            lable: {
                textContent: "",
                top: 0,
            },
            marginTop: "-1em",
        }, data);
        let element = document.createElement('div');
        element.className = data.className;
        element.textContent = data.lable.textContent;
        element.style.visibility = data.lable.visibility == false ? "hidden" : "visible";
        element.style.marginTop = data.marginTop;
        element.translate = false;
        element.addEventListener("mousedown", function () {
            if (data.click) {
                data.click(object);
            }
        }, true);
        if (data.positions && data.positions.length > 1) {
            //屏幕坐标转世界坐标
            let newPositions = [data.positions[0]];
            newPositions.push(self.getTransPosition3D({
                x: data.positions[1].x,
                y: data.positions[1].y
            }));
            newPositions.push(self.getTransPosition3D({
                x: data.positions[2].x,
                y: data.positions[2].y
            }));
            element.style.position = "absolute";
            element.style.zIndex = "1";
            element.style.color = "#fff";
            element.style.top = data.positions[2].y + "px";
            element.style.left = data.positions[2].x + "px";
            element.style.marginTop = "-2.2em";
            self.Container.append(element);
            data.element = element;
            //初始化文字链接线
            let obj = self._LineMove.initMoveLine({
                tension: 1,
                line: newPositions,
            });
            obj.data = data;
            self.Scene.add(obj);
            self.labelObjects.push(obj);
        }
        else {
            let objectLabel = new CSS2DObject(element);
            objectLabel.visible = data.visible == false ? false : true;
            objectLabel.position.set(0, data.lable.top, 0);
            object.add(objectLabel);
        }
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
        self.LabelRenderer.render(self.Scene, self.Camera);
        let labelObjects = self.labelObjects;
        if (labelObjects) {
            labelObjects.forEach(object => {
                let positions = object.data.positions, _position0 = self.getTransPosition2D(positions[0]);
                let angle = Math.atan((positions[1].y - _position0.y) / (positions[1].x - _position0.x)) / self.Angle;
                if (positions[1].x - _position0.x > 0) {
                    angle = 180 - angle;
                }
                object.data.element.style.transform = angle > 60 ? "translate(-100%, 0px)" : "translate(0%, 0px)";
                object.data.element.style.marginLeft = angle > 60 ? "0" : "2.6em";
                //屏幕坐标转世界坐标
                let position0 = positions[0];
                let position1 = self.getTransPosition3D({
                    x: angle < 60 ? (positions[2].x * 2 - positions[1].x) : positions[1].x,
                    y: positions[1].y
                });
                let position2 = self.getTransPosition3D({
                    x: positions[2].x,
                    y: positions[2].y
                });
                let position = object.geometry.attributes.position;
                position.setXYZ(0, position0.x, position0.y, position0.z);
                position.setXYZ(1, position1.x, position1.y, position1.z);
                position.setXYZ(2, position2.x, position2.y, position2.z);
                position.needsUpdate = true;
            });
        }
    }
}
