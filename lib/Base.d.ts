/// <reference types="gsap/types/gsap-core" />
export class Base {
    constructor(scope?: this);
    $scope: {};
    Container: any;
    Width: number;
    Height: number;
    preserveDrawingBuffer: boolean;
    diffWidth: number;
    diffHeight: number;
    deepAssign: any;
    TimelineLite: typeof TimelineLite;
    TimelineMax: typeof TimelineMax;
    TweenMax: any;
    Bounce: gsap.Ease;
    THREE: typeof THREE;
    Stats: any;
    CLOCK: THREE.Clock;
    Angle: number;
    Delta: any;
    Scene: any;
    Renderer: any;
    LabelRenderer: any;
    Camera: any;
    Control: any;
    Composer: any;
    renderGUI: any;
    initAttr(scope: any): void;
    initRenderer(): void;
    initHelper(data?: {
        size: number;
    }): void;
    initGrid(data?: {
        size: number;
        divisions: number;
        color: string[];
        opacity: number;
    }): void;
    creatPointMode(data: any): THREE.Group;
    deleteGroup(object: any): void;
    /**
     * 清除模型，模型中有 group 和 scene,需要进行判断,释放内存
     * @param scene
     * @returns
     */
    deleteGroupAndScene(): void;
    createOutline(objectsArray: any, visibleColor?: string, tempColor?: string): OutlinePass;
    windowResize(): void;
    /***********************辅助工具**********************************/
    getTransPosition2D(position?: {
        x: number;
        y: number;
        z: number;
    }): {
        x: number;
        y: number;
    };
    getTransPosition3D(position?: {
        x: number;
        y: number;
    }): THREE.Vector3;
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
    getModeCenterPoint(group: any): THREE.Vector3;
    colorRGBtoHex(color: any): string;
    color(color: any): THREE.Color;
    /**
     *
     * @param object
     * @param params
     * @param rangs 名称 最大值 最小值 间距
     */
    initGUI(object: any, params: any, rangs: any): void;
    initRenderGUI(params: any, rangs: any): void;
    export(params: any): void;
    randomMeshShow: {
        clear(object: any): void;
        full(object: any): void;
        add(object: any, number: any): void;
        sub(object: any): void;
        save(object: any): void;
        reset(object: any): void;
    };
    loadTextLoad(img: any): THREE.Texture;
}
import { TimelineLite } from "gsap/gsap-core";
import { TimelineMax } from "gsap/gsap-core";
import * as THREE from "three";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
//# sourceMappingURL=Base.d.ts.map