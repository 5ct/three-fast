import { Base } from "./Base";
import { Power0 } from "gsap";
let THREE;
export class LineMove extends Base {
    constructor(target) {
        super(target);
        this.curveIndex = 0;
        this.moveObjects = [];
        THREE = this.THREE;
    }
    //初始化移动数据
    init(object, data) {
        const self = this;
        let curveObject = self.initMoveLine(data);
        object.curveObject = curveObject;
        self.moveObjects.push(object);
        return curveObject;
    }
    initMoveLine(data) {
        const self = this;
        let material = new THREE.LineBasicMaterial({
            opacity: 0.35,
            vertexColors: true
        });
        let curveGeometry = self.getCurveGeometry(data);
        let curveObject = new THREE.Line(curveGeometry.geometry, material);
        curveObject.curve = curveGeometry.curve;
        // curveObject.layers.mask = 1;
        return curveObject;
    }
    getCurveGeometry(data) {
        const self = this;
        data = Object.assign({
            line: [{ x: 0, y: 0, z: 0 }],
            curveType: "catmullrom",
            isClose: false,
            tension: 0.1,
            number: 4
        }, data);
        let positions = [];
        data.line.forEach(point => {
            positions.push(new THREE.Vector3(point.x, point.y, point.z));
        });
        let curve = new THREE.CatmullRomCurve3(positions, data.isClose, data.curveType);
        curve.tension = data.tension;
        let points = curve.getSpacedPoints(data.number);
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        return {
            geometry: geometry,
            curve: curve,
            points: points
        };
    }
    getSpacedCurve(data) {
        const self = this;
        data = Object.assign({
            line: [{ x: 0, y: 0, z: 0 }],
            curveType: "catmullrom",
            isClose: false,
            tension: 0.1,
            distance: 2,
            number: data.line.length
        }, data);
        let positions = [];
        for (let i = 0; i < data.line.length; i += 1) {
            if (i < data.line.length - 1) {
                let curve = new THREE.CatmullRomCurve3([new THREE.Vector3(data.line[i].x, data.line[i].y, data.line[i].z), new THREE.Vector3(data.line[i + 1].x, data.line[i + 1].y, data.line[i + 1].z)], data.isClose, data.curveType);
                let l = Math.floor(curve.getLength() / data.distance);
                if (l > 0) {
                    let points = curve.getPoints(l);
                    // points.push(new THREE.Vector3( data.line[i+1].x, data.line[i+1].y, data.line[i+1].z))
                    positions = positions.concat(points);
                }
            }
        }
        console.info(positions);
        let geometry = new THREE.BufferGeometry().setFromPoints(positions);
        geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        return geometry;
    }
    //创建管道
    createTubeGeometry(line) {
        const self = this, scene = self.Scene;
        let t1 = new self.TimelineLite();
        let curveGeometry = self.getCurveGeometry({ line: line, tension: 0.5, number: line.length });
        let texture = new THREE.TextureLoader().load("three/qp/arrow.png", function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(line.length * 4, 1);
        });
        let geometry = new THREE.TubeBufferGeometry(curveGeometry.curve, 1000, 0.1, 10, false);
        let material = new THREE.MeshBasicMaterial({
            color: self.colorRGBtoHex("rgb(232,255,202)"),
            map: texture,
            transparent: false,
            opacity: true,
            depthWrite: true,
            fog: true,
            emissive: self.colorRGBtoHex("rgb(20,31,149)"),
            emissiveIntensity: 0,
        });
        let mesh = new THREE.Mesh(geometry, material);
        // mesh.layers.mask = 1;
        scene.add(mesh);
        material.map.offset.y = 1;
        t1.to(material.map.offset, 10, {
            x: -10,
            repeat: -1,
            ease: Power0.easeNone
        });
        self.geometryOBJ = mesh;
    }
    //注销管道
    destroyedGeometry() {
        const self = this, scene = self.Scene;
        if (self.geometryOBJ) {
            self.geometryOBJ.geometry.dispose();
            self.geometryOBJ.geometry.dispose();
            scene.remove(self.geometryOBJ);
        }
    }
    //创建线条
    createLineGeometry(line) {
        const self = this, scene = self.Scene;
        let curveGeometry = self.getCurveGeometry({ line: line });
        let material = new THREE.LineDashedMaterial({
            color: self.colorRGBtoHex('rgb(255,234,8)'),
            fog: true,
            dashSize: 0.3,
            gapSize: 0.5,
            linewidth: 10,
            scale: 2 // 线条中虚线部分的占比。默认值为 1。
        });
        let mesh = new THREE.Line(curveGeometry.geometry, material);
        mesh.computeLineDistances();
        // mesh.layers.mask = 1;
        scene.add(mesh);
        self.geometryOBJ = mesh;
    }
    //创建粒子线条
    createPointsGeometry(line) {
        const self = this, scene = self.Scene;
        let t1 = new TimelineLite();
        let curveGeometry = self.getCurveGeometry({ line: line, number: 50 });
        let geometry = curveGeometry.geometry;
        let texture = new THREE.TextureLoader().load("three/img/foot.png", function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
        });
        let material = new THREE.PointCloudMaterial({
            color: self.colorRGBtoHex('rgb(255,234,8)'),
            fog: true,
            size: 2,
            transparent: true,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            map: texture,
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: false //设置解决透明度有问题的情况
        });
        let mesh = new THREE.Points(geometry, material);
        // mesh.layers.mask = 1;
        scene.add(mesh);
        self.geometryOBJ = mesh;
    }
    //注销
    destroyed() {
    }
    //时钟渲染
    render() {
        const self = this, camera = self.$scope.Camera;
        self.moveObjects.forEach(group => {
            let data = group.userData.data;
            data.curveIndex = data.curveIndex || 0;
            if (data.isRunning && (data.time > 0 || data.times == -1)) {
                let curve = group.curveObject.curve, time = Math.abs(data.time) / 60;
                if (data.curveIndex + 2 >= time) {
                    if (!data.times) {
                        data.times -= 1;
                    }
                    data.curveIndex = 0;
                }
                else {
                    let prev = data.time < 0 ? (time - data.curveIndex++) : data.curveIndex++, next = data.time < 0 ? (time - data.curveIndex - 1) : data.curveIndex + 1;
                    if (data.path) {
                        group.position.copy(curve.getPoint(prev / time, new THREE.Vector3()));
                        group.lookAtPotision = curve.getPoint(next / time, new THREE.Vector3());
                        group.lookAt(curve.getPoint(next / time, new THREE.Vector3()));
                    }
                    else {
                        camera.position.copy(curve.getPoint(prev / time, new THREE.Vector3()));
                        camera.lookAt(curve.getPoint(next / time, new THREE.Vector3()));
                    }
                }
            }
        });
    }
}
