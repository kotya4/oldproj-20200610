// inits pascal triangle
const n = 5; // width  (also B's x coordinate)
const m = 3; // height (also B's y coordinate)
const a = Array(n*m).fill(1);
function init_a_recoursively(x, y) {
  if (x>=n||y>=m) return;
  const ox=x, oy=y;
  for (   ; x<n; ++x) a[ x+oy*n] = a[( x-1)+(oy)*n]+a[( x)+(oy-1)*n];
  for (y+1; y<m; ++y) a[ox+ y*n] = a[(ox-1)+( y)*n]+a[(ox)+( y-1)*n];
  init_a_recoursively(ox+1, oy+1);
}
init_a_recoursively(1, 1);

// visualizing tho
const aishere='A is here ->';
const maxnumlen=[...a].sort((a,b)=>b-a)[0].toString().length+1;
for (let y=m-1; y>=0; --y) {
  let buf='';
  for (let x=n-1; x>=0; --x)
    buf+=' '.repeat(Math.max(0,maxnumlen-a[x+y*n].toString().length))+a[x+y*n];
  console.log(
    ((y===m-1)?aishere:' '.repeat(aishere.length))+
    ((y===0)?buf.slice(0,-1)+'x <- B is here':buf)
  );
}

// result
console.log('Paths num:', a[a.length-1]);
