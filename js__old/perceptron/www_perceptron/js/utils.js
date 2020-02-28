
function Canvas({ width, height, parent, fill_with }) {
  if (undefined === width) width = 400;
  if (undefined === height) height = 300;
  if (undefined === parent) parent = document.body;
  if (undefined === fill_with) fill_with = 'transparent';
  
  const cvs = Object.assign(document.createElement('canvas'), { width, height });
  parent.appendChild(cvs);
  
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = fill_with;
  ctx.fillRect(0, 0, width, height);

  return ctx;
}


function Output({ width, height, label_text }) {
  const parent = document.body;
  
  const wrapper = document.createElement('div');
  parent.appendChild(wrapper);
  
  const ctx = new Canvas({ width, height, fill_with: 'lightgrey', parent: wrapper });

  const label = document.createElement('div');
  label.innerHTML = String(label_text) + ':';
  wrapper.appendChild(label);

  const text = document.createElement('div');
  wrapper.appendChild(text);


  function print(t) {
    text.innerText += t + '\n';
  }

  function print_before(t) {
    text.innerText = t + '\n' + text.innerText;
  }

  function clear_text() {
    text.innerHTML = '';
  }

  this.print_before = print_before;
  this.clear_text = clear_text;
  this.print = print;
  this.ctx = ctx;
}