/**
 * 加载FBX模型
 */
export class FBXMode extends Base {
    constructor(target: any, options: any);
    FBXLoader: FBXLoader;
    LineMoves: any[];
    FBXData: any[];
    mixers: any[];
    _Storm: any;
    _Particles: Particles;
    _ModeMove: ModeMove;
    _CSS2D: CSS2D;
    _CSS3D: any;
    _FireObject: any;
    _Burst: Burst;
    _Landing: Landing;
    _LineMove: LineMove;
    hoverMesh: any;
    init(data?: any[]): Promise<void>;
    loadModeByData(item: any): Promise<void>;
    loadFBXData(data: any): Promise<any>;
    updateMaterialByMaterial(material: any, data: any): any;
    updateMaterialMap(material: any, options: any): any;
    mouseDown(options: any): void;
    initDown(event: any, options: any, type?: string): void;
    getGroup(objects: any): any;
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
    /**
     * 通过模型删除模型
     * @param name 模型名称
     */
    deleteFBXDataByGroup(group: any): void;
    removeGroup(group: any): void;
    destroyed(): void;
    render(): void;
}
import { Base } from "./Base";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Particles } from "./Particles";
import { ModeMove } from "./ModeMove";
import { CSS2D } from "./CSS2D";
import { Burst } from "./Burst";
import { Landing } from "./Landing";
import { LineMove } from "./LineMove";
//# sourceMappingURL=FBXMode.d.ts.map