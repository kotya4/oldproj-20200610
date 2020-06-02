//
window.onload = function Main() {
  // Сетап сцены.
  let W = window.innerWidth, H = window.innerHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000);
  camera.position.z = 5;
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(W, H);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', function () {
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W/H;
    camera.updateProjectionMatrix();
  });
  // Свет.
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight1.position.x = +1.5;
  directionalLight1.position.z = +2.5;
  scene.add(directionalLight1);
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.x = -1.5;
  directionalLight2.position.z = -2.5;
  scene.add(directionalLight2);
  // Управление.
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  // Intersections.
  const intersected_objects = [];
  function intersect(models, voxels) {
    intersected_objects.length = 0;
    for (let i = 0; i < voxels.length; ++i) {
      if (voxels[i] == null) continue;
      raycaster.intersectObject(models[i], false, intersected_objects);
    }
    return intersected_objects;
  }
  // Controls.
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  // Loads controls from localStorage.
  {
    const params = window.localStorage.getItem('VOXEL__controls');
    if (params) {
      const { zoom0, position0 } = JSON.parse(params);
      controls.zoom0 = zoom0;
      Object.assign(controls.position0, position0);
      controls.reset();
    }
  }
  // Saves controls into localStorage.
  function save_controls() {
    controls.saveState();
    window.localStorage.setItem('VOXEL__controls', JSON.stringify({
      zoom0: controls.zoom0,
      position0: controls.position0,
    }));
  }
  // Статистика.
  const stats = new Stats();
  document.body.appendChild(stats.domElement);

  console.log(`%cTHREEJS ${W}x${H}`, 'color:lightblue');

  // Some precalculated geometries to use.
  const geometries = {
    cube: new THREE.CubeGeometry(1, 1, 1),
    edges: new THREE.EdgesGeometry(new THREE.CubeGeometry(1, 1, 1)),
  };
  // Materials indeed.
  const materials = {
    lambert_white: new THREE.MeshLambertMaterial({ color: 0xffffff }),
    line_blue: new THREE.LineBasicMaterial({ color: 0x0000ff }),
    line_darkgreen: new THREE.LineBasicMaterial({ color: 0x00aa00 }),
  };

  // Creates cube mesh.
  function cube_mesh() {
    return new THREE.Mesh(geometries.cube, materials.lambert_white);
  }
  function line_mesh() {
    return new THREE.LineSegments(geometries.edges, materials.line_blue);
  }

  // Размеры воксельной карты.
  const map_size = 21;

  // Границы карты.
  var borders = new THREE.LineSegments(geometries.edges, materials.line_darkgreen);
  borders.scale.set(map_size, map_size, map_size);
  if (map_size % 2 === 0) {
    borders.position.x += 0.5;
    borders.position.y += 0.5;
    borders.position.z += 0.5;
  }
  scene.add(borders);
  // Converts scene coordinates into map coordinates.
  function scene_to_map(x, y, z) {
    return [
      borders.scale.x / 2 - 0.5 - borders.position.x - x | 0,
      borders.scale.y / 2 - 0.5 - borders.position.y - y | 0,
      borders.scale.z / 2 - 0.5 - borders.position.z - z | 0,
    ];
  }

  ////////////////////////////////////////////////////////////////////////
  // lined cubes
  ////////////////////////////////////////////////////////////////////////

  let lined_cubes_nulled_num = 0;
  let lined_cubes_visisble = false;
  let lined_cubes = [];
  function add_lined_cube(parent) {
    if (parent.__lined_cube) {
      parent.__lined_cube.visible = lined_cubes_visisble;
    } else {
      const mesh = line_mesh();
      mesh.position.x = parent.position.x;
      mesh.position.y = parent.position.y;
      mesh.position.z = parent.position.z;
      mesh.visible = lined_cubes_visisble;
      scene.add(mesh);
      lined_cubes.push(mesh);
      parent.__lined_cube = mesh;
      mesh.__index = lined_cubes.length - 1;
    }
  }
  function remove_lined_cube(parent) {
    // TODO: можно не удалять меши, а отмечать их как удаленные,
    //       потом при создании мешей находить первый удаленный
    //       в массиве и добавлять его как новый. тогда не нужно
    //       будет фильтровать null-объекты при удалении как сейчас.
    const mesh = parent.__lined_cube;
    scene.remove(mesh);
    lined_cubes[mesh.__index] = null;
    // Clearing null-objects from lined_cubes
    if (++lined_cubes_nulled_num > 1000) {
      console.log(lined_cubes_nulled_num);
      lined_cubes_nulled_num = 0;
      lined_cubes = lined_cubes.filter(e => e != null);
      lined_cubes.forEach((e,i) => e.__index = i);
    }
  }
  function show_lined_cubes() {
    lined_cubes_visisble = true;
    lined_cubes.forEach(e => (e != null) && (e.visible = true));
  }
  function hide_lined_cubes() {
    lined_cubes_visisble = false;
    lined_cubes.forEach(e => (e != null) && (e.visible = false));
  }

  ////////////////////////////////////////////////////////////////////////
  // Prepares maps.
  ////////////////////////////////////////////////////////////////////////

  const map_models = Array(map_size ** 3).fill(null); // Инстансы модели куба.
  const map_voxels = Array(map_size ** 3).fill(null); // Тип вокселя (цвет, материал и т.д.), и рисуется ли он.
  // const map_cubis  = []; // Blue lined cubes.
  // Парсит координаты в индекс.
  function I(x, y, z) {
    // Calculates map index (0 or positive, less than map_size ** 3), otherwise returns -1.
    if (x < 0 || y < 0 || z < 0 || x >= map_size || y >= map_size || z >= map_size)
      return -1;
    return x + (y + z * map_size) * map_size;
  }
  let visible_models_num = 0;
  // Loads map from localStorage.
  {
    const params = window.localStorage.getItem('VOXEL__map');
    if (params) {
      const { models } = JSON.parse(params);
      visible_models_num = models.length;
      for (let m of models) {
        const { x, y, z } = m;
        const i = I(...scene_to_map(x, y, z));
        const cube = cube_mesh();
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        map_voxels[i] = 1;
        map_models[i] = cube;
        cube.__map_index = i;
        scene.add(cube);
        add_lined_cube(cube);
      }
    } else {
      // Creating one cube.
      visible_models_num = 1;
      const i = I(...scene_to_map(0, 0, 0));
      const cube = cube_mesh();
      map_voxels[i] = 1;
      map_models[i] = cube;
      cube.__map_index = i;
      scene.add(cube);
      add_lined_cube(cube);
    }
  }
  // Saves map into localStorage.
  function save_map() {
    const models = [];
    for (let i = 0; i < map_voxels.length; ++i)
      if (map_voxels[i] != null)
        models.push({ ...map_models[i].position });
    window.localStorage.setItem('VOXEL__map', JSON.stringify({ models }));
  }
  // Shows/hides map_models.
  function set_cubes_visibility(state=true) {
    for (let m of map_models) if (m != null) m.visible = state;
  }

  ////////////////////////////////////////////////////////////////////////
  // marchingcubes
  ////////////////////////////////////////////////////////////////////////

  let marchingcubes_visible = false;
  let marchingcubes_must_updated = true;
  let marchingcubes_mesh = null;
  function generate_marchingcubes_geometry() {
    // TODO: при удалении или добавлении новый кубиков в режиме
    //       показа маршингкубов, можно вычислять те вертексы из маршингкуба,
    //       которые удаляются или добавляются (локализовать их),
    //       и изменять только эти места в геометрии. (хотя мы все равно
    //       изменяем всю геомкетрию, так что х.з.)
    const march_geometry = new THREE.Geometry();
    for (let z = 0; z < map_size+2; ++z)
      for (let y = 0; y < map_size+2; ++y)
        for (let x = 0; x < map_size+2; ++x)
    {
      const f = (x, y, z) => {
        const i = I(map_size-x, map_size-y, map_size-z);
        return i < 0 ? false : (map_voxels[i] != null);
      }
      const coords = MarchingCubes(f, x-1, y-1, z-1, false);
      for (let i = 0; i < coords.length; i += 3) {
        march_geometry.vertices.push(new THREE.Vector3(coords[0+i], coords[1+i], coords[2+i]));
      }
    }
    for (let i = 0; i < march_geometry.vertices.length; i += 3) {
      march_geometry.faces.push(new THREE.Face3(0+i, 1+i, 2+i));
    }
    march_geometry.computeVertexNormals();
    const march_pos = (map_size / 2 + 0.5 + ((map_size + 1) % 2) * 0.5);
    const march_mesh = new THREE.Mesh(march_geometry, materials.lambert_white);
    march_mesh.position.x = -march_pos;
    march_mesh.position.y = -march_pos;
    march_mesh.position.z = -march_pos;
    scene.add(march_mesh);
    return march_mesh;
  }
  function show_marchingcubes() {
    set_cubes_visibility(false);
    marchingcubes_visible = true;
    if (marchingcubes_must_updated) {
      if (marchingcubes_mesh != null) scene.remove(marchingcubes_mesh);
      marchingcubes_mesh = generate_marchingcubes_geometry();
      scene.add(marchingcubes_mesh);
      marchingcubes_must_updated = false;
    }
    marchingcubes_mesh.visible = true;
  }
  function hide_marchingcubes() {
    set_cubes_visibility(true);
    marchingcubes_visible = false;
    if (marchingcubes_mesh) marchingcubes_mesh.visible = false;
  }

  ////////////////////////////////////////////////////////////////////////
  // controls-container
  ////////////////////////////////////////////////////////////////////////

  // Loads from localStorage
  {
    const params = window.localStorage.getItem('VOXEL__controlbuttons');
    if (params) {
      const p = JSON.parse(params);
      marchingcubes_visible = p.marchingcubes_visible;
      lined_cubes_visisble = p.lined_cubes_visisble;
      if (lined_cubes_visisble) show_lined_cubes(); else hide_lined_cubes();;
      if (marchingcubes_visible) show_marchingcubes(); else hide_marchingcubes();
    }
  }
  // Saves to localStorage
  function save_control_buttons_state() {
    window.localStorage.setItem('VOXEL__controlbuttons', JSON.stringify({
      marchingcubes_visible, lined_cubes_visisble
    }));
  }

  $('body').append(

    $.div('controls-container').append(
      // shows/hides lined cubes
      $.div('button button-lines').html(lined_cubes_visisble ? 'hide lines' : 'show lines').on('click', function () {
        if (lined_cubes_visisble) {
          $(this).html('show lines');
          hide_lined_cubes();
        } else {
          $(this).html('hide lines');
          show_lined_cubes();
        }
        save_control_buttons_state();
      }),
      // shows/hides marchingcubes
      $.div('button button-march').html(marchingcubes_visible ? 'unmarch' : 'march').on('click', function () {
        if (marchingcubes_visible) {
          $(this).html('march');
          hide_marchingcubes();
        } else {
          $(this).html('unmarch');
          show_marchingcubes();
        }
        save_control_buttons_state();
      }),
      // perspective/orthographic
      $.div('button button-ortho').html('ortho').on('click', function () {
        // TODO:
      }),
    )

  );

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  let current_cursor = null;
  function update_cursor() {
    if (lined_cubes_visisble) return;
    if (current_cursor) {
      current_cursor.visible = false;
      current_cursor = null;
    }
    raycaster.setFromCamera(mouse, camera);
    const intersects = intersect(map_models, map_voxels);
    if (intersects.length < 1)  return;
    current_cursor = intersects[0].object.__lined_cube;
    current_cursor.visible = true;
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  // Mouse moving.
  renderer.domElement.addEventListener('mousemove', (event) => {
      // Sets mouse.
    mouse.x = +(event.clientX / W * 2 - 1);
    mouse.y = -(event.clientY / H * 2 - 1);
  });

  // Listens mouse button releasing.
  renderer.domElement.addEventListener('mouseup', (event) => {
    controls.enabled = true;
  });

  // Прослушка нажатия кнопки мыши.
  renderer.domElement.addEventListener('mousedown', (event) => {
    event.preventDefault(); // Does remove context menu on right click.

    // Sets mouse and casts a ray.
    mouse.x = +(event.clientX / W * 2 - 1);
    mouse.y = -(event.clientY / H * 2 - 1);
    raycaster.setFromCamera(mouse, camera);
    const intersects = intersect(map_models, map_voxels);
    if (intersects.length < 1)  return;

    // User pressed on model, so we disable controls while any mouse button will be released.
    controls.enabled = false;

    // Left button was pressed.
    if (event.button === 0) {
      const n = intersects[0].face.normal;
      const p = intersects[0].object.position;
      const x = p.x + n.x; // new cube scene position
      const y = p.y + n.y;
      const z = p.z + n.z;
      const i = I(...scene_to_map(x, y, z));
      // is cube can be placed here?
      if (i >= 0 && map_voxels[i] == null) {
        // Visible models number increases.
        ++visible_models_num;
        // Setting voxel.
        map_voxels[i] = 1;
        // Setting model.
        if (map_models[i] == null) {
          // Creating new model.
          const cube = cube_mesh();
          cube.position.x = x;
          cube.position.y = y;
          cube.position.z = z;
          scene.add(cube);
          map_models[i] = cube;
          cube.__map_index = i;
        } else {
          // Adding existing model to the scene.
          // TODO: Замени удаление и добавление на сцену кубов
          //       на изменение параметра visible с чеком интерсекшенов
          //       и котролем количетсва непоказывающихся хуень.
          scene.add(map_models[i]);
        }
        // Creates (do visible) lined cube too.
        add_lined_cube(map_models[i]);
      }
      // If marchingcubes visible we redraw it.
      marchingcubes_must_updated = true;
      if (marchingcubes_visible) {
        show_marchingcubes();
      }
    }
    // Right button was pressed.
    else if (event.button === 2) {
      if (visible_models_num > 1) { // If at least one model is visible.
        // Removes model.
        --visible_models_num;
        const cube = intersects[0].object;
        const i = cube.__map_index;
        scene.remove(cube);
        map_voxels[i] = null;
        remove_lined_cube(cube);
      }
      // If marchingcubes visible we redraw it.
      marchingcubes_must_updated = true;
      if (marchingcubes_visible) {
        show_marchingcubes();
      }
    }
  });

  // Setting up drawing cicle.
  renderer.setAnimationLoop(() => {
    stats.update();
    renderer.render(scene, camera);
  });

  // Coroutine (runs every 0.2 secs).
  setInterval(_ => {

    update_cursor();
    // Saves items into localStorage.
    save_controls();
    save_map();
  }, 200);
}
