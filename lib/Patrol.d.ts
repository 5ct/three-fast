/**
 * 巡视特效
 */
export class Patrol extends Base {
    constructor(target: any);
    curveObject: any;
    /**
     * 通过点位创建巡视曲线
     * @param data
     * @returns {THREE.Line|*|THREE.Line|THREE.Line}
     */
    init(data: any): THREE.Line | any | THREE.Line | THREE.Line;
    circle(object: any, params: any): void;
    resetCircle(object: any, params: any): void;
    destroyed(): void;
    data: {};
    render(): void;
}
import { Base } from "./Base";
declare let THREE: any;
export {};
//# sourceMappingURL=Patrol.d.ts.map