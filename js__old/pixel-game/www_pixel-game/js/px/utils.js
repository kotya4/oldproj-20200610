
if (typeof(px) === 'undefined') var px = {};

(function utils(parent) {
  // creates class arguments parser
  this.create_argument_parser = function(class_name, args = {}) {
    return function(key, def) {
      if (key in args) return args[key];
      else if (undefined !== def) return def;
      throw(`Argument of class '${class_name}' has no default value for key '${key}'.`);
    }
  }

  this.rand = function(a, b) {
    if (a === undefined)
      return Math.random();
    if (b === undefined)
      return Math.random() * a | 0;
    return a + Math.random() * (b - a) | 0;
  }

  // creates keyboard
  this.create_keyboard = function() {
    const kb_codes = [
      { codes: [68, 39], key: 'right' },
      { codes: [65, 37], key: 'left' },
      { codes: [87, 38], key: 'jump' },
      { codes: [69, 13], key: 'use' },
    ];
    const kb = { };

    function set(key_code, flg) {
      for (let k of kb_codes) {
        if (k.codes.find(c => c === key_code)) {
          kb[k.key] = flg;
          break;
        }
      }
    }
    
    window.addEventListener('keyup', e => set(e.keyCode, false), false);
    window.addEventListener('keydown', e => set(e.keyCode, true), false);

    return kb;
  }

  // creates pixelated canvas-style path (canvas's "stroke" too blury)
  this.path = {
    points: [],
    push: function(x, y) { this.points.push({ x, y }); },
    fill: function(ctx) {
      for (let i = 0; i < this.points.length - 1; ++i) {
        const c = this.points[i];
        const n = this.points[i + 1];
        const x = n.x - c.x;
        const y = n.y - c.y;
        const d = Math.sqrt(x * x + y * y);
        const a = Math.atan(y / (x === 0 ? 1e-3 : x)) + (x < 0 ? Math.PI : 0);
        const cosa = Math.cos(a);
        const sina = Math.sin(a);
        ctx.beginPath();
        for(let k = 0; k < d; ++k) {
          ctx.rect(c.x + cosa * k | 0, c.y + sina * k | 0, 1, 1);
        }
        ctx.fill();
      }
      this.points = [];
    },
  };

  // creates pixelated text
  this.text = {
    codes: [
      { min: 0x020, table: [ // specials
       //space!    "    #    $    %    &    '    (    )    *    +    ,    -    .    /    Ё
        '           1 1        1        11    1    11  11                                ',
        '       1   1 1  1 1  11111    1      1   1      1                             1 ',
        '       1       111111 1     1  11       1        1 1 1   1                    1 ',
        '       1        1 1  111   1  1   1     1        1  1   111       111        1  ',
        '       1       11111  1 1 1   1  11     1        1 1 1   1                   1  ',
        '                1 1 1111     1 111       1      1           1               1   ',
        '       1              1          1        11  11            1         1     1   ',
      ] },
      { min: 0x030, table: [ // digits
       //0    1    2    3    4    5    6    7    8    9    :    ;    <    =    >    ?    Ё
        '                                                                                ',
        ' 111   1  1111 11111  11 1111  111 11111 111  111              1       1    111 ',
        '1  11 11      1    1 1 1 1    1        11   11   1  1    1    1  11111  1  1   1',
        '1 1 1  1   111    1 1  1 1111 1111    1  111 11111           1           1     1',
        '11  1  1  1    1   111111    11   1  1  1   1    1  1    1    1  11111  1    11 ',
        ' 111  111 11111 111    1 1111  111  1    111  111        1     1       1        ',
        '                                                                             1  ',
      ] },
      { min: 0x040, table: [ // latin (with some specs)
       //@    A    B    C    D    E    F    G    H    I    J    K    L    M    N    O    Ё
        ' 111                                                                            ',
        '1   1 111 1111  111 1111 1111111111 111 1   1 111 1111 1   11    11 111   1 111 ',
        '1 1111   11   11   11   11    1    1    1   1  1    1  1  1 1    1 1 111  11   1',
        '1 1 1111111111 1    1   111111111111 11111111  1    1  111  1    1 1 11 1 11   1',
        '1 1111   11   11   11   11    1    1   11   1  1    1  1  1 1    1   11  111   1',
        '1    1   11111  111 1111 111111     111 1   1 111 11   1   1111111   11   1 111 ',
        ' 111                                                                            ',
      ] },
      { min: 0x050, table: [
       //P    Q    R    S    T    U    V    W    X    Y    Z    [    \    ]    ^    _    Ё
        '                                                       111         111  1       ',
        '1111  111 1111  1111111111   11   11   11   11   1111111     1       1 1 1      ',
        '1   11   11   11      1  1   11   11   11   11   1   1 1     1       11   1     ',
        '1111 1   11111  111   1  1   1 1 1 1 1 1 111  111   1  1      1      1          ',
        '1    1   11   1    1  1  1   1 1 1 1 1 11   1  1   1   1      1      1          ',
        '1     111 1   11111   1   111   1  11 111   1  1  111111       1     1          ',
        '         1                                             111     1   111     11111',
      ] },
      { min: 0x410, table: [ // cyrillic (w/o 'ё')
       //A    Б    В    Г    Д    Е    Ж    З    И    Й    К    Л    М    Н    О    П    Ё
        '                                               1                                ',
        ' 111 111111111 11111 111 111111 1 1 111 1   11   11   1  11111 111   1 111 11111',
        '1   11    1   11     1 1 1    1 1 11   11  111  111  1  1  11 1 11   11   11   1',
        '111111111 1111 1     1 1 11111 111   11 1 1 11 1 1111   1  11 1 1111111   11   1',
        '1   11   11   11     1 1 1    1 1 11   111  111  11  1  1  11   11   11   11   1',
        '1   1111111111 1    11111111111 1 1 111 1   11   11   11   11   11   1 111 1   1',
        '                    1   1                                                       ',
      ] },
      { min: 0x420, table: [
       //Р    С    Т    У    Ф    Х    Ц    Ч    Ш    Щ    Ъ    Ы    Ь    Э    Ю    Я    Ё
        '                                                                                ',
        '1111  111 111111   1 111 1   11  1 1   11   11   111   1   11     111 1 111 1111',
        '1   11   1  1  1   11 1 11   11  1 1   11 1 11 1 1 1   1   11    1   11 1 11   1',
        '1111 1      1   11111 1 1 111 1  1  11111 1 11 1 1 111 111 1111    111111 1 1111',
        '1    1   1  1      1 111 1   11  1     11 1 11 1 1 1  11 1 11  1 1   11 1 11   1',
        '1     111   1  1111   1  1   111111    11111111111 111 111 1111   111 1 1111   1',
        '                                  1              1                              ',
      ] },
    ],

    symbol_width: 5,
    symbol_height: 7,

    print: function(ctx, str, x, y) {
      const s = str.toUpperCase();
      const symbol_width = this.symbol_width;
      const symbol_height = this.symbol_height;
      let offset_x = 0;
      let offset_y = 0;
      
      ctx.beginPath();
      for (let i = 0; i < s.length; ++i) {
        const code = s.charCodeAt(i);
        let symbol_index = 0; // if characters unknown print 'space'
        let table = this.codes[0].table;

        if (code === 10 || code === 13) { // new line
          offset_y += symbol_height + 1;
          offset_x = 0;
          continue;
        }

        if (code === 9) { // tab
          offset_x += 2 * (symbol_width + 1);
          continue;
        }

        const found = this.codes.find(e => code >= e.min && code <= e.min + 0xf);
        
        if (found) {
          symbol_index = (code - found.min);
          table = found.table;
        }

        const symbol_offset = symbol_index * symbol_width;
        
        
        for (let _y = 0; _y < symbol_height; ++_y) {
          for (let _x = 0; _x < symbol_width; ++_x) {
            if (table[_y].charCodeAt(_x + symbol_offset) !== 32) {
              ctx.rect(x + _x + offset_x, y + _y + offset_y, 1, 1);
            }
          }
        }
        
        offset_x += symbol_width + 1;
      }
      ctx.fill();
    },

    test: function(ctx) {
      this.print(ctx, 
        ' !"#$%&\'()*+,-./0123456789:;<=>?\n' +
        '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n' +
        'AБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ', 5, 5);
    },
  };

  parent.utils = this;
})(px || {});