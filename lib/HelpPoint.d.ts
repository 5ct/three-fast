export class HelpPoint extends Base {
    constructor(scope: any);
    transformControl: any;
    hiding: any;
    addLine: any;
    init(points?: {
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
//# sourceMappingURL=HelpPoint.d.ts.map