export class Camera extends Base {
    constructor(scope: any, options: any);
    lookAtCircleOBJ: any[];
    lookAtOBJ: any;
    /**
     * 初始化相机
     * @param type 相机类型
     * 1、正交相机
     * 2、透视相机
     */
    init(options?: {}): void;
    creatPerspectiveCamera(data?: {}): any;
    creatOrthographicCamera(data?: {}): any;
    lookAt(positions: any, focus: any, time: number, onComplete: any): void;
    lookAtCircle(options: any): any;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Camera.d.ts.map