//
const DATA__vertex_shader =
`
  precision mediump float;

  struct DirectionalLight {
    vec3 direction;
    vec3 color;
  };

  attribute vec3 a_coord;
  attribute vec4 a_color;
  attribute vec3 a_normal;

  uniform mat4 u_view;
  uniform mat4 u_normal;
  uniform vec3 u_ambient_light;
  uniform DirectionalLight u_directional_light;

  varying vec4 v_color;
  varying vec3 v_light;

  void main(void) {
    v_color = a_color;

    vec4 transformed_normal = u_normal * vec4(a_normal, 1.0);
    float directional_light = max(dot(transformed_normal.xyz, u_directional_light.direction), 0.0);
    v_light = u_ambient_light + (u_directional_light.color * directional_light);

    gl_Position = u_view * vec4(a_coord, 1.0);
    gl_PointSize = 3.0;
  }
`;

const DATA__vertex_shader_with_instancing =
`
  precision mediump float;

  struct DirectionalLight {
    vec3 direction;
    vec3 color;
  };

  attribute vec3 a_coord;
  attribute vec4 a_color;
  attribute vec3 a_normal;

  uniform mat4 u_view;
  uniform mat4 u_normal;
  uniform vec3 u_ambient_light;
  uniform DirectionalLight u_directional_light;

  // array with instances offsets
  uniform vec3 u_offsets [100];

  varying vec4 v_color;
  varying vec3 v_light;

  void main(void) {
    v_color = a_color;

    vec4 transformed_normal = u_normal * vec4(a_normal, 1.0);
    float directional_light = max(dot(transformed_normal.xyz, u_directional_light.direction), 0.0);
    v_light = u_ambient_light + (u_directional_light.color * directional_light);

    // current instance offset
    vec3 offset = offsets[gl_InstanceID];

    gl_Position = u_view * vec4(a_coord + offset, 1.0);
  }
`;

const DATA__fragment_shader =
`
  precision mediump float;

  varying vec4 v_color;
  varying vec3 v_light;

  void main(void) {
    gl_FragColor = vec4(v_color.rgb * v_light, v_color.a);
  }
`;

const DATA__randomcolors = [
  [0.85, 0.02, 0.24, 1.0],
  [0.05, 0.03, 0.73, 1.0],
  [0.38, 0.35, 0.58, 1.0],
  [0.35, 0.01, 0.83, 1.0],
  [0.24, 0.29, 0.80, 1.0],
  [0.51, 0.01, 0.37, 1.0],
  [0.66, 0.06, 0.12, 1.0],
  [0.49, 0.07, 0.13, 1.0],
  [0.43, 0.05, 0.06, 1.0],
  [0.11, 0.95, 0.25, 1.0],
];