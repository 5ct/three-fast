export class Comm {
    constructor(options: any);
    _THREE: typeof _THREE;
    _CSS2DObject: typeof CSS2DObject;
    _Stats: typeof Stats;
    _FBXLoader: FBXLoader;
    _CLOCK: _THREE.Clock;
    _PI: number;
    original: {};
    dom: {};
    curveIndex: number;
    stormIndex: number;
    stormTime: number;
    isRunning: boolean;
    particles: any[];
    moveObjects: any[];
    initScene(): void;
    scene: _THREE.Scene;
    initPerspectiveCamera(): void;
    camera: _THREE.PerspectiveCamera | _THREE.OrthographicCamera;
    initOrthographicCamera(): void;
    initMapControl(): void;
    controls: OrbitControls;
    initModelControl(): void;
    initDragControl(objects: any): void;
    dragControls: DragControls;
    initTransformControl(): void;
    transformControl: TransformControls;
    hideTransform(): void;
    hiding: NodeJS.Timeout;
    cancelHideTransform(): void;
    delayHideTransform(): void;
    initHemisphereLight(): void;
    hemisphereLight: any[];
    initPointLight(): void;
    pointLight: any[];
    onLoadModel(): void;
    creatBoundingBox(object: any): _THREE.Mesh;
    initMoveData(data: any): Promise<any>;
    initMoveLine(data: any): _THREE.Line;
    initRenderer(): void;
    renderer: _THREE.WebGLRenderer;
    labelRenderer: CSS2DRenderer;
    render(): void;
    windowResize(): void;
    /*****************事件*****************************/
    /**
     * 切换相机
     * @param type 相机类型
     * 1、正交相机
     * 2、透视相机
     */
    changeCamera(type: any): void;
    /*****************注销_THREE*****************************/
    clearDom(): void;
    msgArray: any[];
    clearMsgData(): void;
    FBXData: any;
    /**
     * 清除模型，模型中有 group 和 scene,需要进行判断,释放内存
     * @param scene
     * @returns
     */
    deleteGroupAndScene(): void;
    deleteGroup(object: any): void;
    destroyed(): void;
    /***********************辅助工具**********************************/
    createParticles(options?: {}): Promise<any>;
    renderParticles(): void;
    createStorm(options?: {}): void;
    storm: LightningStorm;
    renderStorm(): void;
    createFire(object: any): void;
    renderFire(): void;
    createOutline(objectsArray: any, visibleColor: any): OutlinePass;
    initHelper(): void;
    initHelperLine(): void;
    splines: {
        uniform: _THREE.CatmullRomCurve3;
        centripetal: _THREE.CatmullRomCurve3;
        chordal: _THREE.CatmullRomCurve3;
    };
    loadFBXData(data: any): Promise<any>;
    initGrid(): void;
    grid: _THREE.GridHelper;
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
    /**
     * 通过UUID查询存在模型
     * @param uuid 模型唯一id
     * @return {Array} 查询到的模型列表
     */
    findFBXDataByUUID(uuid: any): any[];
    /**
     * 通过模型名称查询存在模型
     * @param name 模型名称
     * @return {Array} 查询到的模型列表
     */
    findFBXDataByName(name: any): any[];
    /**
     * 通过UUID查询是否存在模型
     * @param uuid 模型唯一id
     */
    isExistFBXDataByUUID(uuid: any): boolean;
    /**
     * 通过模型名称查询是否存在模型
     * @param name 模型名称
     */
    isExistFBXDataByName(name: any): boolean;
    /**
     * 通过UUID隐藏或显示模型
     * @param uuid 模型唯一id
     * @param isHide 是否隐藏
     */
    isHideFBXDataByUUID(uuid: any, isHide?: boolean): void;
    /**
     * 通过模型名称隐藏或显示模型
     * @param name 模型名称
     * @param isHide 是否隐藏
     */
    isHideFBXDataByName(name: any, isHide?: boolean): void;
    /**
     * 通过UUID删除模型
     * @param uuid 模型唯一id
     * @param isHide 是否隐藏
     */
    deleteFBXDataByUUID(uuid: any): void;
    /**
     * 通过模型名称删除模型
     * @param name 模型名称
     */
    deleteFBXDataByName(name: any): void;
}
import * as _THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { LightningStorm } from "three/examples/jsm/objects/LightningStorm.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
//# sourceMappingURL=Comm.d.ts.map