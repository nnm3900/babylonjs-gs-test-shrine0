// シーンの作成
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

// カメラの作成
let camera;
const isTouchDevice = window.ontouchstart !== undefined;
if (isTouchDevice) {
    camera = new BABYLON.VirtualJoysticksCamera("VJC", new BABYLON.Vector3(0, 5, 0), scene);
} else {
    camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 5, 0), scene);
}
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);
camera.applyGravity = true; 
camera.checkCollisions = true;
camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
camera.minZ = 0.45;
camera.speed = 0.1;
camera.angularSensibility = 4000;
camera.keysUp.push(87);
camera.keysLeft.push(65);
camera.keysDown.push(83);
camera.keysRight.push(68);


// debag
//const axesViewer = new BABYLON.AxesViewer(scene, 5);

// gsplat
var gs0 = new BABYLON.GaussianSplattingMesh("gs0", "output_000.splat", scene);
var gs1 = new BABYLON.GaussianSplattingMesh("gs1", "output_001.splat", scene);
gs0.position = new BABYLON.Vector3(0, 2, 0);
gs0.rotation = new BABYLON.Vector3(0, 0, 0); 
const scale = 2
gs0.scaling = new BABYLON.Vector3(scale, scale, scale);
gs1.position = new BABYLON.Vector3(0, 2, 0);
gs1.rotation = new BABYLON.Vector3(0, 0, 0); 
gs1.scaling = new BABYLON.Vector3(scale, scale, scale);

//bgm
// BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
// window.addEventListener(
//   "click",
//   () => {
//     if (!BABYLON.Engine.audioEngine.unlocked) {
//       BABYLON.Engine.audioEngine.unlock();
//     }
//   },
//   { once: true },
// );
const bgm = new BABYLON.Sound("Music", "bgm.mp3", scene, null, {
    loop: true,
    autoplay: true,
    volume: 1
});
bgm.play();
const footstep = new BABYLON.Sound("Music", "footstep.mp3", scene, null, {
    loop: false,
    autoplay: true,
    playbackRate: 1,
    volume: 0.5,
    length: 1, 
    offset: 0
});

let prevCameraPosition = camera.position.clone();
function checkCameraPositionChange() {
    const currentCameraPosition = camera.position;
    if (!currentCameraPosition.equals(prevCameraPosition)) {
        if(!footstep.isPlaying){
            footstep.play();
        }
        prevCameraPosition = currentCameraPosition.clone();
    }
}

// 光源の作成
const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

// 地面の作成
const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
ground.checkCollisions = true;

// 移動速度と感度の設定
const speed = 0.1;
const angularSensibility = 2000;

// マウス感度の設定
camera.angularSensibility = angularSensibility;

// シーンのレンダリング
engine.runRenderLoop(() => {
    scene.render();
    checkCameraPositionChange();

});

// ウィンドウのリサイズ時の処理
window.addEventListener('resize', () => {
    engine.resize();
});