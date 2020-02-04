
window.onload = async function () {
  /*
  console.log('test');

  let flg = true;
  let val = 0;
  let inf = 0xff;

  function f() {
    val++;
    inf--;
    if (inf > 0 && flg) setTimeout(f, 0); else console.log('DONE');
  }

  f();

  setTimeout(() => {
    flg = false;
    console.log(val, inf);
  }, 2000);
  return;
  */


  //const bf = BF('', { output: (b, v) => { console.log(String.fromCharCode(...b)); } });



  /*
  console.log('--INTERPRETS:\n');
  //bf.interpret();

  console.log('--OUTPUT:\n');
  console.log(String.fromCharCode(...bf.output()));

  console.log('--ERROR:\n');
  console.log(bf.last_error());
  console.log(bf.last_error_message());
  */




  const code_lines = document.getElementsByClassName('line-number')[0];
  let current_lines_number = 1;


  const statusbar = {};
  ['status', 'autosave'].forEach(e => statusbar[e] =
    document.getElementsByClassName('status-bar')[0].getElementsByClassName(e)[0]);

  //statusbar.status.innerHTML = '---';//bf.last_error_message();


  const containers = {};
  ['memory', 'output', 'code'].forEach(e => containers[e] =
    document.getElementsByClassName(e)[0].getElementsByClassName('content')[0]);

  containers.code.focus();




  const autosaver = {
    timer: null,
    run_timer(time) {
      if (this.timer) clearTimeout(this.timer);
      statusbar.autosave.classList.remove('saved');
      statusbar.autosave.innerHTML = 'unsaved';
      this.timer = setTimeout(() => {
        statusbar.autosave.classList.add('saved');
        statusbar.autosave.innerHTML = 'saved';
        localStorage.setItem('code', containers.code.innerHTML);
      }, time);
    },
  };


  const line_number_refiller = {
    timer: null,
    refill() {
      code_lines.innerHTML = '';
      current_lines_number = 0;
      for (let i = 0; i < containers.code.innerHTML.length - 5; ++i)
        if (containers.code.innerHTML.slice(i, i + 5) === '<div>')
          code_lines.innerHTML += `<div>${++current_lines_number}</div>`;
      if (!current_lines_number)
        code_lines.innerHTML = `<div>${++current_lines_number}</div>`;
    },
    run_timer(time) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(this.refill, time);
    },
  };


  (function restore_code() {
    const saved_code = localStorage.getItem('code');
    if (saved_code) {
      containers.code.innerHTML = saved_code;
      line_number_refiller.refill();
    }
  })();



  containers.code.addEventListener('input', (e) => {
    console.log(e);

    if (e.inputType === 'deleteContentBackward'
    ||  e.inputType === 'deleteContentForward'
    ||  e.inputType === 'insertFromPaste'
    ||  e.inputType === 'historyUndo'
    ||  e.inputType === 'historyRedo'
    ||  e.inputType === 'deleteByCut')
    {
      line_number_refiller.run_timer(500);
    } else if (false) {

      // TODO: pizdec
      // если был выделен текст, как понять что он был выделен?
      // insertParagraph
      // insertText
      // нужно проверить, уменьшилось ли количество символов в тексте

    } else if (e.inputType === 'insertParagraph') {
      code_lines.innerHTML += `<div>${++current_lines_number}</div>`;
    }







    autosaver.run_timer(1000);

    if (e.inputType === 'insertParagraph') code_lines.innerHTML += `<div>${++current_lines_number}</div>`;
    else if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
      line_number_refiller.run_timer(500);
    }

  });



  // TODO: добавить fast play - быстрая интерпретация (нельзс остановить),
  //                slow play - наблюдаемая интерпретация (с setTimeout`ами),
  //                пока всё.

  const buttons = {};
  ['play', 'pause', 'skip', 'replay'].forEach(e => buttons[e] =
    document.getElementsByClassName('button-bar')[0].getElementsByClassName(`button-${e}`)[0]);


  // TODO: make it the singletone class maybe?
  const interpreter = {
    bf: BF('', { output: (b, v) => { console.log(String.fromCharCode(...b)); } }),
    max_iterations: 0xffffff,
    current_iterations: 0,
    terminated: false,
    paused: false,
    timer: null,

    // inner function, do not call outside of object
    _run(once = false) {
      if (this.paused) return;

      this.terminated = !this.bf.forward();

      // TODO: draw mem and output (with carets in code, mem)

      containers.memory.innerHTML = String(this.bf.memory());
      containers.output.innerHTML = String(this.bf.output());

      // exit with enabled ERRCODE 3
      if (this.current_iterations <= 0) {
        this.pause(false);

        // print errcode
        let errcode = this.bf.last_error();
        if (!errcode && this.bf.code_caret() !== this.bf.code.length) errcode = 3; // max iterations
        if (errcode) statusbar.status.classList.add('error');
        else statusbar.status.classList.remove('error');
        statusbar.status.innerHTML = this.bf.error_message(errcode);

        return;
      }

      // exit with disabled ERRCODE 3
      if (once || this.terminated) {
        this.pause(false);

        // print errcode
        const errcode = this.bf.last_error();
        if (errcode)  statusbar.status.classList.add('error');
        else statusbar.status.classList.remove('error');
        statusbar.status.innerHTML = this.bf.error_message(errcode);

        return;
      }

      // continue interpreting
      this.current_iterations--;
      timer = setTimeout(() => this._run(), 0);
      statusbar.status.innerHTML = 'running'; // TODO: add rowcol? but first make rowcol faster
    },


    // NOTE: do call once after object declaration (to make 'play()' working)
    flush(code) {
      statusbar.status.classList.remove('error');
      this.current_iterations = this.max_iterations;
      this.terminated = true;
      this.paused = false;
      if (code) this.bf.replace_code(code);
      this.bf.clear();
    },

    play() {
      this.paused = false;
      this._run();
    },

    skip() {
      this.paused = false;
      this._run(true);
    },

    pause(update_status = true) {
      this.paused = true;
      if (this.timer !== null) clearTimeout(this.timer);
      this.timer = null;
      if (update_status) statusbar.status.innerHTML = 'paused'; // TODO: add rowcol? but first make rowcol faster
    },

    replay(code) {
      this.flush(code);
      this.play();
    },




  };

  interpreter.flush(containers.code.innerText || containers.code.textContent);


  // TODO: make code uneditable when running
  //       make code partly uneditable when paused
  //       make code editable when stopped


  // TODO: create container for inputs


  // TODO: make editor stretched along height


  // TODO: make various types of output (and memory):
  //       graphical [mem/out]: each block is the xterm color
  //       textual [out]: print blocks as symbols
  //       numberic [mem/out]: each block as unsigned integer number [0; 256)


  // TODO: visualize carets for mem and code


  buttons.play.addEventListener('click', () => {
    buttons.play.classList.add('disabled');
    buttons.skip.classList.remove('disabled');
    buttons.pause.classList.remove('disabled');
    buttons.replay.classList.remove('disabled');
    console.log('play');

    interpreter.play();


  });

  buttons.pause.addEventListener('click', () => {
    buttons.play.classList.remove('disabled');
    buttons.skip.classList.remove('disabled');
    buttons.pause.classList.add('disabled');
    buttons.replay.classList.remove('disabled');
    console.log('pause');

    interpreter.pause();


  });

  buttons.skip.addEventListener('click', () => {
    buttons.play.classList.remove('disabled');
    buttons.skip.classList.remove('disabled');
    buttons.pause.classList.add('disabled');
    buttons.replay.classList.remove('disabled');
    console.log('skip');


    interpreter.skip();


  });

  buttons.replay.addEventListener('click', () => {
    buttons.play.classList.add('disabled');
    buttons.skip.classList.remove('disabled');
    buttons.pause.classList.remove('disabled');
    buttons.replay.classList.remove('disabled');
    console.log('replay');

    interpreter.replay(containers.code.innerText || containers.code.textContent);


  });


/*
  setInterval(() => {
    containers.memory.innerHTML += 'ah ';
    containers.output.innerHTML += 'ah ';
  }, 10);
  */

  /*
  containers.memory.innerHTML = [...Array(100)]
    .map(() => 'hello world '.split('').filter(() => Math.random() > 0.5).join('')).join('');


  containers.output.innerHTML = [...Array(1000)]
    .map(() => 'helloworld'.split('').filter(() => Math.random() > 0.5).join('')).join('');


  containers.code.innerHTML = [...Array(1000)]
    .map(() => 'hello world '.split('').filter(() => Math.random() > 0.5).join('')).join('');

  */


}
