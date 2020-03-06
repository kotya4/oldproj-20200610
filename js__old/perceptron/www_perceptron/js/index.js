
window.addEventListener('load', () => {  
  
  const width = 300;
  const height = 300;

  const training_output = new Output({ width: 0, height: 0, label_text: 'training data' });
  const guessing_output = new Output({ width, height, label_text: 'guessing random data' });

  
  const f1 = new Fragment({ data: '1111100010001000', width: 4, height: 4, label: +1 });
  const f2 = new Fragment({ data: '0010010110011001', width: 4, height: 4, label: -1 });
  const perceptron = new Perceptron({ capacity: f1.data.length, learn_rate: 0.01 });

  let train_over = false;
  let i = 0;
  const clock = setInterval(() => {
    perceptron.train(f1.data, f1.label);
    perceptron.train(f2.data, f2.label);
    const guess1 = perceptron.guess(f1.data);
    const guess2 = perceptron.guess(f2.data);
    let text = '';
    text += ('>>> iteration: ' + (++i) + ', learning rate: ' + perceptron.get_learn_rate()) + '\n';
    text += ('weights:') + '\n';
    perceptron.weights.forEach(e => text += (e > 0 ? `+${e}` : e) + '\n');
    text += ('guess:') + '\n';
    text += ('f1: ' + guess1 + ' (' + (guess1 === f1.label) + ')') + '\n';
    text += ('f2: ' + guess2 + ' (' + (guess2 === f2.label) + ')') + '\n';
    training_output.print_before(text);
    if (guess1 === f1.label && guess2 === f2.label) {
      clearInterval(clock);
      training_output.print_before('!!! OVER !!!\n');
      train_over = true;
    }
  }, 500);

  (() => {
    let tries = 0;
    let success = 0;
    let tries_after = 0;
    let success_after = 0;
    setInterval(() => {
      const f = Math.random() * 2 | 0 ? f1 : f2;
      const guess = perceptron.guess(f.data);
      ++tries;
      success += (guess === f.label) | 0;
      if (train_over) {
        ++tries_after;
        success_after += (guess === f.label) | 0;
      }
      f.draw_on(guessing_output.ctx, guess);
      guessing_output.clear_text();
      guessing_output.print('guess: ' + guess + ' (' + (guess === f.label) + ')');
      guessing_output.print('rate: ' + (success / tries * 100 | 0) + '% (' + success + '/' + tries + ')');
      guessing_output.print('rate (after train): ' + (success_after / tries_after * 100 | 0) + '% (' + success_after + '/' + tries_after + ')');
    }, 300);
  })();
  

  /*
  training_output.ctx.canvas.width = width;
  training_output.ctx.canvas.height = height;
  const perceptron = new Perceptron({ capacity: 2 });
  training().then(guessing);
  */

  function training() {
    const points = [...Array(100)].map(e => new Point({ width, height }));

    return slow_for(points, 10, (p) => {
      perceptron.train([p.x, p.y], p.label);
      p.draw_on(training_output.ctx);
      training_output.clear_text();
      training_output.print('weights:');
      perceptron.weights.forEach(e => training_output.print(e));
    });
  }

  function guessing() {
    const points = [...Array(1000)].map(e => new Point({ width, height }));

    let tries = 0;
    let success = 0;

    return slow_for(points, 10, (p) => {
      const guess = perceptron.guess([p.x, p.y]);
      p.draw_on(guessing_output.ctx, guess);
      ++tries;
      success += (guess === p.label) | 0;
      guessing_output.clear_text();
      guessing_output.print('weights:');
      perceptron.weights.forEach(e => guessing_output.print(e));
      guessing_output.print('success rate: ' + (success / tries * 100 | 0) + '% (' + success + '/' + tries + ')');
    });
  }
    
  function slow_for(range, delay, callback) {
    if ('number' === typeof range)
      range = [...Array(range)].map((e,i) => i);
    else if (!range || 'function' !== typeof range[Symbol.iterator])
      throw Error('first argument has to be iterable or number');

    if ('function' !== typeof callback)
      throw Error('third argument has to be function');  

    return new Promise(res => {
      let i = 0;
      const clock = setInterval(() => {
        if (i < range.length) {
          callback(range[i]);
          ++i;
          return;
        }  
        clearInterval(clock);
        res();
      }, delay);
    });
  }

});


function Perceptron({ capacity, learn_rate }) {
  if (undefined === capacity) throw Error('argument "capacity" not passed');
  if (undefined === learn_rate) learn_rate = 0.1;


  const weights = [...Array(capacity)].map(e => Math.random() * 2 | 0 ? +1 : -1);


  function sign_of(value) {
    return value >= 0 ? +1 : -1;
  }

  function guess(inputs) {
    let sum = 0;
    for (let i = 0; i < capacity; ++i)
      sum += weights[i] * inputs[i];
    return sign_of(sum);
  }

  function train(inputs, answer, delta_rate = 1) {
    const delta = answer - guess(inputs); // values can be 0, +2, or -2
    for (let i = 0; i < capacity; ++i)
      weights[i] += delta * inputs[i] * learn_rate;
    learn_rate *= delta_rate;
  }

  function get_learn_rate() {
    return learn_rate;
  }


  this.guess = guess;
  this.train = train;
  this.get_learn_rate = get_learn_rate;
  this.weights = weights;
}


function Fragment({ data, width, height, label }) {
  if ('string' === typeof data)
    data = data.split('');
  else if (!data || 'function' !== typeof data[Symbol.iterator])
    throw Error('argument "data" must be iterable or string');

  if ('number' !== typeof width)
    throw Error('argument "width" must be number');    
  
  if ('number' !== typeof height)
    throw Error('argument "height" must be number');

  if ('number' !== typeof label)
    throw Error('argument "label" must be number');


  data = data.map(e => e == 1 ? +1 : -1);


  function draw_on(ctx, guess = label) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const w = ctx.canvas.width / width | 0;
    const h = ctx.canvas.height / height | 0;
    ctx.fillStyle = guess === label ? 'black' : 'red';
    for(let y = 0; y < height; ++y)
      for(let x = 0; x < width; ++x)
        if (data[x + y * width] > 0)
          ctx.fillRect(x * w + 1, y * h + 1, w - 2, h - 2);
  }


  this.draw_on = draw_on;
  this.label = label;
  this.data = data;
}