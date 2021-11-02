/**
 * 创建物理引擎
 */
export class Physics extends Base {
    constructor($scope: any);
    collisionConfiguration: any;
    dispatcher: any;
    broadphase: any;
    transformAux1: any;
    solver: any;
    physicsWorld: any;
    rigidBodies: any[];
    margin: number;
    time: number;
    scene: any;
    init(options?: {}): void;
    initPhysics(): void;
    createGround(group: any): void;
    createNewObjects(): void;
    resetMode(group: any, mass: any): void;
    /**
     *
     * @param threeObject
     * @param physicsShape
     * @param mass //质量  质量设置成0就可以不会掉落了
     * @param quat
     * @returns {o9|o9}
     */
    createRigidBody(threeObject: any, physicsShape: any, mass: number, pos: any): any | any;
    updatePhysics(): void;
    destroyed(): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Physics.d.ts.map