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

const DATA__fragment_shader =
`
  precision mediump float;

  varying vec4 v_color;
  varying vec3 v_light;

  void main(void) {
    gl_FragColor = vec4(v_color.rgb * v_light, v_color.a);
  }
`;
