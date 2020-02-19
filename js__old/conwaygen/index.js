//
// SEE LAST VERSION ON GLITCH: https://glitch.com/~shared-mangosteen-2oi677rnx4y
//
window.onload = function() {
  const SIZE = 100; // maximum capacity of data (used in different ways)
  const RULES_NUM = 10;

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = SIZE;
  ctx.canvas.width = SIZE;
  // ctx.canvas.style.width = '500px';
  ctx.canvas.style.imageRendering = 'pixelated';
  document.body.appendChild(ctx.canvas);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const info = document.createElement('div');
  info.className = 'info';
  const rulesdiv = document.createElement('div');
  rulesdiv.className = 'rulesdiv';
  document.body.appendChild(info);
  const gen = document.createElement('div');
  gen.className = 'gen';
  const textarea = document.createElement('div');
  textarea.className = 'textarea';
  textarea.contentEditable = 'true';
  const button = document.createElement('div');
  button.className = 'button b1';
  button.innerText = 'apply rule';
  const button2 = document.createElement('div');
  button2.className = 'button b2';
  button2.innerText = 'random';

  info.appendChild(button2);
  info.appendChild(rulesdiv);
  info.appendChild(gen);
  info.appendChild(textarea);
  info.appendChild(button);

  const alloc = (s) => Array(s).fill().map(_ => 0);
  const XY = (i,w) => [i/w|0, i%w];
  const I = (x,y,w) => x+y*w;

  const map = alloc(SIZE * SIZE);
  const dumpmap = alloc(map.length);
  const rules = alloc(RULES_NUM);
  const __pos__ = alloc(map.length).map((_,i) => XY(i, SIZE));
  const __index__ = alloc(SIZE).map((_,x) => alloc(SIZE).map((_,y) => I(x, y, SIZE)));

  const out_of_range = (x) => x<0||x>=SIZE;
  const point_type = (x,y) => {
    if (out_of_range(x) || out_of_range(y)) return 2;
    if (dumpmap[__index__[x][y]]) return 1;
    return 0;
  }

  function generate_rules(how_much_min, how_much_max, range_min, range_max, rules_min, rules_max) {
    if (how_much_min > how_much_max) throw Error('how_much_min more than how_much_max');
    if (range_min > range_max) throw Error('range_min more than range_max');
    if (rules_min > rules_max) throw Error('rules_min more than rules_max');
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // RULE SYNTAX: [do], if [how much] cell(s) in [range] is/are [what]                               //
    //                                                                                                 //
    // [do] may be 'die' or 'born' or 'reverse'.                                                       //
    // [what] may be 'alive' or 'dead' or 'out of map range'.                                          //
    // [range] may be POINT(x,y), BRESENHAM(p1,p2), RECT(p1,p2), CIRCLE(r).                            //
    //      Argument is a random number between [MIN,MAX], MIN,MAX = [-SIZE,+SIZE], always MIN <= MAX. //
    // [how much] may be: 'one', 'all', 'some', 'exactly N', 'from N to M', 'N or less', 'N or more'   //
    // TODO: number of executed rules                                                                  //
    //                                                                                                 //
    // Number of rules between [1, N].                                                                 //
    //                                                                                                 //
    // The criteria:                                                                                   //
    // number of steps until stablizing, number of stable steps, average alive cells (%) in stable.    //
    //                                                                                                 //
    //[do, howmuch, howmuchvalue, howmuchvaluemax, range, rangedx1, rangedx2, rangedy1, rangedy2, what]//
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    const rules_num = rules_min + Math.random() * (rules_max - rules_min) | 0;
    for (let i = 0; i < rules_num; ++i) {
      const _do_ = Math.random() * 3 | 0;
      // const _do_ = Math.random() * 2 | 0;
      const _how_much_ = Math.random() * 7 | 0;
      let _how_much_value_ = how_much_min + Math.random() * (how_much_max - how_much_min) | 0;
      let _how_much_value_max_ = how_much_min + Math.random() * (how_much_max - how_much_min) | 0;
      if (_how_much_value_max_ < _how_much_value_) [_how_much_value_max_, _how_much_value_] = [_how_much_value_, _how_much_value_max_];
      const _range_ = Math.random() * 4 | 0;
      const _range_dx1_ = range_min + Math.random() * (range_max - range_min) | 0;
      const _range_dx2_ = range_min + Math.random() * (range_max - range_min) | 0;
      const _range_dy1_ = range_min + Math.random() * (range_max - range_min) | 0;
      const _range_dy2_ = range_min + Math.random() * (range_max - range_min) | 0;
      const _what_ = Math.random() * 3 | 0;
      rules[i] = { _do_, _how_much_, _how_much_value_, _range_, _range_dx1_, _range_dx2_,
        _range_dy1_, _range_dy2_, _what_, _how_much_value_max_ };
    }
    rules[rules_num] = null;
  }



  function print_rules() {
    let s = '';
    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];

      if (rule === null) break; // end of rules

      const { _do_, _how_much_, _how_much_value_, _range_, _range_dx1_, _range_dx2_, _range_dy1_,
        _range_dy2_, _what_, _how_much_value_max_ } = rule;

      s += ('* ' + ['die', 'born', 'reverse'][_do_] + ', if '
        + ['one', 'all', 'some', `exactly ${_how_much_value_}`,
        `from ${_how_much_value_} to ${_how_much_value_max_}`, `${_how_much_value_} or less`,
        `${_how_much_value_} or more`][_how_much_] + ' cell(s) in ' + [`POINT(${_range_dx1_},${_range_dy1_})`,
        `BRESENHAM((${_range_dx1_},${_range_dy1_}),(${_range_dx1_},${_range_dy2_}))`,
         `RECT((${_range_dx1_},${_range_dy1_}),(${_range_dx1_},${_range_dy2_}))`,
         `CIRCLE(${_range_dx1_})`][_range_] + ' is/are ' + ['alive' , 'dead' , 'out of map range'][_what_]) + '\n';
    }
    return s;
  }


  function print_rules_raw() {
    let s = '';
    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];

      if (rule === null) break; // end of rules

      const { _do_, _how_much_, _how_much_value_, _range_, _range_dx1_, _range_dx2_, _range_dy1_,
        _range_dy2_, _what_, _how_much_value_max_ } = rule;

      s += (

        [_do_, _how_much_, _how_much_value_, _how_much_value_max_, _range_, _range_dx1_, _range_dx2_, _range_dy1_,
        _range_dy2_, _what_] //.map(e => (e >= 0 ? '+' : '') + String(e))

      ) + '\n';
    }
    return s;
  }


  function execute_rules_for_cell(index) {
    const cell = dumpmap[index];
    const [x,y] = __pos__[index];

    let points_to_die = 0;
    let points_to_burn = 0;
    let points_to_reverse = 0;

    for (let i = 0; i < rules.length; ++i) {
      const rule = rules[i];

      if (rule === null) break; // end of rules

      const { _do_, _how_much_, _how_much_value_, _range_, _range_dx1_, _range_dx2_, _range_dy1_,
        _range_dy2_, _what_, _how_much_value_max_ } = rule;

      // skip if nothing can be done with cell
      // _do_: 0 - die, 1 - born, 2 - reverse
      if (cell === 0 && _do_ === 0 || cell !== 0 && _do_ === 1) continue;

      let is_rule_executed = false;

      const x1 = x + _range_dx1_;
      const y1 = y + _range_dy1_;
      const x2 = x + _range_dx2_;
      const y2 = y + _range_dy2_;

      // .....counting.....

      let alive_count = 0;
      let dead_count = 0;
      let nor_count = 0;
      let all_count = 0;

      // inline
      function ___counting___(x,y) {
        switch (point_type(x,y)) {
        case 0: ++dead_count;  break;
        case 1: ++alive_count; break;
        case 2: ++nor_count;   break;
        }
        ++all_count;
      }

      if        (_range_ === 0) { // POINT
        ___counting___(x1,y1);
      } else if (_range_ === 1) { // BRESENHAM
        let xx = x1, yy = y1;
        const dx = Math.abs(x2 - xx);
        const dy = Math.abs(y2 - yy);
        const sx = xx < x2 ? +1 : -1;
        const sy = yy < y2 ? +1 : -1;
        let err = (dx > dy ? dx : -dy) >> 1;
        let e2;
        for (let i = dx + dy + 1; i--; ) {
          ___counting___(xx,yy);
          if (xx == x2 && yy == y2) break;
          e2 = err;
          if (e2 >= -dx) { err -= dy; xx += sx; }
          if (e2 <   dy) { err += dx; yy += sy; }
        }
      } else if (_range_ === 2) { // RECT
        const dxx = x2 - x1;
        const dyy = y2 - y1;
        const nxx = Math.abs(x2 - x1);
        const nyy = Math.abs(y2 - y1);
        let xx = x1;
        let yy = y1;
        for (let xi = 0; xi < nxx; ++xi) {
         for (let yi = 0; yi < nyy; ++yi) {
            ___counting___(xx,yy);
            yy += dyy;
          }
          xx += dxx;
        }
      } else if (_range_ === 3) { // CIRCLE (circle actualy)
        const R = Math.abs(_range_dx1_);
        for (let xi = -R; xi < +R; ++xi) {
          for (let yi = -R; yi < +R; ++yi) {
            if (xi * xi + yi * yi <= R * R) {
              ___counting___(x + xi, y + yi);
            }
          }
        }
      }

      // ........ruling.............

      // 'one', 'all', 'some', 'exactly N', 'from N to M', 'N or less', 'N or more'
      // [what] may be 'alive' or 'dead' or 'out of map range'.

      if (_how_much_ === 5) { // N or more
        if (_what_ === 0) if (alive_count >= _how_much_value_) is_rule_executed = true; // alive
        if (_what_ === 1) if (dead_count >= _how_much_value_) is_rule_executed = true; // dead
        if (_what_ === 2) if (nor_count >= _how_much_value_) is_rule_executed = true; // out of map range
      }
      if (_how_much_ === 4) { // N or less
        if (_what_ === 0) if (alive_count <= _how_much_value_) is_rule_executed = true; // alive
        if (_what_ === 1) if (dead_count <= _how_much_value_) is_rule_executed = true; // dead
        if (_what_ === 2) if (nor_count <= _how_much_value_) is_rule_executed = true; // out of map range
      }
      if (_how_much_ === 3) { // from N to M
        if (_what_ === 0) if (alive_count <= _how_much_value_max_ && _how_much_value_ <= alive_count) is_rule_executed = true; // alive
        if (_what_ === 1) if (dead_count <= _how_much_value_max_ && _how_much_value_ <= dead_count) is_rule_executed = true; // dead
        if (_what_ === 2) if (nor_count <= _how_much_value_max_ && _how_much_value_ <= nor_count) is_rule_executed = true; // out of map range
      }
      if (_how_much_ === 3) { // exactly N
        if (_what_ === 0) if (alive_count === _how_much_value_) is_rule_executed = true; // alive
        if (_what_ === 1) if (dead_count === _how_much_value_) is_rule_executed = true; // dead
        if (_what_ === 2) if (nor_count === _how_much_value_) is_rule_executed = true; // out of map range
      }
      if (_how_much_ === 2) { // some
        if (_what_ === 0) if (alive_count > 0) is_rule_executed = true; // alive
        if (_what_ === 1) if (dead_count > 0) is_rule_executed = true; // dead
        if (_what_ === 2) if (nor_count > 0) is_rule_executed = true; // out of map range
      }
      if (_how_much_ === 1) { // all
        if (_what_ === 0) if (alive_count === all_count) is_rule_executed = true; // alive
        if (_what_ === 1) if (dead_count === all_count) is_rule_executed = true; // dead
        if (_what_ === 2) if (nor_count === all_count) is_rule_executed = true; // out of map range
      }
      if (_how_much_ === 0) { // one
        if (_what_ === 0) if (alive_count === 1) is_rule_executed = true; // alive
        if (_what_ === 1) if (dead_count === 1) is_rule_executed = true; // dead
        if (_what_ === 2) if (nor_count === 1) is_rule_executed = true; // out of map range
      }

      if (is_rule_executed) {
        if (_do_ === 0) ++points_to_die;
        if (_do_ === 1) ++points_to_burn;
        if (_do_ === 2) ++points_to_reverse;
      }
    }

    // [do] may be 'die' or 'born' or 'reverse'.

    // nothing
    if (points_to_die === points_to_burn && points_to_die === points_to_reverse) {

    } else {
      // die
      if (points_to_die >= points_to_burn && points_to_die >= points_to_reverse) {
        map[index] = 0;
      }
      // burn
      if (points_to_burn >= points_to_die && points_to_burn >= points_to_reverse) {
        map[index] = 1;
      }
      // reverse
      if (points_to_reverse >= points_to_die && points_to_reverse >= points_to_burn) {
        map[index] = (map[index] + 1) % 2;
      }
    }
  }





  function dump() {
    for (let i in map) dumpmap[i] = map[i];
  }

  function init() {
    for (let i in map) map[i] = Math.random() * 2 | 0;
  }

  function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i in map) {
      ctx.fillStyle = xterm_hex_colors[map[i] % xterm_hex_colors.length];
      const [x, y] = XY(i, SIZE);
      ctx.fillRect(x, y, 1, 1);
    }
  }


  let timeout = null;
  let gen_counter = 0;
  function step() {
    dump();
    // dumpmap created, interpret the rules.
    ++gen_counter;
    gen.innerText = '\nGEN: ' + gen_counter + '\n\n';

    for (let i in map) execute_rules_for_cell(i);
    draw();

    timeout = setTimeout(step, 50);
  }


  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////

  const how_much_min = 0, how_much_max = 10, range_min = -10, range_max = 10, rules_min = 1, rules_max = 10;

  generate_rules(how_much_min, how_much_max, range_min, range_max, rules_min, rules_max);
  rulesdiv.innerText = 'RULES:\n' + print_rules() + '\nRAW:\n' + print_rules_raw();

  init();
  step();

  button.onclick = () => {
    const R = textarea.innerText;
    //textarea.innerText = '';
    const raw_rules = R.split('\n').map(e => e.split(',').map(e => parseInt(e)));
    // check for errors
    let nums = 0;
    for (let i in raw_rules) {
      if (raw_rules[i].length === 1) continue;
      if (raw_rules[i].length !== 10) {
        console.log(raw_rules[i]);
        throw Error('Cannot apply incorrect rule');
      }
      nums++;
      [_do_, _how_much_, _how_much_value_, _how_much_value_max_, _range_,
        _range_dx1_, _range_dx2_, _range_dy1_,
        _range_dy2_, _what_] = raw_rules[i];
      rules[i] = {_do_, _how_much_, _how_much_value_, _how_much_value_max_, _range_,
        _range_dx1_, _range_dx2_, _range_dy1_,
        _range_dy2_, _what_};
    }
    rules[nums] = null;
    gen_counter = 0;
    //clearTimeout(timeout);
    rulesdiv.innerText = 'RULES:\n' + print_rules() + '\nRAW:\n' + print_rules_raw();
    init();
    //step();
  }


  button2.onclick = () => {
    generate_rules(how_much_min, how_much_max, range_min, range_max, rules_min, rules_max);
    rulesdiv.innerText = 'RULES:\n' + print_rules() + '\nRAW:\n' + print_rules_raw();
    init();
  }
}
