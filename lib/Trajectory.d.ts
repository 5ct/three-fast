/**
 * 轨迹
 */
export class Trajectory extends Base {
    constructor(target: any);
    options: {
        number: number;
        percent: number;
        tension: number;
        time: number;
        repeat: number;
        color: string;
    };
    isFrist: boolean;
    curveObject: any;
    init(options?: {}): void;
    createLintMove(options: any): void;
    getColor(color: any): number[];
    exportData(): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Trajectory.d.ts.map