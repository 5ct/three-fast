/**
 * 模型炸裂
 */
export class Elevator extends Base {
    constructor(scope: any);
    index: number;
    saveFloor: number;
    init(data?: {}): void;
    selectFloor(object: any, options: any): void;
    getHeightByFloor(floor: any): number;
    getFloorByHeight(height: any): number;
    lookAt(options: any): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Elevator.d.ts.map