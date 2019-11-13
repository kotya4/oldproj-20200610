
function create_canvas() {
  ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.className = 'master_canvas';
  document.body.appendChild(ctx.canvas);
}


function onresize() {
  client_rect = document.body.getBoundingClientRect();
  ctx.canvas.height = client_rect.height;
  ctx.canvas.width = client_rect.width;
}


function color_focused_bones() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  bones.forEach(element => element.style.background = 'lightblue');
  focused_bones.forEach(element => {
    element.style.background = 'green';
    const x = parseInt(element.style.left);
    const y = parseInt(element.style.top);
    const radius = 20;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
}


function set_focus_to_bone(element) {
  const current_element_index = focused_bones.findIndex(e => e === element);
  if (current_element_index >= 0) {
    focused_bones[current_element_index] = null;
    focused_bones = focused_bones.filter(e => e !== null);
  } else {
    if (!adding_focused_bones) {
      focused_bones.length = 0;
    }
    focused_bones.push(element);
  }
  color_focused_bones();
}


function delete_focused_bones() {
  focused_bones.forEach(element => {
    element.remove();
    const index = bones.findIndex(e => element);
    if (index >= 0) bones[index] = null;
  });
  bones = bones.filter(e => e !== null);
  focused_bones = [];
  color_focused_bones();
}


function get_current_bone_measures() {
  const dw = client_x - current_bone_x;
  const dh = client_y - current_bone_y;
  return {
    dw,
    dh,
    mag: Math.sqrt(dw ** 2 + dh ** 2) + current_bone_size / 2,
    angle: Math.atan2(dh, dw),
  };
}


function draw_bone_helper() {
  if (current_bone) {
    const [ x1, y1, x2, y2 ] = [ current_bone_x, current_bone_y, client_x, client_y ];
    const { dw, dh, mag, angle } = get_current_bone_measures();
    const dlen = mag / 3;
    const dnorm = 10;
    const dx = x1 + Math.cos(angle) * dlen;
    const dy = y1 + Math.sin(angle) * dlen;
    const dangle = Math.PI / 2;
    const dx1 = dx + Math.cos(angle + dangle) * dnorm;
    const dy1 = dy + Math.sin(angle + dangle) * dnorm;
    const dx2 = dx + Math.cos(angle - dangle) * dnorm;
    const dy2 = dy + Math.sin(angle - dangle) * dnorm;
    current_bone.style.transform = 'rotate(' + ~~(angle * 180 / Math.PI) + 'deg)';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(dx1, dy1);
    ctx.lineTo(x1, y1);
    ctx.lineTo(dx2, dy2);
    ctx.lineTo(dx1, dy1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(dx2, dy2);
    ctx.stroke();
  }
}


function apply_bone() {
  if (current_bone) {
    const { dw, dh, mag, angle } = get_current_bone_measures();
    current_bone.style.borderLeft = mag + 'px solid blue';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    set_focus_to_bone(current_bone);
    current_bone = null;
  }
}


function create_new_bone() {
  const element = document.createElement('div');
  element.className = 'bone';
  element.style.left = (client_x - current_bone_size / 2) + 'px';
  element.style.top = (client_y - current_bone_size / 2) + 'px';
  element.style.transformOrigin = (current_bone_size / 2) + 'px ' + (current_bone_size / 2) + 'px';
  element.id = 'bone_' + bones.length;
  document.body.appendChild(element);
  current_bone = element;
  current_bone_x = client_x;
  current_bone_y = client_y;
  bones.push(element);

  element.addEventListener('mousedown', e => {

    if (!draw_bone_mode) set_focus_to_bone(element);

  });
}


function dump_cursor_position(clientX, clientY) {
  delta_x = old_client_x - clientX;
  delta_y = old_client_y - clientY;
  old_client_x = clientX;
  old_client_y = clientY;
  client_x = clientX;
  client_y = clientY;
}
