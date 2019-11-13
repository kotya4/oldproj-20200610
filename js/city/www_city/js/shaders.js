//
const DATA__vertex_shader =
`
  precision mediump float;

  attribute vec2 a_texuv;
  attribute vec3 a_coord;
  attribute vec4 a_color;
  attribute vec3 a_normal;


  uniform mat4 u_projectionview;
  uniform mat4 u_modelview;



  varying vec2 v_texuv;
  varying vec4 v_color;
  varying vec3 v_normal;
  varying vec3 v_modelview_position;


  void main(void) {
    v_texuv = a_texuv;
    v_color = a_color;
    v_normal = a_normal;
    v_modelview_position = vec3(u_modelview * vec4(a_coord, 1.0));

    gl_Position = u_projectionview * vec4(a_coord, 1.0);
  }

`;

const DATA__fragment_shader =
`
  precision mediump float;

  struct PointLight {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
  };
  #define POINTLIGHTS_NUM 5
  uniform PointLight u_pointlights [POINTLIGHTS_NUM];


  uniform sampler2D u_sampler;


  varying vec2 v_texuv;
  varying vec4 v_color;
  varying vec3 v_normal;
  varying vec3 v_modelview_position;

  uniform mat4 u_normal_matrix;
  uniform vec3 u_camera_position;


  vec3 calc_pointlight(PointLight, vec3, vec3, vec3);


  void main(void) {
    vec3 normal = normalize(vec3(u_normal_matrix * vec4(v_normal, 1.0)));
    vec3 camera_direction = normalize(u_camera_position - v_modelview_position);

    vec3 light = vec3(0.0);

    for (int i = 0; i < POINTLIGHTS_NUM; ++i) {
      light += calc_pointlight(u_pointlights[i], normal, v_modelview_position, camera_direction);
    }

    gl_FragColor = vec4(texture2D(u_sampler, v_texuv).rgb * light, 1.0);

  }


  vec3 calc_pointlight(PointLight light, vec3 normal, vec3 fragment_position, vec3 camera_direction) {
    // source: https://learnopengl.com/Lighting/Multiple-lights
    vec3 light_direction = normalize(light.position - fragment_position);
    // diffuse shading
    float diff = max(dot(normal, light_direction), 0.0);
    // specular shading
    vec3 reflect_direction = reflect(-light_direction, normal);
    float spec = pow(max(dot(camera_direction, reflect_direction), 0.0), 4.0); // material.shininess
    // spec = clamp(spec, 0.0, 1.0);

    if (dot(normal, light_direction) < 0.0) {
      spec = 0.0;
    }

    // attenuation
    float distance    = length(light.position - fragment_position);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));
    // combine results
    vec3 ambient  = light.ambient  *        vec3(1.0) * attenuation; // vec3(texture(material.diffuse, v_texuv))
    vec3 diffuse  = light.diffuse  * diff * vec3(1.0) * attenuation; // vec3(texture(material.diffuse, v_texuv))
    vec3 specular = light.specular * spec * vec3(1.0) * attenuation; // vec3(texture(material.specular, v_texuv))
    return (ambient + diffuse + specular);
  }


`;
