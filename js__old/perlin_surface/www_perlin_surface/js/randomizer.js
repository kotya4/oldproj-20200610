
const Randomizer = (() => {
  /*
   * http://xoshiro.di.unimi.it/splitmix64.c
   */
  function splitmix64(x) {
    return () => {
      let z = (x += 0x9e3779b97f4a);
      z = (z ^ (z >> 30)) * 0xbf58476d1ce4;
      z = (z ^ (z >> 27)) * 0x94d049bb1331;
      return z ^ (z >> 31);
    }
  }

  /*
   * http://xoshiro.di.unimi.it/xorshift128plus.c
   */
  function xorshift128plus(s) {
    if (Number.isInteger(s)) {
      const rand = splitmix64(s);
      s = [rand(), rand()];
    }
    return () => {
      let s1 = s[0];
      const s0 = s[1];
      const result = s0 + s1;
      s[0] = s0;
      s1 ^= s1 << 23;
      s[1] = s1 ^ s0 ^ (s1 >> 18) ^ (s0 >> 5);
      return result; 
    }
  }


  return {
    splitmix64,
    xorshift128plus
  }
})();