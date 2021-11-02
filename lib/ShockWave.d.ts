/**
 * 冲击波特效
 */
export class ShockWave extends Base {
    constructor(scope: any);
    index: number;
    ShaderBar: {
        uniforms: {
            boxH: {
                value: number;
            };
        };
        vertexShader: string;
        fragmentShader: string;
    };
    init(data?: {}): void;
    render(): void;
}
import { Base } from "./Base";
//# sourceMappingURL=ShockWave.d.ts.map