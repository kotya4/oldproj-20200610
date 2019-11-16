
this.variantsBelongAnswer = variants.map(() => -1); // TODO: вставляем марианты меты сюда


$$.Script.prototype.checkAnswer = function (cb) {
  // Для проверки вариантов
  function compareArrays(a1, a2, len) {
    const a = [];
    for (let i = 0; i < len; ++i) a.push(a1[i] === a2[i]);
    return a;
  }

  // втсавляем значения из сомпонентов сюда
  const answers = [];
  for (let i = 0; i < this.rows.length; ++i) {
    let answer = [];
    for (let k = 0; k < this.rows[i].length; ++k) {
      if (this.rows[i][k] instanceof $$.Input) {
        this.rows[i][k].value = ~~this.rows[i][k].value;
        answer.push(~~this.rows[i][k].value);
      }
      if (this.rows[i][k] instanceof $$.DropdownBlock) {
        answer.push(this.rows[i][k].value === '+' ? 0 : 1);
      }
    }
    answers.push(answer);
  }

  // console.log('answers', answers);

  // вставляем варианты из меты сюда
  const variants = [...this.gen.answers];

  // console.log('variants', variants);

  // console.log('--------------------------');
  // answers -- values from components
  const answersChecks = [];
  for (let answerIndex = 0; answerIndex < answers.length; ++answerIndex) {
    // console.log('answerIndex', answerIndex);
    // console.log('variantsBelongAnswer', ...this.variantsBelongAnswer);

    const answer = answers[answerIndex];

    // есть ли среди вариантов такой которой зафиксирован для этого ответа?
    let fixedVariantIndex = -1;
    for (let i = 0; i < this.variantsBelongAnswer.length; ++i) {
      if (this.variantsBelongAnswer[i] === answerIndex) {
        fixedVariantIndex = i;
        break;
      }
    }

    // если есть, проверяем только его
    if (fixedVariantIndex > -1) {
      // console.log('answer with fixed variant', fixedVariantIndex);
      const comparation = compareArrays(answer, variants[fixedVariantIndex], answer.length);
      answersChecks.push(comparation);
    }
    // фиксированного варианта для этого ответа нет, поэтому проверяем все варианты
    else {

      // считаем количество совпадений для каждого варианта
      let variantsComparations = [];
      let variantsCoins = [];
      for (let variantIndex = 0; variantIndex < variants.length; ++variantIndex) {
        let variant = variants[variantIndex];
        const comparation = compareArrays(answer, variant, answer.length);
        let coins = 0;
        //  но только для тех которые не зафиксированы
        if (this.variantsBelongAnswer[variantIndex] < 0) {
          for (let check of comparation) if (check) ++coins;
        } else {
          coins = -100;
        }
        variantsCoins.push(coins);
        variantsComparations.push(comparation);
      }

      // console.log('variantsComparations', ...variantsComparations);
      // console.log('variantsCoins', ...variantsCoins);

      // находим максимальное совпадение
      let maxCoinsIndex = -1;
      let maxCoins = -1;
      for (let i = 0; i < variantsCoins.length; ++i) {
        if (maxCoins < variantsCoins[i]) {
          maxCoins = variantsCoins[i];
          maxCoinsIndex = i;
        }
      }

      // максимальных совпадений несколько?
      let isMaxCoinsMany = false;
      for (let i = 0; i < variantsCoins.length; ++i) {
        if (maxCoins === variantsCoins[i] && maxCoinsIndex !== i) {
          isMaxCoinsMany = true;
          break;
        }
      }

      // console.log('maxCoinsIndex', maxCoinsIndex);
      // console.log('maxCoins', maxCoins);
      // console.log('isMaxCoinsMany', isMaxCoinsMany);

      // если несколько, то ни один не фиксируется
      if (isMaxCoinsMany) {

      }
      // если максимальное совпадение одно, то фиксируем вариант
      else {
        this.variantsBelongAnswer[maxCoinsIndex] = answerIndex;
      }

      answersChecks.push(variantsComparations[maxCoinsIndex]);
    }
    // console.log('--------------------------');
  }

  // console.log('answersChecks', answersChecks);

  // вставляем нужные экспектеды
  let allChecksAreCorrect = true;
  for (let i = 0; i < answersChecks.length; ++i) {
    const components = this.rows[i];
    const checks = answersChecks[i];
    for (let k = 0; k < checks.length; ++k) {
      const component = components[k];
      let componentValue = component.value;
      if (component instanceof $$.DropdownBlock) {
        componentValue = componentValue === '+' ? 0 : 1;
      }
      // console.log(i, k, component.value, componentValue, checks[k]);
      if (checks[k]) {
        component.expected = componentValue;
      } else {
        if (component instanceof $$.DropdownBlock) {
          // HACK: чтобы избежать ошибки:
          // "Uncaught Runtime Error: DropdownBlock: 'expected' некорректен. Такого Item's ID не существует."
          // берем корректное значение дропдауна, увеличиваем на один и берем модуль
          // количества возможных значений (в данном случае 2: плюс и минус).
          // При возможных значениях больше одного, всегда будем получать существующее значение, не равное
          // данному.
          component.expected = (componentValue + 1) % 2;
        } else {
          component.expected = 666;
        }
        allChecksAreCorrect = false;
      }
    }
  }

  // восвращаем тру, если все чеки пройдены
  return cb(String(allChecksAreCorrect));
}
