import 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';

// import { Ground } from '/www_desert/modules/Scene/Ground.js';
import { AnimatedMesh } from '/www_rumba/modules/Scene/AnimatedMesh.js';
import { Scene } from '/www_rumba/modules/Scene/Scene.js';



async function main() {

  // Layout.
  $('body').append(

  );

  const scene = new Scene();

  // Textures.
  // const textures = [];
  // const textures_promises = [
  //   '/www_desert/bg2.jpg',
  //   '/www_desert/sand.png',
  //   '/www_desert/step.png',
  // ].map((url,i,urls) =>
  //   new Promise((res,rej) =>
  //     textures.push(
  //       (new THREE.TextureLoader()).load(
  //         url,
  //         // onload
  //         (texture) => {
  //           console.log(`${url} (${i+1}/${urls.length}) :: Loaded`);
  //           res();
  //         },
  //         // onprogress
  //         null,
  //         // onerror
  //         (err) => {
  //           console.log(`${url} (${i+1}/${urls.length}) :: An error happened`, err);
  //           rej();
  //         },
  // ) ) ) );

  // Mesh.
  const iam = new AnimatedMesh('/www_rumba/iam-main.glb', scene.scene);

  // Waits for all files loads.
  await Promise.all([iam.promise]);

  // Some mesh preparations (do after loading).
  {
    console.log(iam);
    iam.gltf.scene.position.y -= 1;

    // iam.gltf.scene.scale.multiplyScalar(0.1);
    // iam.gltf.scene.position.z -= 0.5;
    // iam.gltf.scene.rotation.y -= Math.PI / 2;
    // iam.gltf.scene.traverse((o) => {
    //   if (o.isMesh) {
    //     // console.log(o.material);
    //     // o.material.color = new THREE.Color(0xffffaa);
    //     // o.material.roughness = 1;
    //   }
    // });
  }

  // Setting up drawing cicle.
  scene.renderer.setAnimationLoop(() => {
    const delta = scene.clock.getDelta();
    // Renders.
    scene.stats.update();
    scene.renderer.render(scene.scene, scene.camera);
    // Updates animations.
    iam.update(delta);
    // ground.update(delta, raycaster, girl, $('.text'));
    // Updates camera position.
    // scene.orbit.target.x = girl.gltf.scene.position.x;
    // scene.orbit.target.y = girl.gltf.scene.position.y + 0.2;
    // scene.orbit.target.z = girl.gltf.scene.position.z;
    // scene.orbit.update();
  });
}

main();
