
let camera3D, scene, renderer, cube;
let dir = 0.01;
let myCanvas, myVideo, p5CanvasTexture, poseNet;
let headAngle, nose;

function setup() {
    myCanvas = createCanvas(512, 512);
    myCanvas.hide();
    let constraints = {
        video: {
            sourceId: "0a3b504a5d64c67a10f7173e0e07c74c34a40ae1108e2a004d08508810f31ea2",
          mandatory: {
            minWidth: 640,
            minHeight: 480
          },
          optional: [{ maxFrameRate: 10 }]
        },
        audio: false
      };

    myVideo = createCapture(constraints,VIDEO);
   // myVideo = createCapture(VIDEO);
    myVideo.size(320, 240);
    myVideo.hide();
    nose= {"x":myVideo.width/2, "y":myVideo.height/2};
    poseNet = ml5.poseNet(myVideo, modelReady);
    poseNet.on("pose", gotPoses);

    init3D();
}

function modelReady() {
    console.log("model ready");
    progress = "loaded";
    poseNet.singlePose(myVideo);
}


// A function that gets called every time there's an update from the model
function gotPoses(results) {
    // console.log(results[0].pose.nose);
    if (!results[0]) return;
    poses = results;
    progress = "predicting";
    let thisNose = results[0].pose.nose;
    if (thisNose.confidence > .8) {
        nose.x = thisNose.x;
        nose.y = thisNose.y;
    }
    let xDiff = poses[0].pose.leftEye.x - poses[0].pose.rightEye.x;
    let yDiff = poses[0].pose.leftEye.y - poses[0].pose.rightEye.y;
    //console.log(yDiff/xDiff);
    headAngle = Math.atan2(yDiff, xDiff);
    //console.log(headAngle);
}

function findExtremes(results) {
    keypoints = results[0].pose.keypoints;
    let left = videoWidth;
    let right = 0;
    let top = videoHeight;
    let bottom = 0;
    for (var i = 0; i < keypoints.length; i++) {
        if (keypoints[i].score > .8) {
            if (keypoints[i].position.x < left) left = keypoints[i].position.x;
            if (keypoints[i].position.x > right) right = keypoints[i].position.x;
            if (keypoints[i].position.y < top) top = keypoints[i].position.y;
            if (keypoints[i].position.y > bottom) bottom = keypoints[i].position.y;
        }
    }
    extremes = { "left": left, "top": top, "right": right, "bottom": bottom };
    return extremes;
}



function draw() {
    clear();
    image(myVideo, (myCanvas.width - myVideo.width) / 2, (myCanvas.height - myVideo.height) / 2);
}

function init3D() {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // const geometry = new THREE.BoxGeometry();
    //  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //  cube = new THREE.Mesh(geometry, material);
    //   scene.add(cube);

    var videoGeometry = new THREE.PlaneGeometry(512, 512);
    p5CanvasTexture = new THREE.Texture(myCanvas.elt);  //NOTICE THE .elt  this give the element
    //  let videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture});
    let videoMaterial = new THREE.MeshBasicMaterial({ map: p5CanvasTexture, transparent: true, opacity: 1, side: THREE.DoubleSide });
    //  let videoMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    myAvatarObj = new THREE.Mesh(videoGeometry, videoMaterial);
    myAvatarObj.position.set(0, 0, -500);
    scene.add(myAvatarObj);



    let bgGeometery = new THREE.SphereGeometry(900, 100, 40);
    //let bgGeometery = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true)
    bgGeometery.scale(-1, 1, 1);
    // has to be power of 2 like (4096 x 2048) or(8192x4096).  i think it goes upside down because texture is not right size
    let panotexture = new THREE.TextureLoader().load("itp.jpg");
    // var material = new THREE.MeshBasicMaterial({ map: panotexture, transparent: true,   alphaTest: 0.02,opacity: 0.3});
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });

    let back = new THREE.Mesh(bgGeometery, backMaterial);
    scene.add(back);

    moveCameraWithMouse();

    camera3D.position.z = 5;
    animate();
}

function animate() {

    requestAnimationFrame(animate);
    p5CanvasTexture.needsUpdate = true;
    //cube.scale.x += dir;
    // cube.scale.y += dir;
    //cube.scale.z += dir;
    // if (cube.scale.x > 4 || cube.scale.x < -4) {
    //    dir = -dir;
    // }
    renderer.render(scene, camera3D);
}

/////MOUSE STUFF

var onMouseDownMouseX = 0, onMouseDownMouseY = 0;
var onPointerDownPointerX = 0, onPointerDownPointerY = 0;
var lon = -90, onMouseDownLon = 0;
var lat = 0, onMouseDownLat = 0;
var isUserInteracting = false;


function moveCameraWithMouse() {
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResize, false);
    camera3D.target = new THREE.Vector3(0, 0, 0);
}

function onDocumentKeyDown(event) {
    //if (event.key == " ") {
    //in case you want to track key presses
    //}
}

function onDocumentMouseDown(event) {
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    isUserInteracting = true;
}

function onDocumentMouseMove(event) {
    if (isUserInteracting) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        computeCameraOrientation();
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
    camera3D.fov += event.deltaY * 0.05;
    camera3D.updateProjectionMatrix();
}

function computeCameraOrientation() {
    lat = Math.max(- 30, Math.min(30, lat));  //restrict movement
    let phi = THREE.Math.degToRad(90 - lat);  //restrict movement
    let theta = THREE.Math.degToRad(lon);
    camera3D.target.x = 10000 * Math.sin(phi) * Math.cos(theta);
    camera3D.target.y = 10000 * Math.cos(phi);
    camera3D.target.z = 10000 * Math.sin(phi) * Math.sin(theta);
    camera3D.lookAt(camera3D.target);
}


function onWindowResize() {
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}

