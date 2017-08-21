//@flow
import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';

const _NODECOUNT = 12;
const _NODES = {};

class MainNirvana {
  constructor(opts={}) {
    const _Visualizer = new Visualizer({output:opts.output});
    for (let i = 0; i <_NODECOUNT; i++) {
      const node = new Machine(`device `+ String(i));
      node.setScore(Math.floor(Math.random() * 1000));
      _NODES[i] = node;
      _Visualizer.addNode(node);
    }

  }
}

class Visualizer {
  constructor (opts = {}) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.output = opts.output || document.createElement('div');

    this.nodes = []; //デバイス
    this.bullets = [];//パケット

    this.FieldInit();

    this.makeObject();

    this.render();
    // メソッドをそのまま渡すとうまくいかないので無名関数で囲う
    window.addEventListener('resize', () => {
      this.onResize();
    }, false);
  }

  FieldInit () {
      // renderer
      this.renderer = new THREE.WebGLRenderer({
         antialias: true,
         devicePixelRatio:window.devicePixelRatio||1,//retinaの解像度に対応させる
      });
      this.renderer.setClearColor( 0x222222 ); // 背景色
      this.renderer.setPixelRatio(window.devicePixelRatio || 1);
      this.renderer.setSize( this.width, this.height );
      this.output.appendChild( this.renderer.domElement );

      // scene
      this.scene = new THREE.Scene();

      // lights
      this.light = new THREE.DirectionalLight(0xffffcc, 1);
      this.light.position.set(0,500,100);
      this.scene.add(this.light);
      const ambientLight = new THREE.AmbientLight(0xffaa55);
      this.scene.add(ambientLight);

      // camera
      const perscamera = new THREE.PerspectiveCamera(
        45,                       // fov(視野角)
        this.width / this.height, //aspect
        1,                        //near
        20000,                    //far
       );
      //const orthocamera = new THREE.OrthographicCamera( this.width / -2, this.width / 2, this.height / 2, this.height / -2, 1, 10000 );
      this.camera = perscamera;
      this.camera.position.set( 1000,  1000, 1000 );
      this.camera.lookAt( this.scene.position );

       // helper
      const gridHelper = new THREE.GridHelper(1000,50); // size, step
      this.scene.add(gridHelper);
      const axisHelper = new THREE.AxisHelper(1000,50);
      this.scene.add(axisHelper);
      const lightHelper = new THREE.DirectionalLightHelper(this.light,200);
      this.scene.add(lightHelper);

     // controls
      this.controls = new OrbitControls(this.camera);
      this.controls.autoRotate = true;

  }

  makeObject(){
    this.orbit = new THREE.Object3D();
    this.scene.add(this.orbit);
    this.orbitRadius = 1000;

    this.server = new Server();
  }

  addNode(e){
    this.nodes.push(e);
    this.reconstructOrbit();
  }

  reconstructOrbit(){
    for (let i = 0; i < this.orbit.children.length; i++) {
      this.orbit.remove(this.orbit.children[i]);
    }
    this.orbit.add(this.server.getObject());
    //TODO::仮想の透明な球の座標を使ってnodes丸く並べる。
    //アマテラスのようなイメージ
    //そこに画像やステータスを表示していく。
    //https://ics.media/entry/10657
    const N = this.nodes.length;
    const rad = 2*Math.PI / N //円周をノードごとに分割
    for (let i= 0; i < N; i++) {//円状に並べる
      const obj = this.nodes[i].getObject();
      obj.position.x = this.orbitRadius * Math.cos(rad*i);
      obj.position.z = this.orbitRadius * Math.sin(rad*i);
      obj.rotation.y = -rad*i;
      this.orbit.add(obj);
    }
  }

  render () {
    requestAnimationFrame( () => {
      this.render();
    });
    this.controls.update();
    this.renderer.render( this.scene, this.camera );
  }

  onResize () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  getServer(){
    return this.server;
  }
  getRenderer() {
    return this.renderer;
  }
  getScene(){
    return this.scene;
  }
  getCamera(){
    return this.camera;
  }
}

class Machine {
    constructor(name) {
      this.machineName = name;
      this.machineObject = new THREE.Object3D();
      this.score = 0;
      this.scoreScale = 0.5;
      const cylinderHeight = this.score * this.scoreScale;
      const cylinderGeometry = new THREE.CylinderGeometry(
        200,                         //radiusTop
        200,                         //radiusBottom
        cylinderHeight,              //height
        6,                           //radiusSegments
        1,                           //heightSegments
        false,                       //openEnded
      );
      this.cylinderMesh = new THREE.Mesh(
        cylinderGeometry,
        new THREE.MeshBasicMaterial({
          color: 0x33eeff,
          transparent: true,
          opacity: 0.6,
        })
      );
      this.machineObject.add(this.cylinderMesh);
      this.cylinderEdge = new THREE.EdgesHelper(this.cylinderMesh, 0x33ccff);
      this.machineObject.add(this.cylinderEdge);

      //make to character
      const fontloader = new THREE.FontLoader();
      fontloader.load("font/helvetiker_regular.typeface.json",(font) => {//font:texture
        const textShape = font.generateShapes(this.machineName,60,200);
        const textGeometry = new THREE.ShapeGeometry(textShape);
        textGeometry.center();//vector3を0にする
        const textMesh = new THREE.Mesh(
          textGeometry,
          new THREE.MeshBasicMaterial({
            color:0xffffff,
            side:THREE.DoubleSide,//両面線画する
          })
        );
        textMesh.position.y = 0;
        textMesh.position.x = 200;
        textMesh.rotation.x = -Math.PI/2;
        this.machineObject.add(textMesh);
      });

  }
    updateCylinder() {
        const height = this.getHeight();
        const cylinderGeometry = new THREE.CylinderGeometry(100, 100, height, 6, 1, false);
        this.cylinderMesh.geometry.dispose();
        this.cylinderMesh.geometry = cylinderGeometry;
        this.cylinderMesh.position.y = height / 2;
        this.machineObject.remove(this.cylinderEdge);
        this.cylinderEdge = new THREE.EdgesHelper(this.cylinderMesh, 0x33ccff);
        this.cylinderEdge.position.y = height / 2;
        this.machineObject.add(this.cylinderEdge);
    }
    frame() {
    }
    getScore() {
        return this.score;
    }
    setScore(value) {
        this.score = value;
        this.updateCylinder();
    }
    getHeight() {
        return this.score ? this.score * this.scoreScale : 1;
    }
    getObject() {
        return this.machineObject;
    }
}

class Server {
    constructor() {
        this.serverObject = new THREE.Object3D();
        const box = new THREE.SphereGeometry(400, 400, 400);
        const boxMesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({
            //color: 0xe03030,
            color: 0xef8e8f8,
            transparent: true,
            opacity: 0.6,
        }));
        this.serverObject.add(boxMesh);
        const edge = new THREE.EdgesHelper(boxMesh, 0xf03030);
        this.serverObject.add(edge);
    }
    frame() {
    }
    getObject() {
        return this.serverObject;
    }
}

class MachineFlame extends THREE.Curve{
  constructor(start,end,direction,elevation) {
    super();
    this.start = start;
    this.end = end;
    this.direction = direction.nor;
  }
  // select ot use points
  getPoint(t){
    const a = t * this.distance;
      const b = -this.param * a * (a - this.distance);
      const Va = (new THREE.Vector3()).add(this.end).sub(this.start).normalize().multiplyScalar(a);
      const Vb = (new THREE.Vector3()).add(this.direction).multiplyScalar(b);
      return (new THREE.Vector3()).add(Va).add(Vb).add(this.start);
  }
}



(() => {
  const _MainNirvana = new MainNirvana({
    output: document.getElementById('webgl-output')
  });
})();

class PacketListener {
    constructor(ws) {
    }
}
