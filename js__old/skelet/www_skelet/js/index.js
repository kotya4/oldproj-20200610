//
window.onload = function() {

  function onmousedown(e) {
    e.preventDefault();
    const { button, clientX, clientY } = e;
    pressed_button = button;
    dump_cursor_position(clientX, clientY);
    //===================================//
    if (button === 0 && draw_bone_mode) create_new_bone();
  }


  function onmousemove(e) {
    e.preventDefault();
    const { clientX, clientY } = e;
    dump_cursor_position(clientX, clientY);
    //===================================//
    draw_bone_helper();
  }


  function onmouseup(e) {
    e.preventDefault();
    const { button, clientX, clientY } = e;
    pressed_button = null;
    dump_cursor_position(clientX, clientY);
    //===================================//
    apply_bone();
  }


  function onkeydown(e) {
    const { code, shiftKey, ctrlKey, altKey, repeat } = e;
    if (!(shiftKey && ctrlKey && code === 'KeyR')) e.preventDefault(); // HACK: for debug
    //==================================//
    if (ctrlKey && code === 'KeyS') { // save

    }

    console.log(code);

    if (code === 'Backspace' || code === 'Delete') delete_focused_bones();

    draw_bone_mode = ctrlKey && (code === 'ControlLeft' || code === 'ControlRight');
    adding_focused_bones = shiftKey;
  }


  function onkeyup(e) {
    const { code, shiftKey, ctrlKey, altKey, repeat } = e;
    e.preventDefault();
    //==================================//
    draw_bone_mode = false;
    adding_focused_bones = false;
  }


  window.addEventListener('keydown', onkeydown);
  window.addEventListener('keyup', onkeyup);
  window.addEventListener('mousedown', onmousedown);
  window.addEventListener('mousemove', onmousemove);
  window.addEventListener('mouseup', onmouseup);
  window.addEventListener('resize', onresize);
  window.addEventListener('contextmenu', e => e.preventDefault());


  create_canvas();
  onresize();
}
