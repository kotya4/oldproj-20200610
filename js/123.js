// inits list of [1..n] w\o random number in it (ans)
const n = 42;
let a;
{
  const ans = Math.random()*n+1|0;
  let flg = false;
  a = Array(n).fill().map((_,i) => (flg|=(i+1)===ans)?i+2:i+1);
  console.log('expected', ans);
}
// finds exculed number
function find_exculed_number(a, n) {
  let buf = a[0];
  for (let i=1; i<=n; ++i) if ((a[i]||n)-buf>1) return buf+1; else buf=a[i];
  throw Error();
}
// profit
console.log('result', find_exculed_number(a, n));
