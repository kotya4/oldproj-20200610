console.log([...'堊ፔ㽺㒎玜癧ፌɱ⋺ᰒ欎厜玥㥮孓Ლ壨䲚䐁ԓ玽⦮ज़楍㡊潍ᇜ'].map(_=>[_,_,_].map((i,e)=>_.
charCodeAt()>>10-e*5&31).map(e=>e>25?'.\n ,'[e&3]:String.fromCharCode(e+97)).join([])).join([]));
/*
 * test
 */
window.onload = () => {
  const storage = Storage();
  //const default_program = '(t * 4) & ~round(PI - sin(sqrt(t)) * 20)';

  const default_program = 't >> 5';


  `
(
  t < 8000 * 4 * 6 ?
  (
    t % (t < 8000 * 4 * 2 ? 8000 : 4000) < 20 ?
    t % (t < 8000 * 4 * 2 ? 8000 : 4000) < 10 ? t << 4 : 255
    :
    (


      (
        t < 8000 * 4 * 2 ?
          t >> 5
        :

        t < 8000 * 4 * 4 ?
          t >> 4
        :
          t >> 2
      )

      &



      (
        t > 8000 * 4 * 2 ?
          t << 3
          :
          t << 1
      )

      +



      (
        t % (8000 * 4) < 8000 * 2 ?
          t % (8000 * 2) < 8000 ?
            t >> 1
          :
            t >> 3
        :
          t % (8000 * 4) < 8000 * 3 ?
            t >> 1
          :
            t << 1
      )
    )
  )

  :

  (
    0
  )
)


  `;

  const ta = document.getElementById('textarea-editable');
  const pw = document.getElementById('player-wrapper');
  const ge = document.getElementById('bn-generate');
  const er = document.getElementById('err-area');

  const spans = {
    duration: document.getElementById('duration'),
    t_offset: document.getElementById('t-offset'),
  }

  const inputs = {
    duration: document.getElementById('input-duration'),
    t_offset: document.getElementById('input-t-offset'),

    pixel_size: document.getElementById('input-pixel_size'),
    max_width: document.getElementById('input-max_width'),
    scaler: document.getElementById('input-scaler'),
  }

  inputs.duration.onchange = e => {
    spans.duration.textContent = inputs.duration.value = Math.abs(parseInt(inputs.duration.value)) || 4;
  }

  inputs.t_offset.onchange = e => {
    spans.t_offset.textContent = inputs.t_offset.value = Math.abs(parseInt(inputs.t_offset.value));
  }

  inputs.pixel_size.onchange = e => {
    inputs.pixel_size.value = Math.abs(parseInt(inputs.pixel_size.value)) || 1;
  }

  inputs.max_width.onchange = e => {
    inputs.max_width.value = Math.abs(parseInt(inputs.max_width.value)) || 1000;
  }

  inputs.scaler.onchange = e => {
    inputs.scaler.value = Math.abs(parseFloat(inputs.scaler.value)) || (1 / 32);
  }


  ta.textContent = storage.load('program') || default_program;


  const sound = document.createElement('audio');
  sound.style.width = '100%';
  sound.style.height = '25px';
  sound.controls = 'controls';
  sound.type = 'audio/wav';
  pw.appendChild(sound);


  const wrk__generate_wav = new Worker('www_wav/js/wrk__generate_wav.js');


  ge.addEventListener('click', _ => {
    er.textContent = 'syntax error :: no error';

    const seconds = ~~spans.duration.textContent;
    const t_offset = ~~spans.t_offset.textContent;

    create_sound({ seconds, t_offset });
  });

  function create_sound({ seconds, t_offset }) {
    ge.classList.add('disabled');

    const raw = Array(8000 * seconds);
    const expression = ta.textContent;

    wrk__generate_wav.postMessage({ raw, expression, t_offset });
    wrk__generate_wav.onmessage = e => {
      ge.classList.remove('disabled');

      const { raw, error } = e.data;

      if (error) {
        er.innerHTML = `<span class="err">syntax error :: ${error}</span>`;
        return;
      }

      const sample_rate = 8000;
      const channels = 1;
      const bits = 8;
      const wav = compile_wav(raw, { sample_rate, channels, bits });

      const pixel_size = Math.abs(parseInt(inputs.pixel_size.value)) || 1;
      const max_width = Math.abs(parseInt(inputs.max_width.value))  || 1000;
      const scaler = Math.abs(parseFloat(inputs.scaler.value)) || (1 / 32);
      const { screen, image } = visualize(wav.data, { pixel_size, max_width, scaler });

      sound.src = wav.base64;
      sound.addEventListener('timeupdate', e => {
        const progress = sound.currentTime / seconds;
        screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
        screen.drawImage(image.canvas, -progress * image.canvas.width, 0);
      });
    }
  }

  function visualize(data, { pixel_size, max_width, scaler }) {
    const screen = document.getElementById('canvas').getContext('2d');
    screen.canvas.width = pw.offsetWidth;
    // screen.canvas.height = 128;
    screen.imageSmoothingEnabled = false;

    const image = document.createElement('canvas').getContext('2d');
    image.canvas.width = max_width;
    image.canvas.height = screen.canvas.height;
    image.imageSmoothingEnabled = false;

    for (let i = 0; i < data.length; ++i) {
      const byte = data.charCodeAt(i);
      const color = ((byte > 128 ? 255 - byte : byte) + 70);
      image.fillStyle = `rgb(${color % 128}, ${color}, ${color * 2})`;
      const x = (i * scaler);
      const y = ((1 - byte / 256) * image.canvas.height);
      image.fillRect(~~x, ~~y, pixel_size, pixel_size);
    }

    screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);
    screen.drawImage(image.canvas, 0, 0);

    return {
      screen,
      image,
    }
  }

  function compile_wav(raw_data, { sample_rate, channels, bits }) {
    const itoba = (bytes, data) => // converts integer into byte array (string)
      String.fromCharCode(...[...Array(bytes)].map((_, i) =>
        (data >> 8 * i) & 255));

    const data = raw_data.map(e => itoba(1, e)).join(''); // pack data

    const chunk_1 = // format sub-chunk
      'fmt '          // sub-chunk identifier
      + itoba(4, 16)  // chunk length
      + itoba(2, 1)   // audio format (1 is linear quantization)
      + itoba(2, channels)
      + itoba(4, sample_rate)
      + itoba(4, sample_rate * channels * (bits >> 3))
      + itoba(2, channels * (bits >> 3))
      + itoba(2, bits);

    const chunk_2 = // data sub-chunk (contains the sound)
      'data'                                            // sub-chunk identifier
      + itoba(4, data.length * channels * (bits >> 3))  // chunk length
      + data;

    const header = // wav header
      'RIFF'
      + itoba(4, 4 + (8 + chunk_1.length) + (8 + chunk_2.length)) // length
      + 'WAVE';

    const raw = header + chunk_1 + chunk_2;
    const base64 = 'data:audio/wav;base64,' + btoa(raw);

    return {
      raw,
      data,
      base64,
    }
  }

  function create_hex_dump(data) {
    let out = '';
    for (let i = 0; i < data.length; i += 16) {
      let hex = '';
      let ascii = '';
      for (let x = 0; x < 16; x++) {
        const c = data.charCodeAt(i + x);
        const b = c.toString(16).toUpperCase();
        ascii += c > 126 || c < 32 ? '.' : data.charAt(i + x);
        hex += (b.length === 1 ? '0' + b : b) + ' ';
        if ((x + 1) % 8 === 0) hex += ' ';
      }
      out += hex + ascii + '\n';
    }
    return out;
  }
}
