
const variants = [
  [3, 1, 2, 1, { answerIndex: -1 }],
  [3, 1, 1, 2, { answerIndex: -1 }],
  [1, 0, 2, 3, { answerIndex: -1 }],
  [2, 0, 1, 3, { answerIndex: -1 }],
];


function compareArrays(a1, a2, len) {
  const a = [];
  for (let i = 0; i < len; ++i) a.push(a1[i] === a2[i]);
  return a;
}


function isRight(v) {
  return v === true;
}


function check(anwers) {
  // answers -- values from components

  for (let answer of answers) {

    for (let variant of variants) {

      const lastIndex = variant.length - 1;

      const variantStatus = variant[lastIndex];

      if (variantStatus.answerIndex === 0) {
        continue;
      }

      const comparation = compareArrays(answer, variant, lastIndex);

      if (comparation.every(isRight)) {
        variant[lastIndex] = 'fixed';
      }

      const variantSign = ['+', '-'][variant[1]];

    }

  }


}

