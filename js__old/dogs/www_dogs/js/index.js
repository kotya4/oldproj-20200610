
(function(){
  const tree_entry = {
    text: 'шерсть', values: [
      {
        value: 'короткошерстный', next: {
          text: 'рост', values: [
            {
              value: 'менее 50 см', next: {
                text: 'хвост', values: [
                  {
                    value: 'короткий', next: {
                      text: 'английский бульдог', values: null
                    } 
                  },
                  {
                    value: 'длинный', next: {
                      text: 'уши', values: [
                        {
                          value: 'длинные', next: {
                            text: 'гончая', values: null
                          },
                        },
                        {
                          value: 'короткие', next: {
                            text: 'тело', values: [
                              {
                                value: 'короткое', next: {
                                  text: 'мопс', values: null
                                },
                              },
                              {
                                value: 'длинное', next: {
                                  text: 'чихуахуа', values: null
                                }
                              }
                            ]
                          }
                        }
                      ] 
                    }
                  }
                ]
              }
            },
            {
              value: 'более 50 см', next: {
                text: 'вес', values: [
                  {
                    value: 'более 50 кг', next: {
                      text: 'датский дог', values: null
                    }
                  },
                  {
                    value: 'менее 50 кг', next: {
                      text: 'фоксхаунд', values: null
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        value: 'длинношерстный', next: {
          text: 'рост', values: [
            {
              value: 'менее 50 см', next: {
                text: 'характер', values: [
                  {
                    value: 'доброжелательный', next: {
                      text: 'кокер-спаниель', values: null
                    }
                  },
                  {
                    value: 'недоброжелательный', next: {
                      text: 'ирландский сеттер', values: null
                    }
                  }
                ]
              }
            },
            {
              value: 'более 50 см но менее 70 см', next: {
                text: 'уши', values: [
                  {
                    value: 'длинные', next: {
                      text: 'большой вандейский грифон', values: null
                    }
                  },
                  {
                    value: 'короткие', next: {
                      text: 'колли', values: null
                    }
                  }
                ]
              }
            },
            {
              value: 'более 70 см', next: {
                text: 'окрас', values: [
                  {
                    value: 'рыжий', next: {
                      text: 'сенбернар', values: null
                    }
                  },
                  {
                    value: 'белый', next: {
                      text: 'ирландский волкодав', values: null
                    }
                  },
                  {
                    value: 'другой', next: {
                      text: 'ньюфаундленд', values: null
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  };

  function create_selector(title, values, parent_id, onchange) {
    let parent = document.getElementById(parent_id);
    if (!parent)
      parent = document.body;
    
    const div = document.createElement('div');
    div.className = 'container';
    parent.appendChild(div);

    const selector = document.createElement('select');
    div.appendChild(selector);

    values.forEach((e,i) => {
      const option = document.createElement('option');
      option.value = i;
      option.text = e;
      selector.appendChild(option);
    });

    selector.selectedIndex = -1;

    if (onchange !== undefined)
      selector.addEventListener('change', onchange, false);

    return { selector, div };
  }

  function create_selector_for_next(object) {
    const o = create_selector(object.text, Array.from(object.values).map(e => object.text + ': ' + e.value), 'wrapper', () => {
      const next_object = object.values[o.selector.selectedIndex].next;
      o.div.innerHTML = object.text + ': ' + object.values[o.selector.selectedIndex].value;
      if (next_object.values === null) {
        o.div.innerHTML += ' --> ' + next_object.text;
        return;
      }
      create_selector_for_next(next_object);
    });
  }

  function draw_that_horrible_thing_recursively(entry, ctx, w = 0, x = 0, y = 0, from_x = 0, from_y = 0, color = { r: 0, g: 0, b: 0 }) {
    if (w === 0) {
      w = ctx.canvas.height;
      x = 20;
      y = w / 2;
      from_x = x;
      from_y = y;
    }
    const h_mod = 0;
    const values = entry.values;
    const text = entry.text;

    const new_color = { ...color };
    for (let i in new_color) {
      new_color[i] += Math.random() * 40 | 0;
    }

    const color111 = `rgb(${new_color.r},${new_color.g},${new_color.b})`;
    ctx.strokeStyle = color111;
    ctx.beginPath();
    ctx.moveTo(from_x, from_y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = color111;
    const width = ctx.measureText(text).width + 10;
    ctx.fillRect(x - 5, y - 12, width, 18);
    ctx.fillStyle = '#fff';//`rgb(${256-new_color.r},${256-new_color.g},${256-new_color.b})`;
    ctx.fillText(text, x, y);

    const nx = x - 5 + width;

    if (entry.values === null)
      return;

    let max_nx = h_mod;
    for (let i = 0; i < values.length; ++i) {
      ctx.fillStyle = color;
      const width1 = ctx.measureText(values[i].value).width + 20;
      if (max_nx < width1) max_nx = width1;
      const height = 12;
      ctx.fillStyle = '#000';
      ctx.fillText(values[i].value, x + width, y + height * (i + 0.5) - height * values.length / 2);
    }

    const next_w = w / values.length;
    for (let i = 0; i < values.length; ++i) {
      const next = values[i].next;
      const next_x = nx + max_nx;
      const next_y = y - w / 2 + next_w * i + next_w / 2;
      draw_that_horrible_thing_recursively(next, ctx, next_w, next_x, next_y, nx, y, new_color);
    }
  }

  // window onload event listener
  window.addEventListener('load', function onload() {
    create_selector_for_next(tree_entry);

    const cvs = document.getElementById('canvas');
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    draw_that_horrible_thing_recursively(tree_entry, ctx);

  }, false);
})();