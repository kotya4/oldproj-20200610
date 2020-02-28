
// local storage
const local_storage = {
  data: JSON.parse(window.localStorage.data || null) || {},
  store: (o) => window.localStorage.data = JSON.stringify(Object.assign(local_storage.data, o)),
};


window.addEventListener('load', () => {
  init_highlight_textarea('textarea-editable', 'textarea-highlight');
  init_sound_gen();
});

/*
// creates hex dump
function create_hex_dump(data) {
  let out = '';
  for (var i = 0; i < data.length; i += 16) {
    let hex = '';
    let ascii = '';           
    for (var x = 0; x < 16; x++) {
      const c = data.charCodeAt(i + x);
      const b = c.toString(16).toUpperCase();
      ascii += c > 126 || c < 32 ? '.' : data.charAt(i + x);
      hex += (b.length === 1 ? '0' + b : b) + ' ';
      if ((x + 1) % 8 === 0)
        hex += ' ';
    }
    out += hex + ascii + '\n';
  }
  return out;
}
*/



// highlights textarea
function init_highlight_textarea(editable_id, highlight_id, delay) {
  const rules = [ // symbols to highlight (sort by num of elements, then by size of each str)
    { color: 'coral',   chars: ['map','rnd','max','min','sin','pwr', 'let', 'PI'] },
    //{ color: 'aqua', chars: '1234567890.xabcdef' },
    { color: 'aqua',    chars: '+-/*%`\'"{},' },
    { color: 'skyblue', chars: '><=&|~!' },
    { color: 'teal',    chars: '()' },
    { color: 'yellow',  chars: 't' },
  ];
  
  rules.forEach(e => { // escapes symbols and gens regexps
    let regexp_raw = '';
    e.shifted = [];
    for (let i = 0; i < e.chars.length; ++i) {
      // creates rules
      let si = 0;
      si = 0xf000 | (e.chars[i].length > 1 ? 0x0800 : 0); // (shift) | (non-char flag)
      for (let k = 0; k < e.chars[i].length; ++k)
        si += !(k % 2) ? ~e.chars[i].charCodeAt(k) : e.chars[i].charCodeAt(k);
      const r_found = rules.find(e => e.rule === si);
      if (undefined !== r_found)
        throw new Error(`rule for '${e.chars[i]}' conflicts with '${r_found.chars}'`);  
      if (si > 0xffff)
        throw new Error(`rule for '${e.chars[i]}' bigger than 2 bytes`);
      regexp_raw += `\\u${si.toString(16)}|`;
      e.shifted.push(String.fromCharCode(si));
      e.rule = si;
    }
    e.regexp = new RegExp('(' + regexp_raw.slice(0, -1) + ')+');
  });

  function highlight_text(text, inner) {    
    rules.forEach(e => {
      for (let i = 0; i < e.chars.length; ++i) {
        text = text.replace(new RegExp(e.chars[i].length > 1 
          ? `${e.chars[i]}` 
          : `[${e.chars[i]}]`, 'gm'), e.shifted[i])
    }});
    rules.forEach(e => { // adds spans
      let raw = text;
      let out = '';
      for (let __savemefromrebooting = 0xff; --__savemefromrebooting; ) {
        const match = e.regexp.exec(raw);
        if (!match)
          break;
        out += `${raw.substr(0, match.index)}<span highlight style="color:${e.color};">${match[0]}</span>`;
        raw = raw.substr(match.index + match[0].length);
      }
      text = out + raw;
    });
    rules.forEach(e => { // unescapes
      for (let i = 0; i < e.chars.length; ++i)
        text = text.replace(new RegExp(`[${e.shifted[i]}]`, 'gm'), e.chars[i]);
    });
    return text.replace(/\n/gm, '<br>');
  }

  const ed = document.getElementById(editable_id);
  const hi = document.getElementById(highlight_id);

  ed.innerHTML = (local_storage.data.program || 't << 2 & ~(PI - sin(pwr(t, 0.5)) * 10 << 1)').replace(/\n/gm, '<br>');
  
  function do_highlight() {
    local_storage.store({ program: ed.innerText });
    hi.innerHTML = highlight_text(ed.innerText);
  }
  ed.addEventListener('input', do_highlight);
  do_highlight();
}


// eats array of integers and pukes fresh base64 encoded wav
function gen_8bit_wav(raw) {
  // converts integer into byte-string
  function itoba(bytes_count, data) {
    return String.fromCharCode(
      ...[...Array(bytes_count)].map((e,i) => (data >> 8 * i) & 255));
  }
  // some constants
  const sample_rate = 8000;
  const channels = 1;
  const bits = 8;
  // converts raw data into packed byte-string
  const data = Array.from(raw).map(e => itoba(2, e)).join('');
  // format sub-chunk
  const chunk_1 =
    'fmt '       // sub-chunk identifier
  + itoba(4, 16) // chunk length
  + itoba(2, 1)  // audio format (1 is linear quantization)
  + itoba(2, channels)
  + itoba(4, sample_rate)
  + itoba(4, sample_rate * channels * bits / 8 | 0)
  + itoba(2, channels * bits / 8 | 0)
  + itoba(2, bits)
  ;
  // data sub-chunk (contains the sound)
  const chunk_2 =
    'data'                                          // sub-chunk identifier
  + itoba(4, data.length * channels * bits / 8 | 0) // chunk length
  + data
  ;
  // header
  const header =
    'RIFF'
  + itoba(4, 4 + (8 + chunk_1.length) + (8 + chunk_2.length)) // length
  + 'WAVE'
  ;
  const out = header + chunk_1 + chunk_2;
  return {
    base64: 'data:audio/wav;base64,' + escape(btoa(out)),
    raw: out,
    data: data,
  }
}


// generates sound
function init_sound_gen() {
  const ta = document.getElementById('textarea-editable');
  const pw = document.getElementById('player-wrapper');
  const ge = document.getElementById('bn-generate');
  const er = document.getElementById('err-area');

  let wav = null;
  let stretched = true;
  let scale_factor = 256;

  const sound = document.createElement('audio');
  sound.style.width = '100%';
  sound.controls = 'controls';
  sound.type = 'audio/wav';
  pw.appendChild(sound);

  ge.addEventListener('click', () => {
    gen_sound().then(visualize);
  });

  // additional functions using in textarea
  function rnd(x = 0xffff) { return Math.random() * x | 0; }
  function max(...a) { if (undefined === a) return 0; let m = a[0]; a.forEach(e => { if (m < e) m = e }); return m; }
  function min(...a) { if (undefined === a) return 0; let m = a[0]; a.forEach(e => { if (m > e) m = e }); return m; }
  function pwr(x = 0, y = 1) { return Math.pow(x, y); }
  function sin(x = 0) { return Math.sin(x); }
  const PI = Math.PI;

  async function gen_sound(seconds = 4) {
    const raw = new Array(4000 * seconds);
    try {
      for (let t = 0; t < raw.length; ++t)
        raw[t] = eval(ta.textContent);
      wav = gen_8bit_wav(raw);
      sound.src = wav.base64;
      er.innerHTML = '.. no errors in syntax yet';  
    } catch(e) {
      er.innerHTML = '<span class="err">.. syntax error -> '+e.message+'</span>';
      console.error(e);
    }
  }

  function visualize() {
    const cvs = document.getElementById('canvas');
    const ctx = cvs.getContext('2d');
    cvs.height = cvs.offsetHeight;
    cvs.width = pw.offsetWidth;
    const w = (stretched ? cvs.width : scale_factor) / wav.data.length;
    for (let i = 0; i < wav.data.length; ++i) {
      const d = wav.data.charCodeAt(i);
      const c = ((d > 128 ? 255 - d : d) + 70);
      ctx.fillStyle = `rgb(${c % 128}, ${c}, ${c << 1})`;
      ctx.fillRect(i * w | 0, (1 - d / 256) * cvs.height | 0, 1, 1);
    }
  }
}


console.log([...'堊ፔ㽺㒎玜癧ፌɱ⋺ᰒ欎厜玥㥮孓Ლ壨䲚䐁ԓ玽⦮ज़楍㡊潍ᇜ']
  .map(c => [...Array(3)].map((e,i) => 
    c.charCodeAt(0) >> 10 - i * 5 & 31)
    .map(e => e > 25 ? ' ,.\n'[e - 26] : 
      String.fromCharCode(e + 97)).join('')).join(''));