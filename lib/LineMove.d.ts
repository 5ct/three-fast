export class LineMove extends Base {
    constructor(target: any);
    curveIndex: number;
    moveObjects: any[];
    geometryOBJ: any;
    init(object: any, data: any): any;
    initMoveLine(data: any): any;
    getCurveGeometry(data: any): {
        geometry: any;
        curve: any;
        points: any;
    };
    getSpacedCurve(data: any): any;
    createTubeGeometry(line: any): void;
    destroyedGeometry(): void;
    createLineGeometry(line: any): void;
    createPointsGeometry(line: any): void;
    destroyed(): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=LineMove.d.ts.map