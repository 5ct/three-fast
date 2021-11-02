import { Base } from "./Base";
import { LightningStorm } from "three/examples/jsm/objects/LightningStorm";
let THREE;
/**
 *
 * 创建闪电
 */
export class Storm extends Base {
    constructor(scope, options) {
        super(scope);
        this.stormTime = 0;
        this.stormIndex = 1;
        THREE = this.THREE;
        this.init(options);
    }
    //初始化雷击
    init(options = {}) {
        const self = this, scene = self.Scene;
        let lightningMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xB0FFFF) });
        let rayDirection = new THREE.Vector3(0, -1, 0);
        let rayLength = 0;
        let vec1 = new THREE.Vector3();
        let vec2 = new THREE.Vector3();
        options = Object.assign({
            radius0: 1,
            radius1: 0.5,
            minRadius: 0.3,
            maxIterations: 7,
            timeScale: 0.05,
            propagationTimeFactor: 0.1,
            vanishingTimeFactor: 0.9,
            subrayPeriod: 5,
            subrayDutyCycle: 0.6,
            maxSubrayRecursion: 3,
            ramification: 5,
            recursionProbability: 0.4,
            roughness: 0.85,
            straightness: 0.65,
            onSubrayCreation: function (segment, parentSubray, childSubray, lightningStrike) {
                lightningStrike.subrayConePosition(segment, parentSubray, childSubray, 0.6, 0.6, 0.5);
                // Plane projection
                rayLength = lightningStrike.rayParameters.sourceOffset.y;
                vec1.subVectors(childSubray.pos1, lightningStrike.rayParameters.sourceOffset);
                let proj = rayDirection.dot(vec1);
                vec2.copy(rayDirection).multiplyScalar(proj);
                vec1.sub(vec2);
                let scale = proj / rayLength > 0.5 ? rayLength / proj : 1;
                vec2.multiplyScalar(scale);
                vec1.add(vec2);
                childSubray.pos1.addVectors(vec1, lightningStrike.rayParameters.sourceOffset);
            }
        }, options);
        // 雷击的标记
        let starVertices = [];
        let prevPoint = new THREE.Vector3(0, 0, 1);
        let currPoint = new THREE.Vector3();
        let number = 2;
        for (let i = 1; i <= number; i++) {
            currPoint.set(Math.sin(2 * Math.PI * i / number), 0, Math.cos(2 * Math.PI * i / number));
            if (i % 2 === 1) {
                currPoint.multiplyScalar(0.3);
            }
            starVertices.push(0, 0, 0);
            starVertices.push(prevPoint.x, prevPoint.y, prevPoint.z);
            starVertices.push(currPoint.x, currPoint.y, currPoint.z);
            prevPoint.copy(currPoint);
        }
        let starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        let starMesh = new THREE.Mesh(starGeometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xB0FFFF) }));
        starMesh.scale.multiplyScalar(6);
        let newStorm = new LightningStorm({
            size: 1200,
            minHeight: 400,
            maxHeight: 600,
            maxSlope: 0.3,
            maxLightnings: 30,
            lightningParameters: options,
            lightningMaterial: lightningMaterial,
            onLightningDown: function (lightning) {
                let star1 = starMesh.clone();
                star1.position.copy(lightning.rayParameters.destOffset);
                star1.position.y = 0.05;
                star1.rotation.y = 2 * Math.PI * Math.random();
                scene.add(star1);
            }
        });
        scene.add(newStorm);
        self.createOutline(newStorm.lightningsMeshes, "rgb(255, 0, 255)");
        self.newStorm = newStorm;
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
        self.stormTime += self.stormIndex * self.$scope.$scope.Delta * 3;
        self.newStorm.update(self.stormTime);
    }
}
