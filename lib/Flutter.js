import { Base } from "./Base";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
let THREE;
/**
 * 飘动特效
 */
export class Flutter extends Base {
    constructor(scope) {
        super(scope);
        this.pins = [];
        this.objects = [];
        this.models = [];
        this.MASS = 0.5;
        this.TIMESTEP = 0.01;
        this.detal = 145;
        this.gravityX = 298;
        this.gravityY = 487;
        this.DAMPING = 0.0631;
        this.rotateX = 35;
        this.TIMESTEP_SQ = this.TIMESTEP * this.TIMESTEP;
        THREE = this.THREE;
        this.init();
    }
    //初始化
    init() {
        const self = this;
        self.gravity = new THREE.Vector3(self.gravityY, self.gravityY, 0).multiplyScalar(self.MASS); //设置重力
        self.windForce = new THREE.Vector3();
        self.tmpForce = new THREE.Vector3();
    }
    initData(positions) {
        const self = this;
        if (positions instanceof Array) {
            positions.forEach(position => {
                self.createMode(position);
            });
        }
        else {
            self.createMode(positions);
        }
        return self.objects;
    }
    //创建模型
    createMode(position) {
        const self = this, scene = self.Scene;
        let DAMPING = 0.002; //阻尼
        let DRAG = 1 - DAMPING; //摩檫力
        let restDistance = 2; //静止距离
        let xSegs = 3 * 3;
        let ySegs = 2 * 3;
        let clothFunction = self.plane(restDistance * xSegs, restDistance * ySegs);
        let cloth = new Cloth(xSegs, ySegs);
        //粒子
        function Particle(x, y, z, mass) {
            this.position = new THREE.Vector3();
            this.previous = new THREE.Vector3();
            this.original = new THREE.Vector3();
            this.acceleration = new THREE.Vector3(0, 0, 0); // acceleration
            this.mass = mass;
            this.invMass = 1 / mass;
            this.tmp = new THREE.Vector3();
            this.tmp2 = new THREE.Vector3();
            // init
            clothFunction(x, y, this.position); // position
            clothFunction(x, y, this.previous); // previous
            clothFunction(x, y, this.original);
        }
        // Force -> Acceleration
        /**
         * 添加力获取加速度
         * @param force
         */
        Particle.prototype.addForce = function (force) {
            this.acceleration.add(this.tmp2.copy(force).multiplyScalar(this.invMass));
        };
        // Performs Verlet integration
        Particle.prototype.integrate = function (timesq) {
            let newPos = this.tmp.subVectors(this.position, this.previous);
            newPos.multiplyScalar(1 - self.DAMPING).add(this.position);
            newPos.add(this.acceleration.multiplyScalar(timesq));
            this.tmp = this.previous;
            this.previous = this.position;
            this.position = newPos;
            this.acceleration.set(0, 0, 0);
        };
        function Cloth(w, h) {
            w = w || 10;
            h = h || 10;
            this.w = w;
            this.h = h;
            let particles = [];
            let constraints = [];
            let u, v;
            // 创建粒子
            for (v = 0; v <= h; v++) {
                for (u = 0; u <= w; u++) {
                    particles.push(new Particle(u / w, v / h, 0, self.MASS));
                }
            }
            // 构造
            for (v = 0; v < h; v++) {
                for (u = 0; u < w; u++) {
                    constraints.push([
                        particles[index(u, v)],
                        particles[index(u, v + 1)],
                        restDistance
                    ]);
                    constraints.push([
                        particles[index(u, v)],
                        particles[index(u + 1, v)],
                        restDistance
                    ]);
                }
            }
            for (u = w, v = 0; v < h; v++) {
                constraints.push([
                    particles[index(u, v)],
                    particles[index(u, v + 1)],
                    restDistance
                ]);
            }
            for (v = h, u = 0; u < w; u++) {
                constraints.push([
                    particles[index(u, v)],
                    particles[index(u + 1, v)],
                    restDistance
                ]);
            }
            this.particles = particles;
            this.constraints = constraints;
            function index(u, v) {
                return u + v * (w + 1);
            }
            this.index = index;
        }
        let texture = new THREE.TextureLoader().load(position.img || "three/qp/nationalFlag.jpg", function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            texture.rotation = self.Angle * 90;
        });
        texture.anisotropy = 1;
        let clothMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
        });
        let clothGeometry = new THREE.ParametricBufferGeometry(clothFunction, cloth.w, cloth.h);
        let object = new THREE.Mesh(clothGeometry, clothMaterial);
        object.position.set(position.x, position.y, position.z);
        object.customDepthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
            map: texture,
        });
        object.rotateZ(self.Angle * 270);
        object.rotateX(self.Angle * self.rotateX);
        object.scale.set(0.2, 0.2, 0.2);
        object.userData.data = position;
        scene.add(object);
        clothGeometry.pins = [];
        for (let i = 0; i < cloth.w; i++) {
            clothGeometry.pins.push(i);
        }
        clothGeometry.cloth = cloth;
        self.models.push(clothGeometry);
        self.objects.push(object);
        // self.initGUI();
    }
    exportData() {
        const self = this;
        let code = "MASS=" + self.MASS + ";\n" +
            "            TIMESTEP=" + self.TIMESTEP + ";\n" +
            "            detal=" + self.detal + ";\n" +
            "            gravityX= " + self.gravityX + ";\n" +
            "            gravityY=" + self.gravityY + ";\n" +
            "            rotateX=" + self.rotateX + ";\n" +
            "            DAMPING=" + self.DAMPING + ";\n";
        prompt('copy and paste code', code);
    }
    initGUI() {
        const self = this;
        let gui = new GUI(), params = {
            MASS: self.MASS,
            TIMESTEP: self.TIMESTEP,
            detal: self.detal,
            gravityX: self.gravityX,
            gravityY: self.gravityY,
            DAMPING: self.DAMPING,
            rotateX: self.rotateX + 110,
            exportData: self.exportData,
        };
        gui.domElement.style = 'position:absolute;top:300px;right:0px;z-index:99999;margin: 0;';
        self.Container.appendChild(gui.domElement);
        gui.add(params, 'MASS', 0.001, 0.1).step(0.0001).onChange(function (value) {
            self.MASS = value;
            self.gravity = new THREE.Vector3(self.gravityY, self.gravityX, 0).multiplyScalar(self.MASS); //设置重力
        });
        gui.add(params, 'TIMESTEP', 0.00001, 0.001).step(0.00001).onChange(function (value) {
            self.TIMESTEP = value;
            self.TIMESTEP_SQ = self.TIMESTEP * self.TIMESTEP;
        });
        gui.add(params, 'gravityY', 1, 600).step(1).onChange(function (value) {
            self.gravityY = value;
            self.gravity = new THREE.Vector3(self.gravityY, self.gravityX, 0).multiplyScalar(self.MASS); //设置重力
        });
        gui.add(params, 'gravityX', 1, 600).step(1).onChange(function (value) {
            self.gravityX = value;
            self.gravity = new THREE.Vector3(self.gravityY, self.gravityX, 0).multiplyScalar(self.MASS); //设置重力
        });
        gui.add(params, 'detal', -1000, 1000).step(1).onChange(function (value) {
            self.detal = value;
        });
        gui.add(params, 'DAMPING', 0.0001, 1).step(0.0001).onChange(function (value) {
            self.DAMPING = value;
        });
        gui.add(params, 'rotateX', 0, 150).step(1).onChange(function (value) {
            self.objects.forEach(object => {
                object.rotateX(self.Angle * value);
            });
        });
        gui.add(params, 'exportData');
        gui.open();
    }
    //面版
    plane(width, height) {
        return function (u, v, target) {
            target.set((u - 0.5) * width, (v + 0.5) * height, 0);
        };
    }
    simulate(time, model) {
        const self = this;
        if (!self.lastTime) {
            self.lastTime = time;
            return;
        }
        let particles;
        // Aerodynamics forces
        let normal = new THREE.Vector3();
        let indices = model.index;
        let normals = model.attributes.normal;
        particles = model.cloth.particles;
        for (let i = 0; i < indices.count; i += 3) {
            for (let j = 0; j < 3; j++) {
                let index = indices.getX(i + j);
                normal.fromBufferAttribute(normals, index);
                self.tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(self.windForce));
                if (particles[index]) {
                    particles[index].addForce(self.tmpForce);
                }
            }
        }
        particles.forEach(particle => {
            particle.addForce(self.gravity);
            particle.integrate(self.TIMESTEP_SQ);
        });
        // Start Constraints
        let diff = new THREE.Vector3();
        function satisfyConstraints(p1, p2, distance) {
            diff.subVectors(p2.position, p1.position);
            let currentDist = diff.length();
            if (currentDist === 0)
                return; // prevents division by 0
            let correction = diff.multiplyScalar(1 - distance / currentDist);
            let correctionHalf = correction.multiplyScalar(0.5);
            p1.position.add(correctionHalf);
            p2.position.sub(correctionHalf);
        }
        model.cloth.constraints.forEach(constraint => {
            satisfyConstraints(constraint[0], constraint[1], constraint[2]);
        });
        // Pin Constraints
        model.pins.forEach(pin => {
            let p = particles[pin];
            p.position.copy(p.original);
            p.previous.copy(p.original);
        });
    }
    render() {
        const self = this;
        if (self.models.length) {
            self.models.forEach(model => {
                let time = Date.now() * Math.random();
                let windStrength = Math.cos(time / 7000) * 20 + self.detal;
                self.windForce.set(Math.sin(0), Math.cos(0), Math.sin(time / 100));
                self.windForce.normalize();
                self.windForce.multiplyScalar(windStrength);
                self.simulate(time, model);
                let p = model.cloth.particles;
                for (let i = 0; i < p.length; i++) {
                    let v = p[i].position;
                    model.attributes.position.setXYZ(i, v.x, v.y, v.z);
                }
                model.attributes.position.needsUpdate = true;
                model.computeVertexNormals();
            });
        }
    }
}
