window.onload = function () {

  const dictionary = Dictionary(['test_1', 'test_2', 'test_3']);

  const program = Program();

  const dragger = Dragger(dictionary, program);

  window.addEventListener('mousedown', dragger.ondown);
  window.addEventListener('mousemove', dragger.onmove);
  window.addEventListener('mouseup', dragger.onup);
}
