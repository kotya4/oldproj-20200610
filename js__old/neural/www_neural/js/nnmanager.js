
function NNManager() {
  // xor-function surface buffer
  const raw_data_w = 50;
  const raw_data_h = 50;
  const raw_data_buffer = new Array(raw_data_w * raw_data_h * 3);

  // creates linear neural network with 2 inputs, 1 hidden layer with 3 neurons and 1 output.
  // HACK: 2 neurons in hidden layer is not enouth, chance of successful learning: ~50%.
  const input_size = 2;
  const hidden_size = 3;
  const output_size = 1;
  const nk = NeuralKotya(input_size, [hidden_size], output_size);

  // prepared dataset for xor-function
  const dataset = [
    { inputs: [0, 0], targets: [0] },
    { inputs: [0, 1], targets: [1] },
    { inputs: [1, 0], targets: [1] },
    { inputs: [1, 1], targets: [0] }
  ];

  // -- methods --

  function learn(times) {
    for (let i = 0; i < times; ++i) {
      const d = dataset[Math.random() * 4 | 0];
      nk.backpropagation(d.inputs, d.targets);
    }
  }

  function fill_buffer_and_call(cb) {
    let i = 0;
    for (let x = 0; x < raw_data_w; ++x) for (let y = 0; y < raw_data_h; ++y) {
      const z = nk.feedforward([x / raw_data_w, y / raw_data_h])[0][0];
      raw_data_buffer[i++] = (x - raw_data_w / 2 + 0.5) / raw_data_w;
      raw_data_buffer[i++] = -0.5 + z;
      raw_data_buffer[i++] = (y - raw_data_h / 2 + 0.5) / raw_data_h;
      cb(x, y, z);
    }
  }

  function neural() {
    return nk;
  }

  function buffer_size() {
    return [raw_data_w, raw_data_h];
  }

  function buffer() {
    return raw_data_buffer;
  }

  function print_all_data() {
    const w = document.getElementsByClassName('data-container')[0];
    const d = nk.get_data();

    w.innerHTML = '';

    for (let k in d) {
      const t = document.createElement('div');
      t.className = 'table-wrapper';
      t.innerHTML += k;
      t.innerHTML += d[k].html_table(1000);
      w.appendChild(t);
    }

  }

  return {
    learn,
    neural,
    buffer,
    buffer_size,
    print_all_data,
    fill_buffer_and_call,
  }
}
