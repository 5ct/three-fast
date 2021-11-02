/**
 * 飘动特效
 */
export class Flutter extends Base {
    constructor(scope: any);
    pins: any[];
    objects: any[];
    gravity: any;
    windForce: any;
    tmpForce: any;
    models: any[];
    MASS: number;
    TIMESTEP: number;
    detal: number;
    gravityX: number;
    gravityY: number;
    DAMPING: number;
    rotateX: number;
    TIMESTEP_SQ: number;
    init(): void;
    initData(positions: any): any[];
    createMode(position: any): void;
    exportData(): void;
    plane(width: any, height: any): (u: any, v: any, target: any) => void;
    simulate(time: any, model: any): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Flutter.d.ts.map