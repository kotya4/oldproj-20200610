window.addEventListener('load', () => {

  const canvas = canvas_init(); // визуализация
  const canv_vis_x = canvas_init(); // визуализация вариантов

  let x = // примеры
  [
    [60.000,  77.333, 0.300, 20.000],
    [56.000,  97.733, 1.000,  4.000],
    [89.000,  72.533, 1.500,  7.000],
    [81.000,  65.333, 0.860, 16.000],
    [64.000,  30.533, 0.600, 19.000],
    [83.000,  41.333, 0.700, 18.000],
    [10.000, 107.333, 0.550, 17.000],
    [67.000,  96.533, 1.690, 11.000],
    [98.000,   5.333, 1.230,  3.000],
    [89.000,  79.733, 1.140, 14.000],
    [56.000,   8.933, 0.350,  5.000],
    [60.000,  73.733, 0.490, 14.000]
  ];
  const M = x[0].length; // количетсво входов (нейронов)
  const K = 4;           // количество выходов (кластеров)
  const N = M * K;       // кол-во вес. коэф.
  let V = 0.78;          // начальная скорость обучения (0.28)
  const dV = 0.90;       // множитель скорости обучения (0.90)
  const epoch_num = 20;   // количество эпох (2)
  const ve_speed = 400;  // скорость визуализации эпохи
  const vi_speed = 0;  // скорость визуализации итерации
  const w = initialize_weights(K, M); // случайные веса
  
  html_print_matrix(w, 's', 'w');
  html_print_text('случайные веса:');
  html_print_matrix(x, 'x', 'знч_');
  html_print_text('примеры:');

  x = normalize(x);                   // нормализованные значения примеров
  
  html_print_matrix(x, 'x', 'знч_');
  html_print_text('нормализованные значения примеров:');
  
  /*
   * ОБУЧЕНИЕ (ПО НАЖАТИЮ КЛАВИШИ)
   */
  const start = function() {
    window.removeEventListener('keypress', start);

    html_print_text('<br>^^^ ПЕРИОД ОБУЧЕНИЯ ^^^<br>');

    // "q" -- текущая эпоха
    slow_for(epoch_num, ve_speed, q => {
      const real_i = []; // индексы для случ. знач
      const rx = randomize_variants(x, real_i); // случайно-распределенные примеры
      
      html_print_text('ЭПОХА ' + q + ' (скорость обучения: ' + round(V) + ') >>><br>');

      // "rxi" -- индекс текущего случайно-распределенного примера
      return slow_for(rx.length, vi_speed, rxi => {
        const R = calculate_distances(rx[rxi], w);  // расстояния до центра класстеров
        const J = get_index_of_min(R);              // индекс нейрона-победителя
        w[J] = adjust_weights(w[J], rx[rxi], V);    // скорректированные веса нейрона-победителя

        html_print_array(rx[rxi], 'знч_');
        html_print_array(R, 'R');
        html_print_array(w[J], 'w ' + J + ':');
        html_print_text('случайный пример (x' + real_i[rxi] + ', порядковый:' + rxi + ') -->');

        // ------------ ВИЗУАЛИЗАЦИЯ КЛАСТЕРИЗАЦИИ --------------
        const { R_matrix, R_mins } = clusterize(w, x);
        canvas_visualize(R_mins, real_i[rxi], q);

      }).then(() => V *= dV); // уменьшение скорости обучения
    }).then(() => {
      /*
       * КЛАСТЕРИЗАЦИЯ
       * ПРИМЕР КЛАСТЕРИЗАЦИИ ПО БЛИЖАЙШЕМУ ЗНАЧЕНИЮ
       */
      const { R_matrix, R_mins } = clusterize(w, x);
      canvas_visualize(R_mins, '--', '--');

      html_print_text('^^^ ПЕРИОД КЛАСТЕРИЗАЦИИ ^^^<br>');
      html_print_matrix(R_matrix, 'w', 'x');
      html_print_objects_array(R_mins, 'x', true);
      html_print_text('x -- пример');
      html_print_text('C -- индекс кластера/нейрона (w)');
      html_print_text('R -- расстояние до центра');
      html_print_text('индексы нейронов после кластеризации вариантов -->');
      html_print_text('матрица расстояний [нейрон(w), пример(x)]:');
    });
  };

  window.addEventListener('keypress', start);

  /*
   * Ф-ЦИИ
   */

  // медленный цикл
  function slow_for(range, delay, callback) {
    if ('number' === typeof range)
      range = [...Array(range)].map((e,i) => i);
    else if (!range || 'function' !== typeof range[Symbol.iterator])
      throw Error('first argument has to be iterable or number');

    if ('function' !== typeof callback)
      throw Error('third argument has to be function');  

    return new Promise(res => {
      let i = 0;
      let clock = -1;
      function func() {
        if (i < range.length) {
          const cb = callback(range[i]);
          ++i;
          if (void 0 !== cb && 'then' in cb) {
            clearInterval(clock);
            cb.then(() => {
              clock = setInterval(func, delay);
            });
          }
          return;
        }  
        clearInterval(clock);
        res();
      }
      clock = setInterval(func, delay);
    });
  }

  // возвращает минимальное значение из массива "а"
  function min(a) {
    let v = a[0];
    for (let i = 1; i < a.length; ++i)
      if (v > a[i])
        v = a[i];
    return v;
  }

  // возвращает максимальное значение из массива "а"
  function max(a) {
    let v = a[0];
    for (let i = 1; i < a.length; ++i)
      if (v < a[i])
        v = a[i];
    return v;
  }

  // округляет до указанного количетсва знаков после запятой
  function round(v, n = 2) {
    const d = Math.pow(10, n);
    return (v * d | 0) / d;
  }

  // возвращает нормализованную матрицу "m"
  function normalize(m) {
    const x = [...Array(m.length)].map(e => [...Array(m[0].length)].map(e => 0));
    for (let i = 0; i < m[0].length; ++i) {
      let min_m = m[0][i];
      let max_m = m[0][i];  
      for (let k = 1; k < m.length; ++k) {
        if (min_m > m[k][i]) min_m = m[k][i];
        if (max_m < m[k][i]) max_m = m[k][i];
      }
      for (let k = 0; k < m.length; ++k) {
        x[k][i] = round( (m[k][i] - min_m) / (max_m - min_m) );
      }
    }
    return x;
  }

  // инициализирует веса для матрицы "w" (случайные значения)
  function initialize_weights(K, M) {
    const mpw = Math.pow(M, -0.5);
    const rou = Math.pow(10, 2);
    const min = (0.5 - mpw) * rou | 0;
    const max = (0.5 + mpw) * rou | 0;
    return [...Array(K)].map((_,j) => [...Array(M)].map((_,i) =>
      ( min + Math.random() * (max - min) | 0 ) / rou
    ));
  }

  // возвращает матрицу случайно-распределенных примеров
  function randomize_variants(x, real_i_ptr) {
    const vars = [...Array(x.length)].map((e,i) => i);
    const r = [];
    for (let savemefromreboot = 0xffff; --savemefromreboot && vars.length; ) {
      const i = vars.splice(Math.random() * vars.length | 0, 1);
      real_i_ptr.push(i);
      r.push( x[i] );
    }
    return r;
  }

  // рассчитывает расстояние до кластера
  function calculate_distance_to_cluster(x, w0) {
    let sum = 0;
      for (let i = 0; i < x.length; ++i)
        sum += x[i] - w0[i];
      return Math.sqrt( Math.pow(sum, 2) );
  }

  // рассчитывает расстояния до центра для всех класстеров
  function calculate_distances(x, w) {
    const R = [];
    for (let j = 0; j < w.length; ++j) {
      R.push( round(calculate_distance_to_cluster(x, w[j]), 3) );
    }
    return R;
  }

  // возвращает индекс наименьшего значения из массива
  function get_index_of_min(a) {
    let k = 0;
    let v = a[k];
    for (let i = 1; i < a.length; ++i)
      if (v > a[i])
        v = a[(k = i)];
    return k;
  }

  // корректирует вес нейрона
  function adjust_weights(w, x, V) {
    const W = [];
    for (let i = 0; i < x.length; ++i)
      W.push( round( w[i] + V * (x[i] - w[i]) ) );
    return W;
  }

  // кластеризация данных (возвращает матрицу всез расстояний и матрицу кластеров)
  function clusterize(w, x) {
    // матрица расстояний для каждого нейрона для каждого варианта
    const R_matrix = [...Array(w.length)].map(e => [...Array(x.length)].map(e => 0));
    // "k" -- индекс текущего нейрона
    for (let k = 0; k < w.length; ++k) {
      // "i" -- индекс текущего примера
      for (let i = 0; i < x.length; ++i) {
        const Rk = calculate_distance_to_cluster(x[i], w[k]); // расстояние до центра текущего кластера
        R_matrix[k][i] = (Rk * 100 | 0) / 100;
      }
    }

    // массив, содержащий минимальное расстояние и индекс примера
    // (индекс элемента массива является также индексом варианта)
    const R_mins = [];
    for (let i = 0; i < R_matrix[0].length; ++i) {
      let R_min = { // буффер, в конце нижеидущего цикла будет хранить:
        C: -1, // индекс кластера из массива w
        R: 0xffff // расстояние до центра (минимальное для текущего нейрона)
      };
      for (let k = 0; k < R_matrix.length; ++k) {
        // при равных расстояниях вносится первое вхождение
        if (R_min.R > R_matrix[k][i]) {
          R_min.R = R_matrix[k][i];
          R_min.C = k;
        }
      }
      R_mins.push(R_min);
    }

    return { R_matrix, R_mins };
  }

  /*
  * Ф-ЦИИ, ОБЕСПЕЧИВАЮЩИЕ ВЫВОД ДАННЫХ НА ЭКРАН
  */

  function html_print_matrix(m, col_name = '', row_name = '') {
    const tw = document.getElementById('text-wrapper');
    let o = '<table><tr><td></td>';  
    for (let x = 0; x < m[0].length; ++x) o += '<td>' + row_name + x + '</td>';
    o += '</tr>';
    m.forEach((e,y) => {
      o += '<tr><td>' + col_name + y + '</td>';
      e.forEach(e => o += '<td>' + e + '</td>');
      o += '</tr>';
    });
    o += '</table><br>';
    tw.innerHTML = o + tw.innerHTML;
  }

  function html_print_array(a, row_name = '', vertical = false) {
    const tw = document.getElementById('text-wrapper');
    let o = '<table><tr>';
    if (!vertical) {
      for (let x = 0; x < a.length; ++x) o += '<td>' + row_name + x + '</td>';
      o += '</tr><tr>';
      a.forEach(e => o += '<td>' + e + '</td>');
      o += '</tr></table><br>';
    } else {
      a.forEach((e,x) => o += '<tr><td>'+row_name + x +'</td>' + '<td>' + e + '</td></tr>');
    }
    tw.innerHTML = o + tw.innerHTML;
  }

  function html_print_objects_array(a, row_name = '', vertical = false) {
    function parse_obj(o) {
      let vals = '';
      for (let k in o) {
        vals += k + ':' + o[k] + ', ';
      }
      return vals.substr(0, vals.length - 2);
    }
    const tw = document.getElementById('text-wrapper');
    let o = '<table><tr>';
    if (!vertical) {
      for (let x = 0; x < a.length; ++x) o += '<td>' + row_name + x + '</td>';
      o += '</tr><tr>';
      a.forEach(e => o += '<td>' + parse_obj(e) + '</td>');
      o += '</tr></table><br>';
    } else {
      a.forEach((e,x) => o += '<tr><td>'+row_name + x +'</td>' + '<td>' + parse_obj(e) + '</td></tr>');
    }
    tw.innerHTML = o + tw.innerHTML;
  }

  function html_print_text(text = '') {
    const tw = document.getElementById('text-wrapper');
    const o = text + '<br>';
    tw.innerHTML = o + tw.innerHTML;
  }

  function canvas_init() {
    const cv = document.getElementById('canvas');
    const ctx = cv.getContext('2d');
    return { ctx, data: [] };
  }

  function canvas_store_data(c, w, q, rxi) {
    c.data.push({ w: w.map(e => e.slice()), q, rxi });
  }

  function canvas_draw_neurons(c) {
    const delay_before_restart = 0;
    const delay_for_each_iteration = 200;
    const ctx = c.ctx;
    let ww = 0;
    let id = 0;
    const dx = ctx.canvas.width / x.length | 0;
    const dy = ctx.canvas.height / x[0].length | 0;
    ctx.font = '12px Courier New, Courier, monospace';
    function draw(){
      for (let i = 0; i < x.length; ++i) {
        let ni = R_mins[i].C;
        let wi = c.data[ww].w[ni];
        for (let k = 0; k < x[0].length; ++k) {
          ctx.fillStyle = `rgba(${256*wi[0]},${256*wi[1]},${256*wi[2]},${1})`;
          ctx.fillRect(k * dy, i * dx, dy - 1, dx - 1);
        }
      }
      ctx.fillStyle = 'black';
      ctx.fillText('эпоха :'+c.data[ww].q,5,10);
      ctx.fillText('пример:'+c.data[ww].rxi,5,20);
      if (++ww >= c.data.length) {
        clearInterval(id);
        setTimeout(() => {
          ww = 0;
          id = setInterval(draw, delay_for_each_iteration);
        }, delay_before_restart);
      }
    }
    id = setInterval(draw, delay_for_each_iteration);
  }

  function canvas_visualize(mins, xind, epoch) {
    const ctx = canv_vis_x.ctx;
    const _w = ctx.canvas.width;
    const _h = ctx.canvas.height;
    const _wo = 150;
    const _ho = 50;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, _w, _h);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(_wo / 2, _ho / 2, _w - _wo, _h - _ho);
    ctx.font = '12px "Courier New", Courier, monospace';
    const rad = 1;
    const rmx = 16;

    function draw_ellipse(x, y, r, c = 'white', s = false) {
      s ? ctx.strokeStyle = c : ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 2, r * 2, 0, 0, Math.PI * 2);
      s ? ctx.stroke() : ctx.fill();
    }

    const colors = [
      'blue',
      'yellow',
      'black',
      'orange'
    ];

    for (let i = 0; i < x.length; ++i) {
      const _x = x[i][1] * (_w - _wo) + _wo / 2;
      const _y = x[i][2] * (_h - _ho) + _ho / 2;
      const _z = x[i][0] * 255;
      const _t = x[i][3] * 255;

      const c0 = colors[mins[i].C];
      const c1 = `rgb(255, ${_z}, ${_z})`;
      const c2 = `rgb(${_t}, 255, ${_t})`;
      
      draw_ellipse(_x, _y, rad + 0, c0, false);
      draw_ellipse(_x, _y, rad + 2, c1, true);
      draw_ellipse(_x, _y, rad + 4, c2, true);

      ctx.fillStyle = 'black';
      ctx.fillText(`x:${i},R:${mins[i].R},C:${mins[i].C}`, _x - 50, _y + rmx);
    }
    ctx.fillStyle = 'black';
    ctx.fillText('    эпоха: ' + epoch, 5, _w - 10);
    ctx.fillText('   пример: ' + xind, 5, _w - 20);
    ctx.fillText('ск. обуч.: ' + ((V * 100 | 0) / 100), 5, _w - 30);

    const yy = 400;
    const yo = 10;
    for (let i = 0; i < colors.length; ++i) {
      draw_ellipse(5, yy + yo * i, rad, colors[i], false);
      ctx.fillStyle = 'black';
      ctx.fillText('цвет кластера #' + i, 5 + rad * 4, yy + yo * i + rad);
    }
  }

});