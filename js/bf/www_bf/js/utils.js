      /*
      // НЕ РАБОТАЕТ С ВЛОЖЕННЫМИ НОДАМИ (А ОНИ ПОЯВЛЯЮТСЯ ВО ВРЕМЯ ВСТАВКИ/ВЫРЕЗАНИЯ)
      //console.log(containers.code.innerHTML);
      current_lines_number = containers.code.childNodes.length || 1;
      if (code_lines.childNodes.length < current_lines_number) {
        for (let i = 1 + ~~code_lines.lastChild; i <= current_lines_number; ++i)
          code_lines.innerHTML += `<div>${i}</div>`;
      } else {
        //code_lines.childNodes.length = current_lines_number;
        //console.log(current_lines_number, code_lines.childNodes);
        for (let i = code_lines.childNodes.length - current_lines_number; --i; ) {
          console.log(code_lines.lastChild);
          code_lines.removeChild(code_lines.lastChild);
        }
      }
      */

