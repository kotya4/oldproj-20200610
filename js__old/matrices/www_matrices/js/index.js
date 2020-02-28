// проверка ответа
// checks answer correctness (event)
function check(right) {
  // проверяется каждый инпут
  // checks every input
  for (let y = 0; y < right.length; ++y) {
    for (let x = 0; x < right[y].length; ++x) {
      const el = document.getElementById(`mat-${y}-${x}`);
      const v1 = right[y][x];
      const v2 = 0 | el.value;
      // если ответы совпадают - инпут горит зелёненьким, иначе - красным
      // changes input color
      el.style.backgroundColor = v1 === v2 ? 'green' : 'red';
} } }

// эта функция запускается после прогрузки html
// window onload event listener
window.addEventListener('load', function onload() {
  // если кнопка "проверить" существует (это значит, что ответ от сервера пришел без ошибок)
  // if checkout-button exists ..
  const checkout = document.getElementById('checkout');
  if (checkout) {
    // создаём js-матрицу из python-матрицы
    // parses raw constant from heroku
    const right = eval(RIGHT_MATRIX_RAW
      .split(/\s/)
      .filter(e => e.length)
      .join()
      .replace(/\]\[/g, '],[')
    ).filter(e => e).map(e => e.filter(e => e));
    // и добавляем прослушку для кнопки "проверить" (при нажатии запустится ф. check(..))
    // sets event listener
    checkout.addEventListener('click', () => check(right), false);
  }
}, false);
