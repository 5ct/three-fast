/**
 * 创建辅助线
 */
export class HelpLine extends Base {
    constructor(scope: any, options: any);
    splines: any;
    transformControl: any;
    hiding: any;
    init(line?: {
        x: number;
        y: number;
        z: number;
    }[]): void;
    initDragControl(objects: any): DragControls;
    initTransformControl(): void;
    hideTransform(): void;
    cancelHideTransform(): void;
    delayHideTransform(): void;
    destroyed(): void;
    render(): void;
}
import { Base } from "./Base";
import { DragControls } from "three/examples/jsm/controls/DragControls";
//# sourceMappingURL=HelpLine.d.ts.map