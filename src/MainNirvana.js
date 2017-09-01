//@flow
import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';

const _NODECOUNT = 24;
const _NODES = {};
const _NODESPCAKETCOLOR = [["InOctets",0xd32f2f],["OutOctets",0x039BE5]];

class MainNirvana {
  constructor(opts={}) {
    const _Visualizer = new Visualizer({output:opts.output});
    for (let i = 0; i <_NODECOUNT; i++) {
      const node = new Machine(`device `+ String(i));
      node.setScore(Math.floor(Math.random() * 1000));
      _NODES[i] = node;
      _Visualizer.addNode(node);
    }
    const loop = () => {
      requestAnimationFrame(loop);

       _Visualizer.renderpacket();
       if (Math.random() > 0.8) {
           const f = Math.floor(Math.random() * _NODECOUNT);
           const height = _NODES[f].getHeight();
           const src = (new THREE.Vector3(0, height, 0)).add(_NODES[f].getObject().position);
           const dest = _Visualizer.getServer().getObject().position;
           const dir = new THREE.Vector3(0, 1, 0);
           const curve = new PacketFlameCurve(src, dest, dir, 500);
           const b = new CurvePacketTransport(curve, 200);
           _Visualizer.addPacketTransport(b);
       }
      //_Visualizer.render();
    };
    loop();
    // const loop = ()=>{
    //   const p = _Visualizer.getpackets();
    //   for (let b of p) {
    //        if (b != null && !b.isDead) {
    //            b.frame();
    //        }
    //    }
    //    if (Math.random() > 0.8) {
    //        const f = Math.floor(Math.random() * _NODECOUNT);
    //        const height = _NODES[f].getHeight();
    //        const src = (new THREE.Vector3(0, height, 0)).add(_NODES[f].getObject().position);
    //        const dest = _Visualizer.getServer().getObject().position;
    //        const dir = new THREE.Vector3(0, 1, 0);
    //        const curve = new PacketFlameCurve(src, dest, dir, 500);
    //        const b = new CurvePacketTransport(curve, 200);
    //        _Visualizer.addPacketTransport(b);
    //    }
    //    _Visualizer.render();
    //    setTimeout(loop,100);
    // };
    // loop();
  }
}

class Visualizer {
  constructor (opts = {}) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.output = opts.output || document.createElement('div');

    this.nodes = []; //デバイス
    this.packets = [];//パケット

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
      this.camera.position.set( 600,  600, 600 );
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
    this.orbitRadius = 500;

    this.server = new Server();
  }

  addNode(object){
    this.nodes.push(object);
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
      obj.rotation.y = -((Math.PI/180) * (360/N)*i + 90*(Math.PI/180));
      this.orbit.add(obj);
    }
  }

  addPacketTransport(object){
    this.refreshPacketTransport();
    this.packets.push(object);
    this.orbit.add(object.getObject());
  }
  refreshPacketTransport(){
    this.packets.filter(
      (item)=>item.isDispose).forEach((item)=>{
        this.orbit.remove(item.getObject());
      });
  }

  renderpacket(){

    for (let b of this.packets) {
         if (b != null && !b.isDead) {
             b.frame();
         }
     }
     this.render();
  }
  render () {
    // requestAnimationFrame( () => {
    //   this.render();
    // });
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

  getpackets(){
    return this.packets;
  }
  testingPacketTransport(){
    const r = Math.floor(Math.random()*50);
    if(r<12){
      const elevation = this.nodes[i].getHeight();
      const src = (new THREE.Vector3(0,height,0)).add(this.nodes[i].getObject().position);
      const dest = this.server.getObject().postion;
      const direction = new THREE.Vector3(0,1,0);
      const curve = new PacketFlameCurve(src, dest, direction, 500);
      const packetTransportObject = new CurvePacketTransport(curve,100);
      this.addPacketTransport(packetTransportObject);
    }
  }
}

type MachineProps = {|
  name:? string,
|};
class Machine {
    constructor(name) {
      this.machineName = name;
      this.machineObject = new THREE.Object3D();
      this.score = 0;
      this.scoreScale = 0.5;
      const cylinderHeight = this.score * this.scoreScale;
      // const cylinderGeometry = new THREE.CylinderGeometry(
      //   200,                         //radiusTop
      //   200,                         //radiusBottom
      //   cylinderHeight,              //height
      //   6,                           //radiusSegments
      //   1,                           //heightSegments
      //   false,                       //openEnded
      // );
      const circleGeometry = new THREE.CircleGeometry(
        75,
        16,
        90*(Math.PI/180),
        90*(Math.PI/180),
      );
      this.cylinderMesh = new THREE.Mesh(
        circleGeometry,
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
        //const cylinderGeometry = new THREE.CylinderGeometry(100, 100, height, 6, 1, false);
        const circleGeometry = new THREE.CircleGeometry(
          100,
          8,
        );
        this.cylinderMesh.geometry.dispose();
        this.cylinderMesh.geometry = circleGeometry;
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
        const box = new THREE.SphereGeometry(200, 200, 200);
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

class CurvePacketTransport {
  constructor(curve,frames) {
    this.parent = new THREE.Object3D();
    this.frames = frames;
    this.framesNow = 0;
    this.isDispose = false;
    this.curve = curve;
    this.curvePoint = this.curve.getPoints(this.frames);
    const curvePacketTransportGeometry = new THREE.SphereGeometry(5,4,4);

    const PacketColorSelect = Math.max(0,Math.floor(Math.random()*_NODESPCAKETCOLOR.length));
    this.packetTransport = new THREE.Mesh(
      curvePacketTransportGeometry,
      new THREE.MeshBasicMaterial({
        color:_NODESPCAKETCOLOR[PacketColorSelect][1],
        transparent:true,
        opacity:0.9,
      })
    );
    this.line = new THREE.Line(null,
      new THREE.LineBasicMaterial({
        color:0xF57F17,
        lineWidth:3,
        transparent:true,
        opacity:0.7,
      })
    );

    this.parent.add(this.packetTransport);
    this.parent.add(this.line);
  }

  frame(){
    if(this.framesNow>this.frames){
      this.dispose();
      return;
    }
    const pos = this.curve.getPoint(this.framesNow/this.frames);
    this.packetTransport.position.set(pos.x,pos.y,pos.z);

    const geometry = new THREE.Geometry();
    geometry.vertices = this.curvePoint.slice(Math.max(0, this.framesNow - this.frames/3),this.framesNow);
      if (this.line.geometry) {
        this.line.geometry.dispose();
      }
      this.line.geometry = geometry;
      this.framesNow++;
  }

  getObject(){
    return this.parent;
  }
  dispose(){
    this.parent.remove(this.packetTransport);
    this.parent.remove(this.line);
    this.packetTransport.geometry.dispose();
    this.packetTransport.material.dispose();
    this.line.geometry.dispose();
    this.line.material.dispose();
  }
}



type PacketFlameCurveProps = {|
  start: THREE.Vector3,
  end: THREE.Vector3,
  direction: THREE.Vector3,
  elevation: number,
|};
class PacketFlameCurve extends THREE.Curve{
  constructor(start,end,direction,elevation) {
    // const{
    //   start,
    //   end,
    //   direction,
    //   elevation,
    // } = PacketFlameCurveProps;
    super();
    this.start = start;
    this.end = end;
    this.direction = direction.normalize();//単位ベクトルを指定する
    this.distance = this.end.distanceTo(this.start);
    this.param = 4 * elevation/Math.pow(this.distance,2);
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
