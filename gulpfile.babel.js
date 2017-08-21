import gulp from 'gulp';
import webserver from 'gulp-webserver';
import babelgulp from 'gulp-babel';
import webpackConfig from './webpack.config';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import flowtype from 'gulp-flowtype';
import exec from 'gulp-exec';

gulp.task('webserver', ()=>{
  gulp.src('./')
  .pipe(webserver({
    livereload: true,
    directoryListing: false,
    //open: true,
  }));
});

gulp.task('build', ()=>{
  webpackStream(webpackConfig, webpack)
  .pipe(gulp.dest("./"));
});

gulp.task('flowtype', ()=>{
  gulp.src('./src/*.jsx')
  .pipe(flowtype({
      all: false,
      weak: false,
      declarations: './declarations',
      killFlow: false,
      beep: true,
    }));
});

gulp.task('watch', ()=>{
  gulp.watch('./src/*.jsx', ['flowtype','build','webserver']);
});

gulp.task('default', ['flowtype','build', 'webserver']);

// class ParaboraCurve extends THREE.Curve {
//     constructor(start, end, direction, height) {
//         super();
//         this.start = start;
//         this.end = end;
//         this.direction = direction.normalize();
//         this.distance = this.end.distanceTo(this.start);
//         this.param = 4 * height / Math.pow(this.distance, 2);
//     }
//     getPoint(t) {
//         const a = t * this.distance;
//         const b = -this.param * a * (a - this.distance);
//         const Va = (new THREE.Vector3()).add(this.end).sub(this.start).normalize().multiplyScalar(a);
//         const Vb = (new THREE.Vector3()).add(this.direction).multiplyScalar(b);
//         return (new THREE.Vector3()).add(Va).add(Vb).add(this.start);
//     }
// }
// class Team {
//     constructor(name) {
//         this.name = name;
//         this.teamObj = new THREE.Object3D();
//         this.score = 0;
//         this.scoreScale = 0.5;
//         const cylinderGeometry = new THREE.CylinderGeometry(200, 200, this.score * this.scoreScale, 6, 1, false);
//         this.cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshBasicMaterial({
//             color: 0x33eeff,
//             transparent: true,
//             opacity: 0.6,
//         }));
//         this.teamObj.add(this.cylinderMesh);
//         this.cylinderEdge = new THREE.EdgesHelper(this.cylinderMesh, 0x33ccff);
//         this.teamObj.add(this.cylinderEdge);
//         const loader = new THREE.FontLoader();
//         loader.load("helvetiker_regular.typeface.json", (font) => {
//             const textShape = font.generateShapes(this.name, 60, 300);
//             const textGeometry = new THREE.ShapeGeometry(textShape);
//             textGeometry.center();
//             const textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
//                 color: 0xffffff,
//                 side: THREE.DoubleSide,
//             }));
//             textMesh.position.y = 0;
//             textMesh.position.x = 400;
//             textMesh.rotation.x = -Math.PI / 2;
//             this.teamObj.add(textMesh);
//         });
//     }
//     updateCylinder() {
//         const height = this.getHeight();
//         const cylinderGeometry = new THREE.CylinderGeometry(200, 200, height, 6, 1, false);
//         this.cylinderMesh.geometry.dispose();
//         this.cylinderMesh.geometry = cylinderGeometry;
//         this.cylinderMesh.position.y = height / 2;
//         this.teamObj.remove(this.cylinderEdge);
//         this.cylinderEdge = new THREE.EdgesHelper(this.cylinderMesh, 0x33ccff);
//         this.cylinderEdge.position.y = height / 2;
//         this.teamObj.add(this.cylinderEdge);
//     }
//     frame() {
//     }
//     getScore() {
//         return this.score;
//     }
//     setScore(value) {
//         this.score = value;
//         this.updateCylinder();
//     }
//     getHeight() {
//         return this.score ? this.score * this.scoreScale : 1;
//     }
//     getObject() {
//         return this.teamObj;
//     }
// }
// class Server {
//     constructor() {
//         this.serverObj = new THREE.Object3D();
//         const box = new THREE.BoxGeometry(200, 200, 200);
//         const boxMesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({
//             color: 0xe03030,
//             transparent: true,
//             opacity: 0.6,
//         }));
//         this.serverObj.add(boxMesh);
//         const edge = new THREE.EdgesHelper(boxMesh, 0xf03030);
//         this.serverObj.add(edge);
//     }
//     frame() {
//     }
//     getObject() {
//         return this.serverObj;
//     }
// }
// class CurveBullet {
//     constructor(curve, frames) {
//         this.parent = new THREE.Object3D();
//         this.frames = frames;
//         this.framesNow = 0;
//         this.isDead = false;
//         this.curve = curve;
//         this.curvePoint = this.curve.getPoints(this.frames);
//         const bulletGeometry = new THREE.SphereGeometry(5, 4, 4);
//         this.bullet = new THREE.Mesh(bulletGeometry, new THREE.MeshBasicMaterial({
//             color: 0xff0000,
//             transparent: true,
//             opacity: 0.9,
//         }));
//         this.line = new THREE.Line(null, new THREE.LineBasicMaterial({
//             color: 0xd05050,
//             linewidth: 3,
//             transparent: true,
//             opacity: 0.7,
//         }));
//         this.parent.add(this.bullet);
//         this.parent.add(this.line);
//     }
//     frame() {
//         if (this.framesNow > this.frames) {
//             this.isDead = true;
//             this.dispose();
//             return;
//         }
//         const pos = this.curve.getPoint(this.framesNow / this.frames);
//         this.bullet.position.set(pos.x, pos.y, pos.z);
//         const geometry = new THREE.Geometry();
//         geometry.vertices = this.curvePoint.slice(Math.max(0, this.framesNow - this.frames / 3), this.framesNow);
//         if (this.line.geometry) {
//             this.line.geometry.dispose();
//         }
//         this.line.geometry = geometry;
//         this.framesNow++;
//     }
//     getObject() {
//         return this.parent;
//     }
//     dispose() {
//         this.parent.remove(this.bullet);
//         this.parent.remove(this.line);
//         this.bullet.geometry.dispose();
//         this.bullet.material.dispose();
//         this.line.geometry.dispose();
//         this.line.material.dispose();
//     }
// }
// class CTFVisualizer {
//     constructor() {
//         this.renderer = new THREE.WebGLRenderer({
//             antialias: true,
//             devicePixelRatio: window.devicePixelRatio,
//         });
//         this.scene = new THREE.Scene();
//         this.teams = [];
//         this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
//         this.cameraRadius = 4000;
//         this.camera.position.z = this.cameraRadius;
//         this.camera.position.y = 1800;
//         this.camera.lookAt(new THREE.Vector3(0, 0, 0));
//         this.orbit = new THREE.Object3D();
//         this.orbitRadius = 1500;
//         const light = new THREE.AmbientLight(0x808080);
//         this.scene.add(light);
//         this.scene.add(this.orbit);
//         this.server = new Server();
//         this.bullets = [];
//     }
//     addTeam(t) {
//         this.teams.push(t);
//         this.reconstructOrbit();
//     }
//     addBullet(o) {
//         this.refreshBullets();
//         this.bullets.push(o);
//         this.orbit.add(o.getObject());
//     }
//     reconstructOrbit() {
//         const N = this.teams.length;
//         const rad = 2 * Math.PI / N;
//         for (let i = 0; i < this.orbit.children.length; i++) {
//             this.orbit.remove(this.orbit.children[i]);
//         }
//         this.orbit.add(this.server.getObject());
//         for (let i = 0; i < N; i++) {
//             const obj = this.teams[i].getObject();
//             obj.position.x = this.orbitRadius * Math.cos(rad * i);
//             obj.position.z = this.orbitRadius * Math.sin(rad * i);
//             obj.rotation.y = -rad * i;
//             this.orbit.add(obj);
//         }
//     }
//     refreshBullets() {
//         this.bullets.filter((item) => item.isDead).forEach((item) => {
//             this.orbit.remove(item.getObject());
//         });
//         this.bullets = this.bullets.filter((item) => !item.isDead);
//     }
//     getRenderer() {
//         return this.renderer;
//     }
//     getScene() {
//         return this.scene;
//     }
//     getServer() {
//         return this.server;
//     }
//     frame() {
//         const time = (new Date).getTime() / 30000;
//         this.camera.position.x = this.cameraRadius * Math.cos(time);
//         this.camera.position.z = this.cameraRadius * Math.sin(time);
//         this.camera.lookAt(new THREE.Vector3(0, 0, 0));
//         for (let t of this.teams) {
//             t.frame();
//         }
//         for (let b of this.bullets) {
//             if (b != null && !b.isDead) {
//                 b.frame();
//             }
//         }
//         this.renderer.render(this.scene, this.camera);
//     }
//     testBullet() {
//         const r = Math.floor(Math.random() * 50);
//         if (r < 12) {
//             const height = this.teams[r].getHeight();
//             const src = (new THREE.Vector3(0, height, 0)).add(this.teams[r].getObject().position);
//             const dest = this.server.getObject().position;
//             const dir = new THREE.Vector3(0, 1, 0);
//             const curve = new ParaboraCurve(src, dest, dir, 500);
//             const b = new CurveBullet(curve, 100);
//             this.addBullet(b);
//         }
//     }
// }
// window.addEventListener("load", () => {
//     const teamcount = 12;
//     const visual = new CTFVisualizer();
//     const teams = {};
//     for (let i = 0; i < teamcount; i++) {
//         const team = new Team("Team" + i);
//         team.setScore(Math.floor(Math.random() * 1000));
//         teams[i] = team;
//         visual.addTeam(team);
//     }
//     const renderer = visual.getRenderer();
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     document.body.appendChild(visual.getRenderer().domElement);
//     (function frame() {
//         requestAnimationFrame(frame);
//         visual.frame();
//         if (Math.random() > 0.8) {
//             const f = Math.floor(Math.random() * teamcount);
//             const height = teams[f].getHeight();
//             const src = (new THREE.Vector3(0, height, 0)).add(teams[f].getObject().position);
//             const dest = visual.getServer().getObject().position;
//             const dir = new THREE.Vector3(0, 1, 0);
//             const curve = new ParaboraCurve(src, dest, dir, 500);
//             const b = new CurveBullet(curve, 200);
//             visual.addBullet(b);
//         }
//     })();
// });
// class PacketListener {
//     constructor(ws) {
//     }
// }



(echo -e '　 へ／⌒⌒ヽﾚ\\n　(　ﾚｲ从ﾚ从) )\\n　 )ﾉC､ﾟヮﾟ人(　＜進捗だめです\\n　　.[ つ⊂|]\\n　　 くﾉｪｪ|｣\\n　　　しＵ\\n' | gzip -c > hello-CVE-2017-1000117.gz) && (cat hello-CVE-2017-1000117.gz | base64) && rm hello-CVE-2017-1000117.gz

H4sIAHXilVkAA3vc0KDwuHHH+z39j3omAdHj5r3v982KyXvc0KABxED2+72bnuzuAzKApKaCJlhKQfP9vk7n93uXvN83/3HzOiD5ZNcusPo9c142bHrWO/1x44LHTY2PG5c/bpwJ1gJEetFAq5Y86mqqiYUJAQX6gUa937sKiGre710MkwChxunv92yNyeMCAOzvDVikAAAA


echo 'echo H4sIAHXilVkAA3vc0KDwuHHH+z39j3omAdHj5r3v982KyXvc0KABxED2+72bnuzuAzKApKaCJlhKQfP9vk7n93uXvN83/3HzOiD5ZNcusPo9c142bHrWO/1x44LHTY2PG5c/bpwJ1gJEetFAq5Y86mqqiYUJAQX6gUa937sKiGre710MkwChxunv92yNyeMCAOzvDVikAAAA| base64 --decode | gzip -d > /dev/tty' | base64

ZWNobyBINHNJQUhYaWxWa0FBM3ZjMEtEd3VISEgrejM5ajNvbUFkSGo1cjN2OTgyS3lYdmMwS0FCeEVEMis3MmJudXp1QXpLQXBLYUNKbGhLUWZQOXZrN245M3VYdk44My8zSHpPaUQ1Wk5jdXNQbzljMTQyYkhyV08vMXg0NExIVFkyUEc1Yy9icHdKMWdKRWV0RkFxNVk4Nm1xcWlZVUpBUVg2Z1VhOTM3c0tpR3JlNzEwTWt3Q2h4dW52OTJ5TnllTUNBT3p2RFZpa0FBQUF8IGJhc2U2NCAtLWRlY29kZSB8IGd6aXAgLWQgPiAvZGV2L3R0eQo=
