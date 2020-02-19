function Keyboard() {
  const keys = {};
  let __listen = () => { };

  const keyboard = {
    is_pressed: false,
    pressed: key => keys[key],
    listen: func => __listen = func,
    trace: _ => Object.keys(keys).filter(key => keys[key]),
  };

  window.addEventListener('keydown', e => {
    keyboard.is_pressed = true;
    keys[e.code] = true;
    __listen(e);
  });

  window.addEventListener('keyup', e => {
    keyboard.is_pressed = false;
    keys[e.code] = false;
    __listen(e);
  });

  return keyboard;
}
