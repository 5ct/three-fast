export class Mapbox {
    constructor(options?: {});
    original: {};
    initThree(): void;
    loadMapBox(): Promise<any>;
    loadModel(map: any): Promise<any>;
    initScene(): void;
    scene: THREE.Scene;
    initCamera(): void;
    camera: THREE.Camera;
    initPerspectiveCamera(): void;
    initOrthographicCamera(): void;
    initPerson(): void;
    person: THREE.Object3D;
    initHelper(): void;
    initHemisphereLight(): void;
    hemisphereLight: any[];
    initPointLight(): void;
    pointLight: any[];
    initGrid(): void;
    grid: THREE.GridHelper;
    initSurface(): void;
    initLine(): void;
    initFBXData(): Promise<any>;
    FBXData: any;
    creatBoundingBox(object: any): THREE.Mesh;
    initRenderer(): void;
    renderer: THREE.WebGLRenderer;
    initEffectComposer(): void;
    composer: EffectComposer;
    initMapControl(): void;
    controls: OrbitControls;
    initModelControl(): void;
    /***************事件************************/
    /**
     * 切换相机
     * @param type 相机类型
     * 1、正交相机
     * 2、透视相机
     */
    changeCamera(type: any): void;
    /**
     * 控制改变
     * @param target 当前选中元素
     */
    controlChange(target: any): void;
    addDom(models: any): any;
    setMsgDomStyle(): void;
    msgArray: any;
    initTip(position: any, item: any, className: string, iconClass: any): void;
    setToolTipDomStyle(): void;
    toolTipArray: any;
    clearToolTipDom(className: any): void;
    onLoadModel(): void;
    mouseDown(): void;
    mouseOver(): void;
    running(): void;
    windowResize(): void;
    /*****************注销three*****************************/
    clearDom(): void;
    clearMsgData(): void;
    /**
     * 清除模型，模型中有 group 和 scene,需要进行判断,释放内存
     * @param scene
     * @returns
     */
    deleteGroupAndScene(): void;
    deleteGroup(group: any): void;
    destroyed(): void;
    isRunning: boolean;
    /***********************UTILS**********************************/
    transPosition(position?: {
        x: number;
        y: number;
        z: number;
    }): {
        x: number;
        y: number;
    };
    /**
     * 已知两点获取两点之间在x坐标的3维向量坐标
     * @param x：当点的x坐标时
     * @param point1：起始点
     * @param point2：结束点
     * @returns {Vector3} 3维向量坐标
     */
    getLinePoint(x: any, point1: any, point2: any): any;
    getPointAt(points: any): {
        prevPoint: any;
        point: any;
    };
}
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
//# sourceMappingURL=Mapbox.d.ts.map