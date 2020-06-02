//
window.onload = function() {


  const source = BIBLE.slice(0, 0xffff);

  const mchain = Markov(source.split(''), 4);

  console.log(
    ExecuteMarkov(mchain),
    ExecuteMarkov(mchain),
    ExecuteMarkov(mchain),
  );

}
