import './style.css'
import cube_nx from './assets/cube/nx.jpg'
import cube_ny from './assets/cube/ny.jpg'
import cube_nz from './assets/cube/nz.jpg'
import cube_px from './assets/cube/px.jpg'
import cube_py from './assets/cube/py.jpg'
import cube_pz from './assets/cube/pz.jpg'
import tex_me from './assets/me2.png'
import tex_resume from './assets/resume.png'
import tex_pdf from './assets/texpdf.png'
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, controls;
let renderer;
let scene;

let objects = [];
let selectedObject = null;
let texres, texpdf;
let helper;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


init();
animate();

function init() {

  const container = document.getElementById( 'app' );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 100 );
	//camera.lookAt(new THREE.Vector3(5, 0, 0));

  //cubemap
  const cube_urls = [
    cube_px, cube_nx,
    cube_py, cube_ny,
    cube_pz, cube_nz
  ];
  const backgroundCube = new THREE.CubeTextureLoader().load( cube_urls );
  scene.background = backgroundCube;

  let map = new THREE.TextureLoader().load( tex_me );
  //const material = new THREE.MeshBasicMaterial({color: 0x00ff00, map: map, transparent: true});
  let material = new THREE.MeshBasicMaterial({ map: map, transparent: true});
  let plane_me = new THREE.Mesh( new THREE.PlaneGeometry( 1.2, 4 ), material );
  plane_me.name = 'me';
  plane_me.position.set( -10, -2, 0 );
  plane_me.rotateY( 1.57 );
  //sprite_me.scale.set( 1.3, 4, 0 )

  texres = new THREE.TextureLoader().load( tex_resume );
  texpdf = new THREE.TextureLoader().load( tex_pdf );
  let material2 = new THREE.MeshBasicMaterial({ map: texres, transparent: true});
  let plane_res = new THREE.Mesh( new THREE.PlaneGeometry( 1.8, 2.6 ), material2 );
  plane_res.name = 'resume';
  plane_res.position.set( -10, -2, -2.5 );
  plane_res.bkpos = plane_res.position.clone();
  plane_res.rotateY( 1.57 );

  scene.add( plane_me );
  scene.add( plane_res );
  objects.push(plane_me);
  objects.push(plane_res);
  



  controls = new OrbitControls( camera, renderer.domElement );
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.rotateSpeed = - 0.25;
  controls.target.set(-0.01, 0, 0);

  window.addEventListener( 'resize', onWindowResize );
  document.addEventListener( 'pointermove', onPointerMove );
  document.addEventListener( 'pointerup', onPointerUp );

}


function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  controls.update(); // required when damping is enabled

  renderer.render( scene, camera );
  
}

function onPointerMove( event ) {
   
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( pointer, camera );

  //rayHelper( raycaster.ray );
  
  let success_shot = null;
  const intersects = raycaster.intersectObjects( objects, true );
  if ( intersects.length > 0 ) { // if intersects
    const res = intersects.filter( (res) => res && res.object )[0];
    if ( res && res.object ) 
      success_shot = res.object;
  } 

  if ( success_shot ) {
    if ( success_shot !== selectedObject ) {
      clearSelected();

      selectedObject = success_shot;

      if ( selectedObject.name === 'me' ) {
        selectedObject.material.color.set( 0x00ff00 );
        let badge = document.getElementById( 'badge' );
        badge.style.display = 'block';
        badge.style.top = '20%';
        badge.style.left = '30%';
      }
      if ( selectedObject.name === 'resume' ) {
        selectedObject.scale.set( 6.5, 6.5 );
        selectedObject.position.set( -9, 0, -7 );
        selectedObject.material.map = texpdf;
        selectedObject.material.needsUpdate = true;
      }
    }
  } else { 
    clearSelected();
  }
}

function clearSelected() {
  if ( selectedObject ) {
    if ( selectedObject.name === 'me' ) 
      document.getElementById( 'badge' ).style.display = 'none';
    if ( selectedObject.name === 'resume' ) {
      selectedObject.scale.set( 1, 1 );
      selectedObject.position.copy( selectedObject.bkpos );
      selectedObject.material.map = texres;
      selectedObject.material.needsUpdate = true;
    }
    selectedObject.material.color.set( 0xffffff );
    selectedObject = null;
  }
}


function onPointerUp( event ) {
  if ( selectedObject ) { 
    if ( selectedObject.name === 'me' ) 
      window.open("https://pl.linkedin.com/in/pavel-brouka-b96b2b36?trk=profile-badge", "_blank");
    if ( selectedObject.name === 'resume' ) 
      window.open("cv.pdf", "_blank");
  }
}


function rayHelper( ray ) {
  let info = document.getElementById("infoDebug");
  if( !info ) {
    info = document.createElement("div");
    info.id = "infoDebug";
    info.className = "infoDebug";
    document.body.appendChild(info);
  }
  info.innerHTML = `
    <p>x: ${pointer.x.toFixed(2)}</p>
    <p>y: ${pointer.y.toFixed(2)}</p>
    <p>ray.origin: ${JSON.stringify(ray.origin)}</p>
    <p>ray.direction: ${JSON.stringify(ray.direction)}</p>
  `;

  scene.remove(helper);
  let delta = ray.origin.clone();
  delta.y -= 2;
  helper = new THREE.ArrowHelper(ray.direction, delta, 300, 0xff0000)
  scene.add(helper);
}

