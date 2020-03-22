//
window.onload = function () {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 320;
  ctx.canvas.height = 240;
  // document.body.appendChild(ctx.canvas);


  ctx.fillStyle = 'white';
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


  // let diactics = `◌̀◌́◌̂◌̃◌̄◌̅◌̆◌̇◌̈◌̉◌̊◌̋◌̌◌̍◌̎◌̏◌̐◌̑◌̒◌̓◌̔◌̕◌̖◌̗◌̘◌̙◌̚◌̛◌̜◌̝◌̞◌̟◌̠◌̡◌̢◌̣◌̤◌̥◌̦◌̧◌̨◌̩◌̪◌̫◌̬◌̭◌̮◌̯◌̰◌̱◌̲◌̳◌̴◌̵◌̶◌̷◌̸◌̹◌̺◌̻◌̼◌̽◌̾◌̿◌̀◌́◌͂◌̓◌̈́◌ͅ◌͆◌͇◌͈◌͉◌͊◌͋◌͌◌͍◌͎◌͐◌͑◌͒◌͓◌͔◌͕◌͖◌͗◌͘◌͙◌͚◌͛◌͜◌͝◌͞◌͟◌͠◌͡◌͢◌ͣ◌ͤ◌ͥ◌ͦ◌ͧ◌ͨ◌ͩ◌ͪ◌ͫ◌ͬ◌ͭ◌ͮ◌ͯ`;
  // diactics = diactics.split('');
  // [160,168,170,172,178,182,188].forEach(i => diactics[i-1] = null);
  // diactics.length = 197;
  // diactics = diactics.filter((e,i) => e !== null && i % 2 > 0);



  diactics = '̴̵̶̷̸̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼͇͈͉͍͎͓͚̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏̐̑̒̓̔̽̾̿̀́͂̓̈́͆͊͋͌͑͒͗̕̚͘͜͟͢͝͠͡ͅ';


  const alphabet = `qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM`;

  // const alphabet = 'Hello, world!';

  let text = '';

  // for (let i = 0; i < 100; ++i) text += `${diactics[Math.random()*diactics.length|0]}${alphabet[Math.random()*alphabet.length|0]}`;

  // alphabet.split('').forEach(e => text += `${diactics[Math.random()*diactics.length|0]}${e}`);


  function gen_text(num) {

    return Array(num).fill().map(() => alphabet[Math.random()*alphabet.length|0]).map(e => `${diactics[Math.random()*diactics.length|0]}${e}`).join('');
  }



  $('body').append(
    $.div('ground-2').html(gen_text(4000)),
    $.div('ground-1').html(gen_text(1000)),
    $.div('ground-0').html(gen_text(500)),
  );


  // let text = '', i = 0;
  // for (let d of diactics) { i++; text += `${d}a`; }
  // text += '\n';

  // for (let d of diactics) text += `a${d} `;


  // document.body.innerText = text;


}
