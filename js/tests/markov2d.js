


//
// ИДЕЯ НЕ РАБОТАЕТ
//



// source: одномерный массив длины (width x height) содержащая исходную матрицу
// width: ширина исходной матрицы
// height: высота исходной матрицы
// linkshapes: массив всех возможных "форм следований" цепи
function M2D(source, width, height, /*linkshapes*/ ) {

  // array of objects { stringified source elements, random linkshape from "linkshapes" (set of coordiantes on source matrix) }

  // array of objects
  // { dictionary element (as index),
  //   chain elements (as indices of parents, i.e. bijection of current dictionary element linkshape) }
  const chain = {};


  function _I_(x,y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return -1;
    return x + y * width;
  }


  function _XY_(i) {
    if (i < 0 || i >= width*height) return [0,0];
    return [i/width|0,i%width];
  }


  // indexate source
  const indexation_dict = [];
  const indexated = [];
  for (let i = 0; i < source.length; ++i) {
    const value = source[i];
    const di = indexation_dict.findIndex(e => String(e) === String(value));
    if (di < 0) {
      indexation_dict.push(value);
      indexated.push(indexation_dict.length-1);
    } else {
      indexated.push(di);
    }
  }


  const keyring = [];
  const size = 10;
  for (let x = -size; x < size; ++x) for (let y = -size; y < size; ++y) keyring.push([x,y]);




  for (let i = 0; i < indexated.length; ++i) {

    const value = indexated[i];

    const xy = _XY_(i);

    const neighs = keyring.map(xy0 => indexated[_I_(xy[0]+xy0[0], xy[1]+xy0[1])]);


    // const neighs = [
    //   indexated[_I_(xy[0]-1, xy[1]-1)], indexated[_I_(xy[0]+0, xy[1]-1)], indexated[_I_(xy[0]+1, xy[1]-1)],
    //   indexated[_I_(xy[0]-1, xy[1]+0)],                                   indexated[_I_(xy[0]+1, xy[1]+0)],
    //   indexated[_I_(xy[0]-1, xy[1]+1)], indexated[_I_(xy[0]+0, xy[1]+1)], indexated[_I_(xy[0]+1, xy[1]+1)],
    // ];


    if (!chain[value]) {
      chain[value] = neighs.map(e => [e]);
    } else {
      for (let n = 0; n < chain[value].length; ++n) {
        chain[value][n].push(neighs[n]);
      }
    }
  }



  return { d: indexation_dict, chain, width, height, keyring };
}



function drawM2D({ d, chain, width, height, keyring }) {



  function _I_(x,y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return -1;
    return x + y * width;
  }


  function _XY_(i) {
    if (i < 0 || i >= width*height) return [-1,-1];
    return [i/width|0,i%width];
  }

  const output = [];


  let stop_i = 0;

  const key = Math.random()*chain.length|0;
  let x = Math.random()*width|0;
  let y = Math.random()*height|0;
  drw(key,x,y);


  function any(of) { return of[Math.random()*of.length|0]; }


  function drw(key,x,y) {
    output[_I_(x,y)] = key;

    // stop_i++;
    // if (stop_i > 2000) return;

    const coords = keyring.map(xy => [x+xy[0], y+xy[1]]);

    // const coords = [
    //   [x-1,y-1],
    //   [x+0,y-1],
    //   [x+1,y-1],
    //   [x-1,y+0],
    //   [x+1,y+0],
    //   [x-1,y+1],
    //   [x+0,y+1],
    //   [x+1,y+1],
    // ];


    for (let i =0; i < coords.length; ++i) {
      if (_I_(...coords[i]) >= 0 && (output[_I_(...coords[i])] == null || output[_I_(...coords[i])] == -1)) drw(any(chain[key][i].filter(e => e >= 0)),...coords[i]);
    }

  }


  return output.map((i) => d[i]||[50,50,50]);



}
