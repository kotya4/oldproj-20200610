import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
import { Noise } from '/www_desert/modules/Noise.js';

export class Ground {
  constructor(scene, material, step_texture) {
    this.W = 20;
    this.H = 20;

    // Noise parameters.
    const stretch = 0.2;
    const scale = 1.5;

    // Creates geometry.
    const g = new THREE.Geometry();
    for (let y = 0; y < this.H; ++y) for (let x = 0; x <= this.W; ++x) {
      let xx, yy, zz;
      if (x < this.W) {
        xx = x + Math.random()*0.8-0.4;
        yy = y + Math.random()*0.8-0.4;
        zz = Noise.perlin2(xx*stretch,yy*stretch)*scale;
      } else {
        xx = x + g.vertices[0+y*(this.W+1)].x;
        yy =     g.vertices[0+y*(this.W+1)].z;
        zz =     g.vertices[0+y*(this.W+1)].y;
      }
      g.vertices.push(new THREE.Vector3(xx, zz, yy));
    }
    for (let y = 0; y < this.H-1; ++y) for (let x = 0; x < this.W; ++x) {
      g.faces.push(
        new THREE.Face3((x+1)+(y+0)*(this.W+1), (x+0)+(y+1)*(this.W+1), (x+1)+(y+1)*(this.W+1)),
        new THREE.Face3((x+0)+(y+1)*(this.W+1), (x+1)+(y+0)*(this.W+1), (x+0)+(y+0)*(this.W+1)),
      );
      g.faceVertexUvs[0].push(
        [new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)],
        [new THREE.Vector2(0, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0)],
      );
    }
    g.computeFaceNormals();
    g.uvsNeedUpdate = true;

    // Creates meshes.

    this.mesh1 = new THREE.Mesh(g, material);
    this.mesh1.position.x = -this.W / 2;
    this.mesh1.position.z = -this.H / 2;
    scene.add(this.mesh1);

    this.mesh2 = new THREE.Mesh(g, material);
    this.mesh2.position.x = -this.W / 2 - this.W;
    this.mesh2.position.z = -this.H / 2;
    scene.add(this.mesh2);

    this.ground_speed = 0.33;

    this.create_steps(scene, step_texture);
  }

  create_steps(scene, texture) {
    this.step_dir = new THREE.Vector3(0, 0, -1);
    this.last_step = 0;
    this.step_time = 0;
    const scaler = 0.05;
    const g = new THREE.PlaneGeometry(scaler, scaler, 0);
    g.translate(scaler / 2, 0, scaler / 2);
    const m = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, opacity: 0.3 });
    this.steps = Array(10).fill().map((_,i) => {
      const mesh = new THREE.Mesh(g, m);
      mesh.position.y = -5;
      scene.add(mesh);
      return mesh;
    });


  }

  update(delta, raycaster, girl, debug) {
    const dx = this.ground_speed * delta;
    this.mesh1.position.x += dx;
    this.mesh2.position.x += dx;
    this.steps.forEach(step => step.position.x += dx);

    if (this.mesh2.position.x >= -this.W / 2) {
      this.mesh1.position.x = -this.W / 2;
      this.mesh2.position.x = -this.W / 2 - this.W;
    }

    const intersections = raycaster.intersectObjects([this.mesh1, this.mesh2]);
    if (intersections.length) {
      girl.gltf.scene.position.y = intersections[0].point.y;
      debug.html(intersections[0].point.y);
      // step
      if ((this.step_time += delta) > 0.5) {
        this.step_time = 0;
        const step = this.steps[this.last_step];
        this.last_step = (this.last_step + 1) % this.steps.length;
        step.position.x = intersections[0].point.x;
        step.position.y = intersections[0].point.y-0.02;
        step.position.z = intersections[0].point.z;
        const normal = new THREE.Vector3();
        normal.x = +intersections[0].face.normal.x;
        normal.y = +intersections[0].face.normal.y;
        normal.z = -intersections[0].face.normal.z;
        step.quaternion.setFromUnitVectors(normal, this.step_dir);
      }
    }
  }
}
