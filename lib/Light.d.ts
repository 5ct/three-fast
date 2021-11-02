/**
* 创建灯效
*/
export class Light extends Base {
    constructor(scope: any);
    createHemisphereLight(data?: {
        color: number[];
        position: number[];
    }[]): any[];
    createPointLight(data?: ({
        distance: number;
        intensity: number;
        color: number;
        position: number[];
    } | {
        distance: number;
        intensity: number;
        color: string;
        position: number[];
    })[]): any[];
    dazzle(data?: ({
        distance: number;
        intensity: number;
        color: number;
        size: number;
        position: number[];
    } | {
        distance: number;
        intensity: number;
        color: string;
        size: number;
        position: number[];
    })[]): any[];
    changeLightPosition(lights: any, positions: any): void;
    destroyed(): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Light.d.ts.map