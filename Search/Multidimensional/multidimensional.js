
let camera3D, scene, renderer
let myCanvas, myVideo;
let people = {};  //make it an associatvie array with each person labeled by network id
let p5lm 
let samplePoints = [];
let myRoomName = "multidimensionalRooom";

function setup() {
    console.log("setup");
    myCanvas = createCanvas(512, 512);
    myCanvas.hide();
    //let captureConstraints =  allowCameraSelection(myCanvas.width,myCanvas.height) ;
    //myVideo = createCapture(captureConstraints, videoLoaded);
    //below is simpler if you don't need to select Camera because default is okay

    myVideo = createCapture(VIDEO);
    myVideo.size(myCanvas.width, myCanvas.height);
    myVideo.elt.muted = true;
    myVideo.hide()


    p5lm = new p5LiveMedia(this, "CANVAS", myCanvas, myRoomName)
    p5lm.on('stream', gotStream);
    p5lm.on('data', gotData);
    p5lm.on('disconnect', gotDisconnect);

    init3D();

    //create the local thing
    creatNewVideoObject(myVideo, "me");
    createSamplePoint(0);
    createSamplePoint(180);
}

function createSamplePoint(angle){
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    var context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height); //make it blank
    var textTexture = new THREE.Texture(canvas);
    textTexture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({ map: textTexture, transparent:false });
    var geo = new THREE.PlaneGeometry(512, 512);
    var mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);
    positionOnCircle(angle,mesh);
    samplePoints.push({"object":mesh, "texture":textTexture, "canvas":canvas});
}



var point1 = document.getElementById("point1");
point1.addEventListener("keydown", function (e) {
    if (e.key == "Enter") {  //checks whether the pressed key is "Enter"
    talkToRunway(point1.value,1);
    }
});

var point2  = document.getElementById("point2");
point2.addEventListener("keydown", function (e) {
    if (e.key == "Enter") {  //checks whether the pressed key is "Enter"
    talkToRunway(point2.value,2);
    }
});

function talkToRunway(query,forWhich) {
    const path = 'http://localhost:8000/query';
    console.log("askit");
    const data = {
      "caption": query
    };
    var whoIsAsking = forWhich;
    httpPost(path, 'json', data, gotImageFromRunway, gotError);
  }
  
  function gotError(error) {
    console.error(  error);
  }
  
  function gotImageFromRunway(data) {
    console(whoIsAsking);
    console.log("Got Image Data", data.result);
    let runway_img= createImg(data.result,"image generated in runway");
  
   // let graphics = createGraphics(width,height);
   // graphics.image(runway_img,0,0);
   // placeImage(graphics.elt);
   // runway_img.hide();
  }
  


///move people around and tell them about 
function keyPressed() {
    let me = people["me"];
    if (keyCode == 37 || key == "a") {
        me.angleOnCircle -= .01;

    } else if (keyCode == 39 || key == "d") {
        me.angleOnCircle += .01;
    

    } else if (keyCode == 38 || key == "w") {

    } else if (keyCode == 40 || key == "s") {

    }
    positionOnCircle(me.angleOnCircle, me.object); //change it locally 
    //send it to others
    let dataToSend = { "angleOnCircle": me.angleOnCircle };
    p5lm.send(JSON.stringify(dataToSend));

}



function gotData(data, id) {
    // If it is JSON, parse it
    let d = JSON.parse(data);
    positionOnCircle(d.angleOnCircle, people[id].object);
}

function gotStream(videoObject, id) {
    //this gets called when there is someone else in the room, new or existing
    videoObject.hide();  //don't want the dom object, will use in p5 and three.js instead
    //get a network id from each person who joins
    creatNewVideoObject(videoObject, id);
}

function gotDisconnect(id) {
    people[id].videoObject.remove(); //dom version
    scene.remove(people[id].object); //three.js version
    delete people[id];  //remove from our variable
}

function creatNewVideoObject(videoObject, id) {  //this is for remote and local
    var videoGeometry = new THREE.PlaneGeometry(512, 512);
    let myTexture = new THREE.Texture(videoObject.elt);  //NOTICE THE .elt  this give the element
    let videoMaterial = new THREE.MeshBasicMaterial({ map: myTexture, side: THREE.DoubleSide });
    videoMaterial.map.minFilter = THREE.LinearFilter;  //otherwise lots of power of 2 errors
    myAvatarObj = new THREE.Mesh(videoGeometry, videoMaterial);

    scene.add(myAvatarObj);

    //they can move that around but we need to put you somewhere to start
    angleOnCircle = positionOnCircle(null, myAvatarObj);

    //remember a bunch of things about each connection in json but we are really only using texture in draw
    //use an named or associate array where each oject is labeled with an ID
    people[id] = { "object": myAvatarObj, "texture": myTexture, "id": id, "videoObject": videoObject, "angleOnCircle": angleOnCircle };

}

function positionOnCircle(angle, thisAvatar) {
    //position it on a circle around the middle
    if (angle == null) { //first time
        angle = random(2*Math.PI); 
    }
      //imagine a circle looking down on the world and do High School math
    let distanceFromCenter = 800;
    x = distanceFromCenter * Math.sin(angle);
    z = distanceFromCenter * Math.cos(angle);
    thisAvatar.position.set(x, 0, z);  //zero up and down
    thisAvatar.lookAt(0, 0, 0);  //oriented towards the camera in the center
    return angle;
}

function draw() {
    //go through all the people an update their texture, animate would be another place for this
    for(id in people){
        let thisPerson = people[id];
        if (thisPerson .videoObject.elt.readyState == thisPerson .videoObject.elt.HAVE_ENOUGH_DATA) {
            //check that the transmission arrived okay
            //then tell three that something has changed.
            thisPerson.texture.needsUpdate = true;
        }
    }
    //this is what gets sent to other people;
    clear();
    image(myVideo, (myCanvas.width - myVideo.width) / 2, (myCanvas.height - myVideo.height) / 2);

}

function init3D() {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let bgGeometery = new THREE.SphereGeometry(900, 100, 40);
    //let bgGeometery = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true)
    bgGeometery.scale(-1, 1, 1);
    // has to be power of 2 like (4096 x 2048) or(8192x4096).  i think it goes upside down because texture is not right size
    let panotexture = new THREE.TextureLoader().load("itp.jpg");
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });

    let back = new THREE.Mesh(bgGeometery, backMaterial);
    scene.add(back);

    moveCameraWithMouse();

    camera3D.position.z = 0;
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera3D);
}

/////MOUSE STUFF  ///YOU MIGHT NOT HAVE TO LOOK DOWN BELOW HERE VERY MUCH

var onMouseDownMouseX = 0, onMouseDownMouseY = 0;
var onPointerDownPointerX = 0, onPointerDownPointerY = 0;
var lon = -90, onMouseDownLon = 0; //start at -90 degrees for some reason
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

function allowCameraSelection(w, h) {
    //This whole thing is to build a pulldown menu for selecting between cameras

    //manual alternative to all of this pull down stuff:
    //type this in the console and unfold resulst to find the device id of your preferredwebcam, put in sourced id below
    //navigator.mediaDevices.enumerateDevices()

    //default settings
    let videoOptions = {
        audio: true, video: {
            width: w,
            height: h
        }
    };

    let preferredCam = localStorage.getItem('preferredCam')
    //if you changed it in the past and stored setting
    if (preferredCam) {
        videoOptions = {
            video: {
                width: w,
                height: h,
                sourceId: preferredCam
            }
        };
    }
    //create a pulldown menu for picking source
    navigator.mediaDevices.enumerateDevices().then(function (d) {
        var sel = createSelect();
        sel.position(10, 10);
        for (var i = 0; i < d.length; i++) {
            if (d[i].kind == "videoinput") {
                let label = d[i].label;
                let ending = label.indexOf('(');
                if (ending == -1) ending = label.length;
                label = label.substring(0, ending);
                sel.option(label, d[i].deviceId)
            }
            if (preferredCam) sel.selected(preferredCam);
        }
        sel.changed(function () {
            let item = sel.value();
            //console.log(item);
            localStorage.setItem('preferredCam', item);
            videoOptions = {
                video: {
                    optional: [{
                        sourceId: item
                    }]
                }
            };
            myVideo.remove();
            myVideo = createCapture(videoOptions, VIDEO);
            myVideo.hide();
            console.log("Preferred Camera", videoOptions);
        });
    });
    return videoOptions;
}