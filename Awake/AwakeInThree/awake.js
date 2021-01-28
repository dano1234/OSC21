let camera3D, scene, renderer;
let cube,light,spotLight;
let controls;


function init3D() {
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    light = new THREE.PointLight(0xFF00);
    /* position the light so it shines on the cube (x, y, z) */
    light.position.set(0, 0, 0);
    scene.add(light);

    spotLight = new THREE.SpotLight( 0xffff00 );
    spotLight.position.set( 0, 0, 0);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x008800 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);


    let sphere = new THREE.SphereGeometry(1000, 60, 40);
    //let cylinder = new THREE.CylinderGeometry(725, 725, 1000, 10, 10, true)
    //  var geometry = new THREE.CylinderGeometry(500, 60, 40);
    sphere.scale(-1, 1, 1);
    //  (8192x4096).  i think it goes upside down because texture is not right size
    let panotexture = new THREE.TextureLoader().load("itp.jpg");
   // var material = new THREE.MeshBasicMaterial({ map: panotexture, transparent: true,   alphaTest: 0.02,opacity: 0.3});
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture});

    let back = new THREE.Mesh(sphere, backMaterial);
    scene.add(back);


    camera3D.position.z = 5;

    controls = new THREE.OrbitControls(camera3D, renderer.domElement);
    //controls.addEventListener('change', animate);
    animate();
}

function animate() {
    requestAnimationFrame(animate);  //call it self, almost recursive
    
    spotLight.rotation.x += 0.01;
    spotLight.rotation.y += 0.01;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    controls.update;
    renderer.render(scene, camera3D);
}

init3D();