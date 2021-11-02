export class Composer extends Base {
    constructor(scope: any, options: any);
    composer: any;
    finalComposer: any;
    materials: any[];
    /**
     * 初始化
     */
    init(): void;
    /**
     *  渲染辉光
     * @param renderPass
     */
    renderBloomPass(renderPass: any): void;
    render(): void;
    destroyed(): void;
    storeMaterial(obj: any): void;
    restoreMaterial(obj: any): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Composer.d.ts.map