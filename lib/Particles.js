import { Base } from "./Base";
import { Power0 } from "gsap";
import particleFire from 'three-particle-fire';
let THREE;
/**
 * 创建粒子特效
 */
export class Particles extends Base {
    constructor(target) {
        super(target);
        this.particles = [];
        this.particleFires = [];
        this.particleMode = [];
        THREE = this.THREE;
    }
    //初始化场景粒子
    init(options = {}) {
        const self = this;
        options = Object.assign({
            range: 1200,
            size: 5,
            maxSize: 15,
            transparent: true,
            number: 15000,
            opacity: 1,
            vertexColors: false,
            sizeAttenuation: true,
            depthTest: false,
            speed: {
                y: 1
            },
            img: "./three/img/snow.png",
            color: "rgb(255,255,255)"
        }, options);
        return new Promise(function (resolve, reject) {
            let texture = new THREE.TextureLoader().load(options.img), range = options.range;
            //存放粒子数据的网格
            let geom = new THREE.Geometry();
            let color = self.color(options.color);
            //样式化粒子的THREE.PointCloudMaterial材质
            let material = new THREE.PointCloudMaterial({
                size: options.size,
                maxSize: options.maxSize,
                transparent: options.transparent,
                opacity: options.opacity,
                vertexColors: options.vertexColors,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: options.sizeAttenuation,
                color: self.color(options.color),
                map: texture,
                fog: true,
                depthTest: options.depthTest //设置解决透明度有问题的情况
            });
            for (let i = 0; i < options.number; i++) {
                //添加顶点的坐标
                let particle = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
                particle.velocityY = 0.1 + Math.random() / 5;
                particle.velocityX = (Math.random() - 0.5) / 3;
                geom.vertices.push(particle);
                //随机当前每个粒子的亮度
                color.setHSL(color.getHSL().h, color.getHSL().s, Math.random() * color.getHSL().l);
                geom.colors.push(color);
            }
            geom.center();
            //生成模型，添加到场景当中
            let particle = new THREE.Points(geom, material);
            particle.data = options;
            particle.verticesNeedUpdate = true;
            self.particles.push(particle);
            resolve(particle);
        });
    }
    /**
     * 创建粒子火焰
     * @param object
     * @param data
     */
    fire(object, data = {}) {
        data = Object.assign({
            fireRadius: 0.5,
            fireHeight: 30,
            particleCount: 10000,
        }, data);
        const self = this, scene = self.$scope.Scene, camera = self.$scope.Camera;
        particleFire.install({ THREE: THREE });
        let geometry = new particleFire.Geometry(data.fireRadius, data.fireHeight, data.particleCount);
        let material = new particleFire.Material({ color: 0xff2200 });
        material.setPerspective(camera.fov, self.Height);
        let particleFireMesh = new THREE.Points(geometry, material);
        particleFireMesh.group = object;
        scene.add(particleFireMesh);
        self.particleFires.push(particleFireMesh);
    }
    //创建粒子模型
    creatParticleMode(data = {}) {
        const self = this;
        data = Object.assign({
            color: self.colorRGBtoHex('rgb(5,255,18)'),
            fog: true,
            size: 5,
            visible: true,
            transparent: true,
            sizeAttenuation: false,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false //设置解决透明度有问题的情况
        }, data);
        let geometry = new THREE.BufferGeometry();
        let options = {
            // color: data.color,
            fog: data.data,
            size: data.size,
            side: data.side,
            opacity: 1,
            transparent: data.transparent,
            sizeAttenuation: data.sizeAttenuation,
            depthWrite: data.depthWrite,
            emissiveIntensity: 0,
            depthTest: data.depthTest //设置解决透明度有问题的情况
        };
        if (data.img) {
            let texture = new THREE.TextureLoader().load(data.img, function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
            });
            options.map = texture;
        }
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
        let material = new THREE.PointCloudMaterial(options);
        let mesh = new THREE.Points(geometry, material);
        // mesh.layers.mask = 1;
        let group = new THREE.Group();
        group.add(mesh);
        group.userData.data = data;
        group.visible = data.visible;
        group.position.set(data.position.x, data.position.y, data.position.z);
        self.particleMode.push(group);
        self.$scope.FBXData.push(group);
        self.Scene.add(group);
        return group;
    }
    //注销粒子模型
    destroyedParticleMode() {
        const self = this;
        self.particleMode.forEach(group => {
            self.$scope.$scope._FBXMode.deleteFBXDataByGroup(group);
        });
        self.particleMode = [];
    }
    //给粒子添加探洞动画
    particleBounce(group) {
        const self = this;
        let t1 = new self.TimelineLite(), height = 1;
        self.getTransPosition2D(group.position);
        group.position.y += height;
        t1.to(group.position, 1, {
            y: group.position.y - height,
            ease: Power0.easeNone,
            repeat: -1,
        });
        return t1;
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this;
        let particles = self.particles, particleFires = self.particleFires;
        particles.forEach(particle => {
            let speed = particle.data.speed;
            //产生雨滴动画效果
            particle.geometry.vertices.forEach(function (v) {
                v.y = v.y - (v.velocityY) * speed.y;
                v.x = v.x - (v.velocityX) * .5;
                if (v.y <= 0)
                    v.y = 100;
                if (v.x <= -20 || v.x >= 20)
                    v.velocityX = v.velocityX * -1;
            });
            //设置实时更新网格的顶点信息
            particle.geometry.verticesNeedUpdate = true;
        });
        particleFires.forEach(particleFire => {
            if (particleFire.group.lookAtPotision) {
                particleFire.position.copy(particleFire.group.lookAtPotision);
                particleFire.lookAt(particleFire.group.position);
                particleFire.rotateX(self.Angle * 90);
                particleFire.position.y += 1.5;
            }
            particleFire.material.update(self.$scope.$scope.Delta * 10);
        });
    }
}
