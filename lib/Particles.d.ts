/// <reference types="gsap/types/ease" />
/// <reference types="gsap/types/gsap-utils" />
/// <reference types="gsap/types/gsap-core" />
/// <reference types="gsap/types/css-plugin" />
/// <reference types="gsap" />
/**
 * 创建粒子特效
 */
export class Particles extends Base {
    constructor(target: any);
    particles: any[];
    particleFires: any[];
    particleMode: any[];
    init(options?: {}): Promise<any>;
    /**
     * 创建粒子火焰
     * @param object
     * @param data
     */
    fire(object: any, data?: {}): void;
    creatParticleMode(data?: {}): any;
    destroyedParticleMode(): void;
    particleBounce(group: any): import("gsap").TimelineLite;
    destroyed(): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=Particles.d.ts.map