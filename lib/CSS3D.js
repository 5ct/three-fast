import { Base } from "./Base";
import { LineMove } from "./LineMove";
let THREE;
/**
 * 模型添加平面文字
 */
export class CSS3D extends Base {
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
                textContent: "22",
                top: 0
            },
            marginTop: "-1em",
        }, data);
        var loader = new THREE.FontLoader();
        loader.load("three/qp/test.json", function (font) {
            let textGeo = new THREE.TextGeometry("小车", {
                font: font,
                size: 5,
                height: 1,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelSegments: 1
            });
            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();
            var txtMater = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                color: 0xff0000
            });
            var txtMesh = new THREE.Mesh(textGeo, txtMater);
            txtMesh.position.set(-5, 5, 5);
            object.add(txtMesh);
            // self.Scene.add(txtMesh);
        });
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
        self.LabelRenderer.render(self.$scope.Scene, self.$scope.Camera);
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
