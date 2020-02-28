
GL.Ambient = function(args) {

  const arg = Application.get_argument_parser('GL.Ambient', args);
  
  const ambient_strength = arg('ambient_strength');
  const ambient_color = arg('ambient_color')
      .map(e=>e*ambient_strength);
  const directional_strength = arg('directional_strength');
  const directional_color = arg('directional_color')
      .map(e=>e*directional_strength);
  const directional_vector = arg('directional_vector');
  const directional_normal = vec3.create();
  vec3.normalize(directional_normal, directional_vector);

  this.ambient_color = ambient_color;
  this.directional_color = directional_color;
  this.directional_normal = directional_normal;
}