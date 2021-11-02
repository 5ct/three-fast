import { Base } from "./Base";
require("./Physijs/physi");
let Ammo = require("./Physijs/examples/js/ammo.js").Ammo;
let THREE, Physijs = window.Physijs; //物理引擎;
/**
 * 创建物理引擎
 */
export class Physics extends Base {
    constructor($scope) {
        super($scope);
        this.transformAux1 = new Ammo.btTransform();
        this.rigidBodies = [];
        this.margin = 0.05;
        this.time = 0;
        THREE = this.THREE;
        this.init();
    }
    //初始化物理引擎 创建和配置物理世界
    init(options = {}) {
        const self = this;
        Physijs.scripts.worker = "../../three/Physijs/physijs_worker.js";
        Physijs.scripts.ammo = "../../three/Physijs/examples/js/ammo.js";
        let scene = new Physijs.Scene();
        self.$scope.Scene = scene;
        self.initPhysics();
    }
    initPhysics() {
        // bullet基本场景配置
        const self = this;
        self.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        self.dispatcher = new Ammo.btCollisionDispatcher(self.collisionConfiguration);
        self.broadphase = new Ammo.btDbvtBroadphase();
        self.solver = new Ammo.btSequentialImpulseConstraintSolver();
        self.physicsWorld = new Ammo.btDiscreteDynamicsWorld(self.dispatcher, self.broadphase, self.solver, self.collisionConfiguration);
        self.physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0)); //重力
        self.createNewObjects();
    }
    createGround(group) {
        const self = this;
        //通过传入的object3D对象来返回当前模型的最小大小，值可以使一个mesh也可以使group
        let box = new THREE.Box3();
        box.expandByObject(group);
        let pos = new THREE.Vector3();
        pos.set(0, 0, 0);
        self.createRigidBody(group, new Ammo.btBoxShape(new Ammo.btVector3(box.max.x, 0, box.max.z)), 0, pos);
        // self.createNewObjects();
    }
    createNewObjects() {
        const self = this;
        let pos = new THREE.Vector3();
        let quat = new THREE.Quaternion();
        //创建地面
        pos.set(0, 0, 0);
        quat.set(0, 0, 0, 1);
        //创建50个小球
        for (let i = 0; i < 50; i++) {
            let ball = new Physijs.BoxMesh(new THREE.SphereGeometry(0.5, 13, 13), Physijs.createMaterial(new THREE.MeshPhongMaterial({
                color: Math.floor(Math.random() * (1 << 24))
            })), 1, 0.4);
            ball.castShadow = true;
            ball.receiveShadow = true;
            pos.set(Math.random() * 10 + 10, 2 * (i + 1) + 30, Math.random() * 10 + 10);
            ball.position.copy(pos);
            ball.quaternion.copy(quat);
            self.$scope.Scene.add(ball);
            let ballShape = new Ammo.btSphereShape(0.5);
            ballShape.setMargin(0.05);
            self.createRigidBody(ball, ballShape, 5, pos);
            ball.userData.physicsBody.setFriction(1.5);
        }
    }
    resetMode(group, mass) {
        const self = this;
        let box = new THREE.Box3();
        box.expandByObject(group);
        let newBox = new THREE.Vector3().addVectors(box.min, box.max).multiplyScalar(0.5);
        console.info(Ammo);
        self.createRigidBody(group, new Ammo.btBoxShape(new Ammo.btVector3(newBox.x, newBox.y, newBox.z)), 0, newBox);
        group.userData.physicsBody.setFriction(1.5);
    }
    /*createNewObjects(group,mass){
        const self = this;
        self.createRigidBody(group, new Ammo.btSphereShape(0.5), mass);
        group.userData.physicsBody.setFriction(1.5);
    }*/
    /**
     *
     * @param threeObject
     * @param physicsShape
     * @param mass //质量  质量设置成0就可以不会掉落了
     * @param quat
     * @returns {o9|o9}
     */
    createRigidBody(threeObject, physicsShape, mass = 0, pos) {
        const self = this;
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z)); //刚体初始位置
        transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1)); //物体旋转
        let motionState = new Ammo.btDefaultMotionState(transform); //运动状态 大概是动量
        let localInertia = new Ammo.btVector3(0, 0, 0); //惯性
        physicsShape.calculateLocalInertia(mass, localInertia); // //应该是把shape对象里边的一些参数计算一下，比方说计算一下质量的倒数，惯性的倒数   在需要的时候不用每一次的计算了
        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);
        body.setFriction(1.5);
        console.info(threeObject);
        threeObject.userData.physicsBody = body;
        if (mass > 0) {
            self.rigidBodies.push(threeObject);
            body.setActivationState(4);
        }
        self.physicsWorld.addRigidBody(body);
    }
    updatePhysics() {
        const self = this;
        let rigidBodies = self.rigidBodies, transformAux1 = self.transformAux1;
        self.physicsWorld.stepSimulation(self.$scope.$scope.Delta);
        // 更新物体位置
        for (let i = 0, iL = rigidBodies.length; i < iL; i++) {
            let objThree = rigidBodies[i];
            let objPhys = objThree.userData.physicsBody;
            let ms = objPhys.getMotionState();
            if (ms) {
                ms.getWorldTransform(transformAux1);
                let p = transformAux1.getOrigin();
                let q = transformAux1.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        }
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
        self.updatePhysics(self.$scope.$scope.Delta);
        self.$scope.Scene.simulate(undefined, 1);
    }
}
