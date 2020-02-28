let cli = null;
let pass = null;
let text = null;
let cmd = '';
let cli_buffer = '';
let cli_timer = null;
let answer = '';
const input_text = [];

function input_cli_clear() {
  if (cli_timer != null) {
    clearInterval(cli_timer);
    cli_timer = null;
  }
  cli.innerHTML = '$';
  cmd = '';
}

function input_cli(text) {
  input_cli_clear();
  cli_buffer = text;
  cli_timer = setInterval(() => {
    cmd += cli_buffer[cmd.length];
    cli.innerHTML = '$ ' + cmd;
    if (cmd.length === cli_buffer.length) {
      clearInterval(cli_timer);
      cli_timer = null;
      return;
    }
  }, 100);
}

function input_push(str) {
  input_cli_clear();
  if (str.length) input_text.push('> ' + str);
  else input_text.push('> ' + cli_buffer);
  cli_buffer = '';
  if (input_text.length === 24) input_text.shift();
  text.innerHTML = input_text.join('<br>');
}

let gen_passes_over = false;
async function gen_passes() {
  const specials = '!@#$%^&*_+:;[](){}';
  const max_rows_num = 18;
  const max_cols_num = 2;
  const text_size = 13;
  const len = 6;
  const words = WORDS.split(' ').filter(e => e.length === len);
  const used_words = [];
  let entry = Math.random() * 0xf000 | 0;
  let pass_text = '';
  let raw_text = '';
  let symbol_id = 0;
  [...Array(max_rows_num)].forEach(() => {
    [...Array(max_cols_num)].forEach(() => {
      let text_len = 0;
      pass_text += '0x' + entry.toString(16).toUpperCase() + ' ';
      raw_text += '0x' + entry.toString(16).toUpperCase() + ' ';
      let was_word = false;
      entry += 0x5;
      for ( ; text_len < text_size; ) {
        if (was_word || text_len + len > text_size || Math.random() < 0.75) {
          was_word = false;
          const i = Math.random() * specials.length | 0;
          pass_text += '<span class="word" id="SYMBOL_' + symbol_id
                    + '" onclick="word_onclick(`' + specials[i]
                    + '`, `SYMBOL_' + symbol_id
                    + '`)" onmouseover="word_onmousehover(`' + specials[i]
                    + '`)">' + specials[i]
                    + '</span>';
          raw_text += specials[i];
          ++symbol_id;
          ++text_len;
        } else {
          was_word = true;
          const i = Math.random() * words.length | 0;
          const span = document.createElement('span');
          span.id = words[i];
          span.className = 'word';
          span.innerHTML = words[i];
          let str = span.outerHTML;
          const si = str.indexOf('>');
          pass_text += '<span class="word" id="WORD_' + words[i]
                    + '" onclick="word_onclick(`' + words[i]
                    + '`, `WORD_' + words[i]
                    + '`)" onmouseover="word_onmousehover(`' + words[i]
                    + '`)">' + words[i]
                    + '</span>';
          raw_text += words[i];
          text_len += len;
          used_words.push(words[i]);
        }
        if (text_len === text_size) break;
      }
      pass_text += '&nbsp;&nbsp;';
      raw_text += '~';
    });
    pass_text += '<br>';
    raw_text += '\n';
  });

  answer = used_words[Math.random() * used_words.length | 0];

  let index = 0;
  const before = pass.innerHTML;
  return new Promise((res, rej) => {
    const timer = setInterval(() => {
      pass.innerHTML += raw_text[index++].replace(/\n/, '<br>').replace(/\~/, '&nbsp;&nbsp;');
      if (gen_passes_over || index === raw_text.length) {
        pass.innerHTML = before + pass_text;
        clearInterval(timer);
        res();
      }
    }, 5);
  });
}

let invitation_over = false;
async function invitation() {
  pass.innerHTML = '';
  const text = 'SLUCHAYNAYA KOTYA ~ TERMLINK 1.0 PROTOCOL\nENTER PASSWORD\n\n\n\n\n';
  let index = 0;
  return new Promise((res, rej) => {
    const timer = setInterval(() => {
      pass.innerHTML += text[index++].replace(/\n/g, '<br>').replace(/\~/g, '<span style="color: deeppink">&#8904;</span>');
      if (invitation_over || index === text.length) {
        pass.innerHTML = text.replace(/\n/g, '<br>').replace(/\~/g, '<span style="color: deeppink">&#8904;</span>');
        clearInterval(timer);
        res();
      }
    }, 50);
  });
}

function word_onclick(word, id) {
  input_push(word);
  const span = document.getElementById(id);
  span.onclick = '';
  span.onmouseover = '';
  span.innerHTML = '.'.repeat(word.length);
  span.classList.remove('word');

  let coincidences = 0;
  for (let i = 0; i < answer.length; ++i) {
    if (word[i] === answer[i]) {
      coincidences++;
    }
  }
  if (coincidences === answer.length) {
    input_push('Correct.');
  } else {
    input_push('Entry denied');
    input_push(coincidences + '/' + answer.length + ' correct.');
  }
}

function word_onmousehover(word) {
  input_cli(word);
}

window.onload = async () => {
  cli = document.getElementsByClassName('cli')[0];
  pass = document.getElementsByClassName('pass')[0];
  text = document.getElementsByClassName('text')[0];


  window.onclick = () => {
    if (!invitation_over) invitation_over = true; else gen_passes_over = true;

  }

  //await new Promise(r => setTimeout(r, 4000));
  await invitation();
  await gen_passes();

  setInterval(() => {
    if (!document.getElementsByClassName('cli-caret')[0]) {
      const caret = document.createElement('div');
      caret.className = 'cli-caret';
      cli.appendChild(caret);
    }
  }, 100);
}
