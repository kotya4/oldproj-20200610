import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/loaders/GLTFLoader.js';

export class AnimatedMesh {
  constructor(url, scene) {
    this.gltf = null;
    this.mixer = null;
    this.action = null;
    this.helper = null;

    this.promise = new Promise((res,rej) => {
      const onload = (gltf) => {
        this.gltf = gltf;
        this.mixer = new THREE.AnimationMixer(this.gltf.scene);
        this.action = this.mixer.clipAction(this.gltf.animations[0]);
        this.action.play();
        this.helper = new THREE.SkeletonHelper(this.gltf.scene);

        let animation_index = 0;
        setInterval(() => {
          const n = this.gltf.animations.length;
          animation_index += 1;
          animation_index %= n;
          this.action.stop();
          this.action = this.mixer.clipAction(this.gltf.animations[animation_index]);
          // console.log('1');
          this.action.play();
        }, 5000);

        if (scene) {
          scene.add(this.gltf.scene);
          // scene.add(this.helper);
        }

        console.log(url + ':: Successfuly loaded');

        res();
      }

      const onprogress = (xhr) => {
        console.log(url + ':: ' + (xhr.loaded / xhr.total * 100 | 0) + '% loaded');
      }

      const onerror = (error) => {
        console.log(url + ':: An error happened: ', error);

        rej();
      }

      const loader = new GLTFLoader();
      loader.load(url, onload, onprogress, onerror);
    });
  }

  update(delta) {
    this.mixer.update(delta);
  }
}
