const d = C[di] - A.r[di];
const F = d < 0;
const v = F ? C[2 + di] + d : A.r[2 + di] - d;
let x1, y1, x2, y2;
x1 = C[0] + C[2] * a[0 + 4 * F] + v * b[0 + 4 * F];
y1 = C[1] + C[3] * a[1 + 4 * F] + v * b[1 + 4 * F];
x2 = C[0] + C[2] * a[2 + 4 * F] + v * b[2 + 4 * F];
y2 = C[1] + C[3] * a[3 + 4 * F] + v * b[3 + 4 * F];
(y2 - y1 > C[3]) && (y2 = y1 + C[3]);
const g = [x1, y1, x2, y2];
(C.gaps[key].some(e => e.every((e,i) => e === g[i]))) || C.gaps[key].push(g);


'lefts',     lefts, C, [0, 0, 0, 0, 0, 1, 0, 1], [0, 0, 0, 1, 0, -1, 0, 0], 1
'rights',   rights, C, [1, 0, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 0, -1, 0, 0], 1
'tops',       tops, C, [0, 0, 0, 0, 1, 0, 1, 0], [0, 0, 1, 0, -1, 0, 0, 0], 0
'bottoms', bottoms, C, [0, 1, 0, 1, 1, 1, 1, 1], [0, 0, 1, 0, -1, 0, 0, 0], 0





    // lefts.forEach(r => {
    //   const dv = C[1] - r[1];
    //   let x1, y1, x2, y2;
    //   if (dv >= 0) {
    //     const v = r[3] - dv;
    //     x1 = C[0];
    //     y1 = C[1];
    //     x2 = C[0];
    //     y2 = C[1] + v;
    //   } else {
    //     const v = C[3] + dv;
    //     x1 = C[0];
    //     y1 = C[1] + C[3] - v;
    //     x2 = C[0];
    //     y2 = C[1] + C[3];
    //   }
    //   (y2 - y1 > C[3]) && (y2 = y1 + C[3]); // make sure gap not overlaps
    //   const g = [x1, y1, x2, y2]; // removes repetitions and pushes gap
    //   (C.gaps.lefts.some(e => e.every((e,i) => e === g[i]))) || C.gaps.lefts.push(g);
    // });

    // rights.forEach(r => {
    //   const dv = C[1] - r[1];
    //   let x1, y1, x2, y2;
    //   if (dv >= 0) {
    //     const v = r[3] - dv;
    //     x1 = C[0] + C[2];
    //     y1 = C[1];
    //     x2 = C[0] + C[2];
    //     y2 = C[1] + v;
    //   } else {
    //     const v = C[3] + dv;
    //     x1 = C[0] + C[2];
    //     y1 = C[1] + C[3] - v;
    //     x2 = C[0] + C[2];
    //     y2 = C[1] + C[3];
    //   }
    //   (y2 - y1 > C[3]) && (y2 = y1 + C[3]); // make sure gap not overlaps
    //   const g = [x1, y1, x2, y2]; // removes repetitions and pushes gap
    //   (C.gaps.rights.some(e => e.every((e,i) => e === g[i]))) || C.gaps.rights.push(g);
    // });

    // tops.forEach(r => {
    //   const dv = C[0] - r[0];
    //   let x1, y1, x2, y2;
    //   if (dv >= 0) {
    //     const v = r[2] - dv;
    //     x1 = C[0];
    //     y1 = C[1];
    //     x2 = C[0] + v;
    //     y2 = C[1];
    //   } else {
    //     const v = C[2] + dv;
    //     x1 = C[0] + C[2] - v;
    //     y1 = C[1];
    //     x2 = C[0] + C[2];
    //     y2 = C[1];
    //   }
    //   (x2 - x1 > C[2]) && (x2 = x1 + C[2]); // make sure gap not overlaps
    //   const g = [x1, y1, x2, y2]; // removes repetitions and pushes gap
    //   (C.gaps.tops.some(e => e.every((e,i) => e === g[i]))) || C.gaps.tops.push(g);
    // });

    // bottoms.forEach(r => {
    //   const dv = C[0] - r[0];
    //   let x1, y1, x2, y2;
    //   if (dv >= 0) {
    //     const v = r[2] - dv;
    //     x1 = C[0];
    //     y1 = C[1] + C[3];
    //     x2 = C[0] + v;
    //     y2 = C[1] + C[3];
    //   } else {
    //     const v = C[2] + dv;
    //     x1 = C[0] + C[2] - v;
    //     y1 = C[1] + C[3];
    //     x2 = C[0] + C[2];
    //     y2 = C[1] + C[3];
    //   }
    //   (x2 - x1 > C[2]) && (x2 = x1 + C[2]); // make sure gap not overlaps
    //   const g = [x1, y1, x2, y2]; // removes repetitions and pushes gap
    //   (C.gaps.bottoms.some(e => e.every((e,i) => e === g[i]))) || C.gaps.bottoms.push(g);
    // });


