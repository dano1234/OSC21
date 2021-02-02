
let camera3D, scene, renderer, cube;
let dir = 0.01;
let myCanvas, myVideo, p5CanvasTexture;
let connections = [];
let textures = []

function setup() {
    myCanvas = createCanvas(512, 512);
    myCanvas.hide();
    myVideo = createCapture(VIDEO, videoLoaded);
    myVideo.hide()
    myVideo.size(320, 240);

    init3D();
}

function videoLoaded(stream) {
    ;
    let p5lm = new p5LiveMedia(this, "CAPTURE", stream, "mycrazyroomname")
    p5lm.on('stream', gotStream);
}

function gotStream(stream, id) {
    stream.hide();
    creatNewVideoObject(stream);
}

function creatNewVideoObject(canvas) {  //this is for remote and local
    var videoGeometry = new THREE.PlaneGeometry(512, 512);
    let p5CanvasTexture = new THREE.Texture(canvas.elt);  //NOTICE THE .elt  this give the element
    //let videoMaterial = new THREE.MeshBasicMaterial({ map:   p5CanvasTexture});
    let videoMaterial = new THREE.MeshBasicMaterial({ map: p5CanvasTexture, transparent: true, opacity: 1, side: THREE.DoubleSide });
    videoMaterial.map.minFilter = THREE.LinearFilter;  //otherwise lots of errors
    //  let videoMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    myAvatarObj = new THREE.Mesh(videoGeometry, videoMaterial);

    scene.add(myAvatarObj);
    connections.push(myAvatarObj);
    textures.push(p5CanvasTexture);
    console.log(myAvatarObj.material.map);
    let horiz_angle = (connections.length + 1) * 2 * Math.PI / 5;
    let vert_anagle = 0;
    let distanceFromCenter = 850;
    x = distanceFromCenter * Math.sin(horiz_angle); //Math.sin(vert_anagle) * 
    y = 0; //distanceFromCenter  * Math.cos(vert_anagle);
    z = distanceFromCenter * Math.cos(horiz_angle); //Math.sin(vert_anagle) * 
    myAvatarObj.position.set(x, y, z);
    myAvatarObj.lookAt(0, 0, 0);

}

function draw() {
    clear();//for making background transparent
    image(myVideo, (myCanvas.width - myVideo.width) / 2, (myCanvas.height - myVideo.height) / 2);
}

function init3D() {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // const geometry = new THREE.BoxGeometry();
    //  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //  cube = new THREE.Mesh(geometry, material);
    //   scene.add(cube);


    creatNewVideoObject(myCanvas);

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

    camera3D.position.z = 0;
    animate();
}

function animate() {

    requestAnimationFrame(animate);
    for (var i = 0; i < textures.length; i++) {
        textures[i].needsUpdate = true;
    }
    // p5CanvasTexture.needsUpdate = true;
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

