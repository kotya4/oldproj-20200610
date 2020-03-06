/*
 * Encodes/decodes rectangular integer matrix into/from UTF16 symbols (hieroglyphs)
 */
function MapEncoder16() {

  function encode(map) {
    let max = map[0][0];
    let min = map[0][0];
    map.forEach(e => e.forEach(e => e < min ? min = e : (e > max ? max = e : null)));
    const cap = (max - min).toString(2).length; // number of bits used for one digit
    const s = map.map(e => e.map(e => {
      const digit = (e - min).toString(2);
      if (digit.length < cap) return '0'.repeat(cap - digit.length) + digit;
      return digit;
    }).join('')).join('').match(/.{1,16}/g);
    if (s[s.length - 1].length < 16)
      s[s.length - 1] = s[s.length - 1] + '0'.repeat(16 - s[s.length - 1].length);
    return [
      s.map(e => String.fromCharCode(parseInt(e, 2))).join(''),
      cap,
      min,
      map[0].length,
    ];
  }

  function decode(raw, cap, min, width) {
    const s = [...Array(raw.length)].map((_, i) =>
      '0'.repeat(16 - raw.charCodeAt(i).toString(2).length) + raw.charCodeAt(i).toString(2)).join('');
    const map = [];
    let x = 0;
    let buf = [];
    for (let i = 0; i < s.length; i += cap) {
      buf.push(min + parseInt(s.slice(i, i + cap), 2));
      if (++x >= width) {
        x = 0;
        map.push(buf);
        buf = [];
      }
    }
    return map;
  }

  return {
    encode,
    decode
  }
}


MapEncoder16.test = function () {
  // creates some random matrix
  const map = [...Array(5)].map(() => [...Array(7)].map(() => ~~(Math.random() * 10 - 5)));

  // creates encoder instance
  const encoder = MapEncoder16();

  // encodes matrix
  const e = encoder.encode(map);

  // decodes matrix from returned data
  const d = encoder.decode(...e);

  // logs
  console.log('source', map);
  console.log('>>>', ...e);
  console.log('raw code               ', e[0]);
  console.log('number of bits used    ', e[1]);
  console.log('minimal value on source', e[2]);
  console.log('source row length      ', e[3]);
  console.log('decoded as', d);

  // output has to be 'true'
  console.log('full match', map.every((e, y) => e.every((e, x) => e === d[y][x])));
}
