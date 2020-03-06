
const GL = function(args) {

  const arg = Application.get_argument_parser('GL', args);
  const scene_params = arg('scene_params'); // scene params

  // default ambient for scene
  if (false === 'ambient' in scene_params) {
    scene_params.ambient = new GL.Ambient({
      ambient_color: [ 0.5, 0.5, 0.0 ],
      ambient_strength: 0.9,
      directional_color: [ 0.0, 0.5, 0.5 ],
      directional_vector: [ 0.8, 0.2, 0.1 ],
      directional_strength: 0.9,
    });
  }

  // initializes scene
  const scene = new GL.Scene(scene_params);

  // initializes camera
  const camera = new GL.Camera(scene.pmat, 0.01, 0.01, [12.4, -2, 18.5], 2.7);


  this.scene = scene;
  this.camera = camera;
}