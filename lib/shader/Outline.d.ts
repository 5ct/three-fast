export class Outline extends Base {
    constructor(scope: any, options: any);
    /**
     * 初始化
     */
    init(): void;
    /**
     *  渲染辉光
     * @param renderPass
     */
    outlineShader(renderPass: any): any;
    render(): void;
    destroyed(): void;
}
import { Base } from "../Base";
//# sourceMappingURL=Outline.d.ts.map