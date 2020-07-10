// list of (random?) numbers, and random sum of pair (neighbours?)
const n = 42;
let a;
let sum;
{
  a = Array(n).fill().map(() => Math.random()*(n+1)|0);
  const i = Math.random()*(n-1)|0;
  sum = a[i]+a[i+1];
}
// result
const i = (function find_neighbours_index(a, sum) {
  for (let i = 0; i < a.length-1; ++i) if (a[i]+a[i+1]===sum) return i;
  throw Error();
})(a, sum);

console.log(`given list (${n} e.):`);
a.forEach((e,i) => console.log(i,a[i]));
console.log(`calculated sum: ${sum}, found: ${a[i]+a[i+1]}==${a[i]}+${a[i+1]} at index: ${i}`);
