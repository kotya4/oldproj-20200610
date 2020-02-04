
/*
 *
 */
function Dictionary(elements_array) {
  const container = document.getElementsByClassName('dictionary')[0];
  const elements = [];

  if (elements_array) elements_array.forEach(text => create_element(text));

  function create_element(text, ) {
    const el = document.createElement('div');
    el.className = 'command layer placeable';
    el.innerHTML = text;
    container.appendChild(el);
    elements.push(el);
  }

  return {
    create_element,
  }
}

/*
 *
 */
function Program() {
  const container = document.getElementsByClassName('program')[0];
  const freespaces = [];
  const elements = [];

  create_freespace(); // at least one freespace need to be

  function create_freespace(after = null, index = null) {
    if (after === null && index !== null || after !== null && index === null) {
      throw Error(`Program.create_freespace: 'after' xor 'index' isn't null`);
    }

    const fs = document.createElement('div');
    fs.className = 'freespace layer draggable';

    if (after === null) {
      container.appendChild(fs);
    } else {
      container.insertBefore(fs, after.nextSibling);
    }

    if (index === null) {
      freespaces.push(fs);
    } else {
      freespaces.splice(index, 0, fs);
    }

    return freespaces[freespaces.length - 1] === fs; // is fs was last?
  }

  function create_element(el, fs) {
    for (let i = 0; i < freespaces.length; ++i) {
      if (fs === freespaces[i]) {
        container.insertBefore(el, elements[i] || null);
        elements.splice(i, 0, el);
        // was element last?
        return create_freespace(el, i + 1);
      }
    }
    throw Error(`Program.create_element: element wasn't inserted`);
  }

  function remove_element(el) {
    for (let i = 0; i < elements.length; ++i) {
      if (el === elements[i]) {
        elements[i].remove();
        freespaces[i + 1].remove();
        elements.splice(i, 1);
        freespaces.splice(i + 1, 1);
        return;
      }
    }
    throw Error(`Program.remove_element: element wasn't removed`);
  }

  function scrolled_to_bottom() {
    return container.scrollHeight - container.clientHeight <= container.scrollTop + 1;
  }

  return {
    scrolled_to_bottom,
    create_freespace,
    create_element,
    remove_element,
    freespaces,
    container,
  }
}

/*
 *
 */
function Dragger(dictionary, program) {
  if (false === dictionary && program) {
    throw Error(`Dragger: 'program' or 'dictionary' not passed`);
  }

  const prev_pos = { x: 0, y: 0 };
  const curr_pos = { x: 0, y: 0 };
  let freespace = null;
  let target = null;

  function ondown (e) {
    if (!e.target.classList.contains('placeable')) return;

    // create movable target clone with absolute positioning

    target = e.target.cloneNode(true);
    document.body.appendChild(target);

    const target_rect = e.target.getBoundingClientRect();

    target.style.position = 'absolute';
    target.style.left = target_rect.x;
    target.style.top = target_rect.y;

    prev_pos.x = parseInt(target.style.left);
    prev_pos.y = parseInt(target.style.top);

    curr_pos.x = e.clientX;
    curr_pos.y = e.clientY;

    // remove target (not the clone) if it was contained in 'program'

    if (e.target.parentNode === program.container) {
      program.remove_element(e.target);

      // deny returning animation (see onup)

      prev_pos.x = -1;
      prev_pos.y = -1;
    }

    // open freespace on hovered target position (without transition)

    onmove(e, true);
  }

  function onmove(e, hover_without_transition = false) {
    if (!target) return;

    // move target and update current position

    target.style.left = parseInt(target.style.left) + (e.clientX - curr_pos.x) + 'px';
    target.style.top = parseInt(target.style.top) + (e.clientY - curr_pos.y) + 'px';

    curr_pos.x = e.clientX;
    curr_pos.y = e.clientY;

    // ... and search for new freespace under mouse and remember/animate if found

    const program_rect = program.container.getBoundingClientRect();

    let fs = null;

    if (e.clientX >= program_rect.left
    &&  e.clientX <= program_rect.right
    &&  e.clientY >= program_rect.top
    &&  e.clientY <= program_rect.bottom)
    {
      fs = program.freespaces[program.freespaces.length - 1];

      const target_rect = target.getBoundingClientRect();
      const hoverbox = target_rect.height;

      for (let i = 0; i < program.freespaces.length - 1; ++i) {
        const __fs = program.freespaces[i];
        const fs_rect = __fs.getBoundingClientRect();

        if (e.clientX >= fs_rect.left   - hoverbox
        &&  e.clientX <= fs_rect.right  + hoverbox
        &&  e.clientY >= fs_rect.top    - hoverbox
        &&  e.clientY <= fs_rect.bottom + hoverbox)
        {
          fs = __fs;
          break;
        }
      }

      // TODO: неправильный freespace (выше чем нужно)
      //       отображается при поднимании placeable если
      //       прокрутка полностью находится внизу (если она есть)

      if (!hover_without_transition) fs.classList.add('hover-transition');
      fs.classList.add('hover');

      if (program.freespaces[program.freespaces.length - 1] === fs) {
        program.container.scrollTop = program.container.scrollHeight;
      }
    }

    // unhover previous freespace and set current as freespace

    if (fs !== freespace) {
      if (freespace) {
        freespace.classList.remove('hover-transition');
        freespace.classList.remove('hover');
      }
      freespace = fs;
    }
  }

  function onup(e) {
    if (!target) return;

    // if mouse under freespace then push target into 'program'

    if (freespace) {
      target.style.position = 'static';
      target.style.left = '0px';
      target.style.top = '0px';

      freespace.classList.remove('hover-transition');
      freespace.classList.remove('hover');

      program.create_element(target, freespace);

      target = null;
      freespace = null;

      return;
    }

    // elsewise destroy movable target

    if (prev_pos.x >= 0 && prev_pos.y >= 0) {
      // TODO: returning animation (only if prev_pos exists)

    }

    target.remove();
    target = null;
  }

  return {
    program,
    dictionary,
    freespace,
    target,
    prev_pos,
    curr_pos,
    ondown,
    onmove,
    onup,
  }
}
