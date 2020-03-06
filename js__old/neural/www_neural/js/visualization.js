
function Visualization(w, h, wrapper_class) {
  const cvs = document.createElement('canvas');
  document.getElementsByClassName(wrapper_class)[0].appendChild(cvs);
  cvs.width = w;
  cvs.height = h;
  const ctx = cvs.getContext('2d');
  ctx.font = '12px "Courier New", Courier, monospace';

  // some values for 2d drawing

  const rw = 2;
  const rh = 2;
  const rx = 3;
  const ry = 3;
  const ox = 48;
  const oy = 7;
  const nnox = 10;
  const nnoy = 190;
  const radius = 15;
  const i_pos = [
    [0 + nnox + radius,  25 + nnoy + radius],
    [0 + nnox + radius,  90 + nnoy + radius]
  ];
  const h_pos = [
    [90 + nnox + radius,   5 + nnoy + radius],
    [90 + nnox + radius,  50 + nnoy + radius],
    [90 + nnox + radius, 100 + nnoy + radius]
  ];
  const o_pos = [
    [200 + nnox + radius, 50 + nnoy + radius]
  ];
  const bh_pos = [
    [0 + nnox + radius, 150 + nnoy + radius]
  ];
  const bo_pos = [
    [90 + nnox + radius, 150 + nnoy + radius]
  ];

  // -- private methods --

  const draw_lines = (aa, bb, d) => {
    for (let i = 0; i < aa.length; ++i) {
      for (let k = 0; k < bb.length; ++k) {
        const w = d.weignts_ih.array()[k][i];
        const r = w < 0 ? -w * 256 : 0;
        const b = w > 0 ? +w * 256 : 0;
        ctx.strokeStyle = `rgb(${r},100,${b})`;
        ctx.beginPath();
        ctx.moveTo(...aa[i]);
        ctx.lineTo(...bb[k]);
        ctx.stroke();
      }
    }
  }

  const valof = (v, i, j) => {
    if (!v) return '+0.0';
    let m = ~~(v.array()[i][j] * 10) / 10;
    let s = String(m);
    if (m >= 0.0) s = '+' + s;
    if (s.length < 3) s = s + '.0';
    else if (s.length < 4) s = s + '0';
    return s;
  }

  // -- public methods --

  function draw_nn(nk) {
    const d = nk.get_data();

    draw_lines(h_pos, i_pos, d);
    draw_lines(h_pos, o_pos, d);
    draw_lines(bh_pos, h_pos, d);
    draw_lines(bo_pos, o_pos, d);

    ctx.fillStyle = '#242';
    ctx.beginPath();
    ctx.arc(...i_pos[0], radius, 0, 2 * Math.PI, false);
    ctx.arc(...i_pos[1], radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#224';
    ctx.beginPath();
    ctx.arc(...h_pos[0], radius, 0, 2 * Math.PI, false);
    ctx.arc(...h_pos[1], radius, 0, 2 * Math.PI, false);
    ctx.arc(...h_pos[2], radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(...o_pos[0], radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(...bh_pos[0], radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(...bo_pos[0], radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.fillText(valof(d.inputs, 0, 0), i_pos[0][0] - 15, i_pos[0][1] + 4);
    ctx.fillText(valof(d.inputs, 1, 0), i_pos[1][0] - 15, i_pos[1][1] + 4);
    ctx.fillText(valof(d.hidden, 0, 0), h_pos[0][0] - 15, h_pos[0][1] + 4);
    ctx.fillText(valof(d.hidden, 1, 0), h_pos[1][0] - 15, h_pos[1][1] + 4);
    ctx.fillText(valof(d.hidden, 2, 0), h_pos[2][0] - 15, h_pos[2][1] + 4);
    ctx.fillText(valof(d.output, 0, 0), o_pos[0][0] - 15, o_pos[0][1] + 4);
    ctx.fillText('1', bh_pos[0][0] - 4, bh_pos[0][1] + 4);
    ctx.fillText('1', bo_pos[0][0] - 4, bo_pos[0][1] + 4);
    ctx.fillStyle = 'red';
    ctx.fillText(valof(d.hidden_errors, 0, 0), h_pos[0][0] + 15, h_pos[0][1] - 10);
    ctx.fillText(valof(d.hidden_errors, 1, 0), h_pos[1][0] + 15, h_pos[1][1] - 10);
    ctx.fillText(valof(d.hidden_errors, 2, 0), h_pos[2][0] + 15, h_pos[2][1] - 10);
    ctx.fillText(valof(d.output_errors, 0, 0), o_pos[0][0] + 15, o_pos[0][1] - 10);
  }

  function clear() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
  }

  function draw_edges(raw_data_w, raw_data_h) {
    ctx.fillStyle = 'white';
    ctx.fillText('(0, 0)', -44 + ox, 6 + oy);
    ctx.fillText('(0, 1)', ox + rx * raw_data_w, 6 + oy);
    ctx.fillText('(1, 0)', -44 + ox, oy + ry * raw_data_h);
    ctx.fillText('(1, 1)', ox + rx * raw_data_w, oy + ry * raw_data_h);
  }

  function draw_point(x, y, z) {
    const c = ~~(z * 256); // color
    ctx.fillStyle = `rgb(${c},${c},${c})`;
    ctx.fillRect(ox + rx * x, oy + ry * y, rw, rh);
  }

  return {
    clear,
    draw_nn,
    draw_edges,
    draw_point,
  }
}