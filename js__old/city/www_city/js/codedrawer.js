//
function CodeDrawer(number, time = 0, inc = 1) {
  if (typeof CodeDrawer.code === 'string') {
    for(let i in this) {
      if(!/webkitStorageInfo|webkitIndexedDB/.test(i)
      && (typeof this[i]).toString() === 'function'
      && this[i].toString().indexOf('native') === -1)
      {
        CodeDrawer.code += String(this[i]) + '\n\n\n';
      }
    }
    CodeDrawer.code = CodeDrawer.code.split('\n');
    console.log('%c CodeDrawer initialized', 'background: black; color: white;');
  }

  if (++CodeDrawer.timer > time) {
    CodeDrawer.timer = 0;
    CodeDrawer.index = (CodeDrawer.index + inc) % CodeDrawer.code.length;
  }

  return CodeDrawer.code.slice(CodeDrawer.index, CodeDrawer.index + number);
}

CodeDrawer.code = '';
CodeDrawer.index = 0;
CodeDrawer.timer = 0;
