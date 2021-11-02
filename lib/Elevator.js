import { Base } from "./Base";
let THREE;
/**
 * 模型炸裂
 */
export class Elevator extends Base {
    constructor(scope) {
        super(scope);
        this.index = 0;
        this.saveFloor = 0;
        THREE = this.THREE;
    }
    //初始化
    init(data = {}) {
        data = Object.assign({
            group: {}
        }, data);
    }
    selectFloor(object, options) {
        const self = this;
        let t1 = new self.TimelineLite();
        options = Object.assign({
            group: {},
            isLook: true,
        }, options);
        if (self.saveFloor != options.floor) {
            let height = self.getHeightByFloor(options.floor);
            let datel = Math.abs(options.floor - self.saveFloor);
            let time = datel / 10;
            let dom = "";
            object.traverse(child => {
                if (child.type == "Object3D") {
                    dom = child.element;
                }
            });
            t1.to(object.position, time, {
                z: height,
                ease: Power0.easeInOut,
                onUpdate() {
                    dom.textContent = self.getFloorByHeight(object.position.z);
                },
                onComplete() {
                    dom.textContent = self.getFloorByHeight(height);
                    if (options.isLook) {
                        self.lookAt(options);
                    }
                }
            });
            self.saveFloor = options.floor;
        }
    }
    getHeightByFloor(floor) {
        const self = this;
        let height = 0;
        switch (floor) {
            case 1:
                height = 1.4;
                break;
            case 2:
                height = 6.691;
                break;
            case 3:
                height = 10.966;
                break;
            case 4:
                height = 14.732;
                break;
            case 5:
                height = 18.088;
                break;
            case 6:
                height = 21.167;
                break;
            case 7:
                height = 24.314;
                break;
            case 8:
                height = 27.924;
                break;
            case 9:
                height = 31.464;
                break;
            case 10:
                height = 35.027;
                break;
            case 11:
                height = 38.475;
                break;
            case 12:
                height = 42.084;
                break;
            case 13:
                height = 45.53;
                break;
            case 14:
                height = 49.093;
                break;
            case 15:
                height = 52.661;
                break;
            case 16:
                height = 56.174;
                break;
            case 17:
                height = 59.612;
                break;
            case 18:
                height = 63.147;
                break;
            case 19:
                height = 66.65;
                break;
            case 20:
                height = 70.336;
                break;
            case 21:
                height = 74.9;
                break;
        }
        return height;
    }
    getFloorByHeight(height) {
        const self = this;
        let floor = 0;
        if (height < 6.691) {
            floor = 1;
        }
        else if (height >= 6.691 && height < 10.966) {
            floor = 2;
        }
        else if (height >= 10.966 && height < 14.732) {
            floor = 3;
        }
        else if (height >= 14.732 && height < 18.088) {
            floor = 4;
        }
        else if (height >= 18.088 && height < 21.167) {
            floor = 5;
        }
        else if (height >= 21.167 && height < 24.314) {
            floor = 6;
        }
        else if (height >= 24.314 && height < 27.924) {
            floor = 7;
        }
        else if (height >= 27.924 && height < 31.464) {
            floor = 8;
        }
        else if (height >= 31.464 && height < 35.027) {
            floor = 9;
        }
        else if (height >= 35.027 && height < 38.475) {
            floor = 10;
        }
        else if (height >= 38.475 && height < 42.084) {
            floor = 11;
        }
        else if (height >= 42.084 && height < 45.53) {
            floor = 12;
        }
        else if (height >= 45.53 && height < 49.093) {
            floor = 13;
        }
        else if (height >= 49.093 && height < 52.661) {
            floor = 14;
        }
        else if (height >= 52.661 && height < 56.174) {
            floor = 15;
        }
        else if (height >= 56.174 && height < 59.612) {
            floor = 16;
        }
        else if (height >= 59.612 && height < 63.147) {
            floor = 17;
        }
        else if (height >= 63.147 && height < 66.65) {
            floor = 18;
        }
        else if (height >= 66.65 && height < 70.336) {
            floor = 19;
        }
        else if (height >= 70.336 && height < 74.845) {
            floor = 20;
        }
        else if (height >= 74.845) {
            floor = 21;
        }
        return floor;
    }
    lookAt(options) {
        const self = this;
        options = Object.assign({
            direction: true,
            time: 3000
        }, options);
        let position = options.direction ? [
            { "x": -29.11392184582173, "y": 0, "z": 120.48300917699493 },
            { "x": 3.83151333268774, "y": options.height, "z": 6.535004018291484 }
        ] : [
            { "x": 3.83151333268774, "y": options.height, "z": 6.535004018291484 },
            { "x": -29.11392184582173, "y": 0, "z": 120.48300917699493 }
        ];
        self.$scope._Camera.lookAt(position, { "x": 4.412645980293009, "y": 0, "z": 1.4591865279383303 }, options.time, options.onComplete);
    }
    render() {
    }
}
