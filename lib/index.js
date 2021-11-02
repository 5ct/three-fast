let THREE;
import { Base } from "./Base";
import { Scene } from "./Scene";
import { Camera } from "./Camera";
import { Control } from "./Control";
import { Composer } from "./Composer";
import { FBXMode } from "./FBXMode";
import { Light } from "./Light";
import { DragMode } from "./DragMode";
import { Patrol } from "./Patrol";
import { Circle } from "./Circle";
import { Flutter } from "./Flutter";
import { Mirror } from "./Mirror";
import { Trajectory } from "./Trajectory";
// import {ParticleEngine} from "./ParticleEngine";
import { Traffic } from "./Traffic";
import { Elevator } from "./Elevator";
import { ShockWave } from "./ShockWave";
// import {Physics} from "./Physics";
export class Three extends Base {
    constructor(options) {
        super();
        this.Trajectory = Trajectory;
        THREE = this.THREE;
        this.init(options);
    }
    init(options) {
        const self = this;
        let container = options.container;
        self.Container = container;
        self.Width = container.clientWidth;
        self.Height = container.clientHeight;
        self.diffWidth = options.diffWidth;
        self.diffHeight = options.diffHeight;
        // self._Physics = new Physics(self);
        self._Scene = new Scene(self, options.scene);
        self._Camera = new Camera(self, options.camera);
        self._Control = new Control(self, options.control);
        self._Composer = new Composer(self, options.composer);
        self._Light = new Light(self);
        self._Circle = new Circle(self);
        self._Flutter = new Flutter(self);
        self._Mirror = new Mirror(self);
        self._Trajectory = new Trajectory(self);
        // self._HelpPoint = new HelpPoint(self)
        self._DragMode = new DragMode(self);
        self._Patrol = new Patrol(self);
        // self._ParticleEngine = new ParticleEngine(self);
        self._Traffic = new Traffic(self);
        // self._HelpLine = new HelpLine(self);
        self._Elevator = new Elevator(self);
        self._ShockWave = new ShockWave(self);
        self._FBXMode = new FBXMode(self, options);
        // self.initHelper();
        self._FBXMode.init(options.FBXMode).then(objects => {
            if (options.onLoad && options.onLoad instanceof Object) {
                options.onLoad.call(self);
            }
        });
        //主灯： x:-3.795  Y:-118.016  z:127.207
        //辅灯： x:19.194  Y:122.9  z:87.204 主灯 rgb：8    49      228
        // self._Light.createHemisphereLight(); 
        /* self.lights = self._Light.dazzle([{
            distance:10000,
            intensity:1,
            size:200,
            shadow:true,
            color:"#fff",
            position:[-118.016,127.207,3.795]
        },{
            distance:10000,
            intensity:0.8,
            size:100,
            color:"#fff",
            position:[19.194,87.204,122.9]
        },{
            distance:10000,
            intensity:0.8,
            size:100,
            color:"#fff",
            position:[50.08541271687476,120.58429391059731,-117.03423062709683]
        }]); */
        // self._Light.createHemisphereLight();
        self.render(options);
        self.windowResize();
        if (options.init) {
            setTimeout(() => {
                options.init.call(self);
            }, 400);
        }
    }
    render(options) {
        const self = this;
        let animate = function () {
            self.Delta = self.CLOCK.getDelta();
            if (options.render) {
                options.render.call(self);
            }
            self.Renderer.clear();
            self._Scene.render();
            self._Camera.render();
            self._Control.render();
            // self._Physics.render();
            self._FBXMode.render();
            self._Patrol.render();
            self._Flutter.render();
            self._Mirror.render();
            self._Traffic.render();
            self._Trajectory.render();
            self._Elevator.render();
            self._ShockWave.render();
            // self._ParticleEngine.render();
            self.Renderer.render(self.Scene, self.Camera);
            self.Stats.update();
            if (self._HelpPoint) {
                self._HelpPoint.render();
            }
            self._Composer.render();
            requestAnimationFrame(animate);
        };
        animate();
    }
    /*****************注销_THREE*****************************/
    //清除模型提示框
    clearDom() {
        const self = this;
        self.msgArray.forEach(msg => {
            if (msg.model) {
                msg.model.destroy();
            }
            if (msg.container) {
                msg.container.destroy();
            }
            msg.dom.parentNode.removeChild(msg.dom);
        });
        self.msgArray = [];
    }
    destroyed() {
        const self = this;
        self.clearDom();
        self.deleteGroupAndScene();
    }
}
