/**
 * 车流动效特效
 */
export class Traffic extends Base {
    constructor(target: any);
    params: any;
    objects: any[];
    /**
     * 通过点位创建巡视曲线
     * @param data
     * @returns {THREE.Line|*|THREE.Line|THREE.Line}
     */
    init(object: any): THREE.Line | any | THREE.Line | THREE.Line;
    render(): void;
}
import { Base } from "./Base";
declare let THREE: any;
export {};
//# sourceMappingURL=Traffic.d.ts.map