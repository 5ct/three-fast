export class ThreeMap extends Comm {
    constructor(options?: {});
    initTHREE(): void;
    initFBXData(): Promise<void>;
    initEffectComposer(): void;
    composer: EffectComposer;
    renderBloomPass(renderPass: any): void;
    finalComposer: EffectComposer;
    initText(object: any, data: any): void;
    /***************事件************************/
    /**
     * 控制改变
     * @param target 当前选中元素
     */
    controlChange(target: any): void;
    setMsgDomStyle(): void;
    setToolTipDomStyle(): void;
    toolTipArray: any;
    clearToolTipDom(className: any): void;
    mouseDown(): void;
    initDown(event: any): void;
    running(): void;
    storeMaterial(obj: any): void;
    restoreMaterial(obj: any): void;
    addDom(models: any): any;
    initTip(position: any, item: any, className: string, iconClass: any): void;
}
import { Comm } from "./Comm.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
//# sourceMappingURL=ThreeMap.d.ts.map