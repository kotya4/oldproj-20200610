import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
import Stats from '/www_desert/modules/Stats.js';

export class Scene {
  constructor() {
    this.setup_display();
    this.setup_light();
    this.setup_controls();
    this.setup_materials();
    console.log(`%cTHREEJS ${this.W}x${this.H}`, 'color:lightblue');
  }

  setup_display() {
    // this.W = window.innerWidth;
    // this.H = window.innerHeight;
    this.W = 400;
    this.H = 400;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.W/this.H, 0.1, 1000);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.W, this.H);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.className = 'renderer';
    this.renderer.domElement.style.width = '40%';
    this.renderer.domElement.style.height = 'auto';

    // window.addEventListener('resize', function () {
    //   this.W = window.innerWidth;
    //   this.H = window.innerHeight;
    //   this.renderer.setSize(this.W, this.H);
    //   this.camera.aspect = this.W/this.H;
    //   this.camera.updateProjectionMatrix();
    // });
  }

  setup_light() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(this.ambientLight);

    this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight1.position.x = -5.5;
    this.directionalLight1.position.y = +2.5;
    this.directionalLight1.position.z = +2.5;
    this.scene.add(this.directionalLight1);

    this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    this.directionalLight2.position.x = +1.5;
    this.directionalLight2.position.z = -2.5;
    this.scene.add(this.directionalLight2);
  }

  setup_controls() {
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.orbit.position0, {x: 0.8011780783361369, y: 0.5573222954321227, z: -1.5105706198156972});
    this.orbit.reset();
    this.stats = new Stats();
    document.body.appendChild(this.stats.domElement);

    // Mouse moving.
    this.renderer.domElement.addEventListener('mousemove', (event) => {
        // Sets mouse.
      this.mouse.x = +(event.clientX / this.W * 2 - 1);
      this.mouse.y = -(event.clientY / this.H * 2 - 1);
    });

    // Listens mouse button releasing.
    this.renderer.domElement.addEventListener('mouseup', (event) => {
      // this.orbit.enabled = true;
    });

    // Прослушка нажатия кнопки мыши.
    this.renderer.domElement.addEventListener('mousedown', (event) => {
      event.preventDefault(); // Does remove context menu on right click.
      // Sets mouse and casts a ray.
      this.mouse.x = +(event.clientX / this.W * 2 - 1);
      this.mouse.y = -(event.clientY / this.H * 2 - 1);
      this.orbit.saveState();
      console.log(
        this.orbit.zoom0,
        this.orbit.position0,
        );
    });
  }

  setup_materials() {
    // Some precalculated geometries to use.
    this.geometries = {
      cube: new THREE.CubeGeometry(1, 1, 1),
      edges: new THREE.EdgesGeometry(new THREE.CubeGeometry(1, 1, 1)),
    };
    // Materials indeed.
    this.materials = {
      lambert_white: new THREE.MeshLambertMaterial({ color: 0xffffff }),
      line_blue: new THREE.LineBasicMaterial({ color: 0x0000ff }),
      line_darkgreen: new THREE.LineBasicMaterial({ color: 0x00aa00 }),
    };
    // Creates cube mesh.
    this.cube_mesh = () => new THREE.Mesh(this.geometries.cube, this.materials.lambert_white);
    this.line_mesh = () => new THREE.LineSegments(this.geometries.edges, this.materials.line_blue);
  }
}
