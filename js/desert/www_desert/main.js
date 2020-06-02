import 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
// Mine.
import { AnimatedMesh } from '/www_desert/modules/Scene/AnimatedMesh.js';
import { Ground } from '/www_desert/modules/Scene/Ground.js';
import { Scene } from '/www_desert/modules/Scene/Scene.js';

async function main() {
  // Scene.
  const scene = new Scene();

  // Layout.
  $('body').append(
    $('<div>').attr({ class: 'text' }).html('test'),
    $('<div>').attr({ class: 'desc' }).html(`
<span class="play">Click here to play music.</span> Suddenly, the hardest part of creating the project was writing this text. Not only because my language in such bad condition. So many things to say, so many
emotions tears me apart (I found that idiome in Google). Maybe because of music desision (if you hear the music then you are listening compressed version of "We Lost The Sea - A Gallant Gentleman", stolen from
<a href="https://www.youtube.com/watch?v=051C0FiNX5U">youtube</a>),
or maybe it's because I know what all I am doing is not even nessessary, You can see I am a little depressed right now. But still, I want to share with you with my finest job I have done on this moment (June 2nd '20).
So, please, don't blame me for the length of this text, there is no
deep technical description of project (surprisingly not a lot of technical things happens here). Btw, this is my very first attempt to animate something in 3D, so I desided to use some third-party libraries to represent my
work (this is my second project using <a href="https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene">THREE JS</a> r115)
and went away from concentrating on basic things such as initializing WebGL context with bare hands, writing shaders from scratch (which I have already done in other projects and that is why exactly they are not survived
to release btw) and so on. Also I've used a little bit of <a href="https://jquery.com/">JQuery</a> (underestimated before, I'll use it further in projects. Such a convinient way of drawing html layout in runtime you know), and
library called <a href="http://josephg.github.com/noisejs/">"noisejs"</a> (for now page is dead kek) for generating terrain with Perlin noise. That's all. Enjoy my low poly girl walking through the desert to the sunset with
postrock playing on background. Where will be no story about my fight with converting mesh into a GLTF, baking IK-bones animation, and two double-sided A5 pages scribbled with Blender 2.8 hotkeys.
Only a peaceful desert walk. Cheers.`
    ),
  );

  // Postrock.
  $('.play').click(function() { const audio = new Audio('/www_desert/music.ogg'); audio.play(); });

  // Textures.
  const textures = [];
  const textures_promises = [
    '/www_desert/bg2.jpg',
    '/www_desert/sand.png',
    '/www_desert/step.png',
  ].map((url,i,urls) =>
    new Promise((res,rej) =>
      textures.push(
        (new THREE.TextureLoader()).load(
          url,
          (texture) => {
            console.log(`${url} (${i+1}/${urls.length}) :: Loaded`);
            res();
          },
          null,
          (err) => {
            console.log(`${url} (${i+1}/${urls.length}) :: An error happened`, err);
            rej();
          }
        )
      )
    )
  );

  // Mesh.
  const girl = new AnimatedMesh('/www_desert/walking_girl.glb', scene.scene);

  // Waits for all files loads.
  await Promise.all([girl.promise, ...textures_promises]);

  // Some mesh preparations (do after loading).
  {
    girl.gltf.scene.scale.multiplyScalar(0.1);
    girl.gltf.scene.position.z -= 0.5;
    girl.gltf.scene.rotation.y -= Math.PI / 2;
    girl.gltf.scene.traverse((o) => {
      if (o.isMesh) {
        console.log(o.material);
        // o.material.color = new THREE.Color(0xffffaa);
        // o.material.roughness = 1;
      }
    });
  }

  // Ground.
  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(girl.gltf.scene.position.x, 4, girl.gltf.scene.position.z),
    new THREE.Vector3(0, -1, 0),
    -5, +5
  );
  const ground_material = new THREE.MeshLambertMaterial({ map: textures[1], color: 0xffbbaa })
  const ground = new Ground(scene.scene, ground_material, textures[2]);

  // Some scene preparations.
  {
    // Fog.
    scene.scene.fog = new THREE.Fog(0x2a1d1b, 3, Math.min(ground.W, ground.H) / 2);

    // Skybox.
    // source: https://threejsfundamentals.org/threejs/lessons/threejs-backgrounds.html
    const texture = textures[0];
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    const shader = THREE.ShaderLib.equirect;
    const material = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide,
    });
    material.uniforms.tEquirect.value = texture;
    const size = Math.max(ground.W, ground.H);
    const plane = new THREE.BoxBufferGeometry(size, 5, size);
    const bgMesh = new THREE.Mesh(plane, material);
    bgMesh.position.y = +1.5;
    bgMesh.fog = false;
    scene.scene.add(bgMesh);
    scene.orbit.autoRotate = true;
  }

  // Setting up drawing cicle.
  scene.renderer.setAnimationLoop(() => {
    const delta = scene.clock.getDelta();
    // Renders.
    scene.stats.update();
    scene.renderer.render(scene.scene, scene.camera);
    // Updates animations.
    girl.update(delta);
    ground.update(delta, raycaster, girl, $('.text'));
    // Updates camera position.
    scene.orbit.target.x = girl.gltf.scene.position.x;
    scene.orbit.target.y = girl.gltf.scene.position.y + 0.2;
    scene.orbit.target.z = girl.gltf.scene.position.z;
    scene.orbit.update();
  });
}

main();
