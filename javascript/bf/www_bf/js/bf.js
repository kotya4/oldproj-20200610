function BF(code, opt) {
  // NOTE: do not clear code from commentaries, they helps
  //       generate debug information properly.

  const memory = [];
  const output_buffer = [];

  let errcode = 0;
  let mem_caret = 0;
  let code_caret = 0;
  let input_index = 0;

  let { input, output } = opt || {};

  // default input/output

  input = input || ((index) => { return null; });
  output = output || ((buffer, value) => { });

  // returns

  return {

    replace_code(code_) { code = code_; }, // SETTER

    memory_caret() { return mem_caret; }, // GETTER
    code_caret() { return code_caret; }, // GETTER
    last_error() {  return errcode; }, // GETTER
    output() { return output_buffer; }, // GETTER
    memory() { return memory; }, // GETTER
    code() { return code; }, // GETTER

    // converts 'index' into '[row, column]'
    rowcol() {
      // TODO: make faster
      // TODO: innerText adds 10's more than in code actiually is,
      //       or the code renders incorrectly, idk, do something with it.
      //       btw in main program i am using innerHTML and counting <div>'s.
      const sub = code.slice(0, code_caret);
      const row = (sub.match(/\n/g) || []).length;
      const col = code_caret - sub.lastIndexOf('\n');
      return [row, col];
    },

    error_message(errcode) {
      const hat = `BF:[${this.rowcol()}]:`;
      switch(errcode) {
        case 0: return `${hat} No error`;
        case 1: return `${hat} Out of memory`;
        case 2: return `${hat} Braces not balanced`;
        case 3: return `${hat} Program was suddenly terminated (maximum iterations reached?)`;
        case 4: return `${hat} Input returns NULL`;
      }
      return `${hat} Unknown error (wtf?)`;
    },

    // for tests ?
    interpret(iter_num = 0xffffffff) {
      this.clear();
      for ( ; iter_num-- && this.forward(); );
      if (!errcode && code_caret !== code.length) errcode = 3;
      return errcode;
    },

    // flushes interpreter
    clear() {
      errcode = 0;
      mem_caret = 0;
      code_caret = 0;
      input_index = 0;
      memory.length = 0;
      output_buffer.length = 0;
    },

    // interprets next commnad
    forward() {
      if (code_caret >= code.length) return false;

      // skiping commentaries

      // NOTE: skipping commentaries in 'forward' and 'backward' is nessesary
      //       because you want to iterate over the commands, not the raw code,
      //       but also you want keep in 'code_caret' raw code caret to
      //       easily convert it into rows and columns (f.e. to throw an error).

      const i = code.slice(code_caret).search(/[\.\,\[\]><+-]/);
      if (i < 0) {
        code_caret = code.length;
        return false;
      }
      code_caret += i;

      // interpreting

      const command = code[code_caret];
      /**/ if ('+' === command) memory[mem_caret] = (~~memory[mem_caret] + 1) % 256;
      else if ('-' === command) memory[mem_caret] = memory[mem_caret] ? memory[mem_caret] - 1 : 255;
      else if ('>' === command) ++mem_caret;
      else if ('<' === command && --mem_caret < 0) { errcode = 1; return false; }
      else if (',' === command) {
        memory[mem_caret] = input(input_index++);
        if (memory[mem_caret] === null) { errcode = 4; return false; }
      }
      else if ('.' === command) {
        output_buffer.push(memory[mem_caret]);
        output(output_buffer, memory[mem_caret]);
      }
      else if (']' === command) {
        let depth = 0;
        let errflg = true;
        const index = code_caret;
        for (--code_caret; code_caret >= 0; --code_caret) {
          if (']' === code[code_caret]) ++depth;
          if ('[' === code[code_caret]) {
            if (depth-- === 0) {
              --code_caret;
              errflg = false;
              break;
        } } }
        if (errflg) { code_caret = index; errcode = 2; return false; }
      }
      else if ('[' === command && !memory[mem_caret]) {
        let depth = 0;
        let errflg = true;
        const index = code_caret;
        for (++code_caret; code_caret < code.length; ++code_caret) {
          if ('[' === code[code_caret]) ++depth;
          if (']' === code[code_caret]) {
            if (depth-- === 0) {
              errflg = false;
              break;
        } } }
        if (errflg) { code_caret = index; errcode = 2; return false; }
      }

      // not eof ?
      return ++code_caret < code.length;
    },
  }
}
