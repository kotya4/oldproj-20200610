window.addEventListener('load', () => {
  (function spawn_cats({ count, wrapper }) {
    return [...Array(count)].map((e,i) => {
      const cat = document.createElement('div');
      cat.className = 'cat';
      cat.style.backgroundImage = `url(www_cats-falling/img/${i + 1}.png)`
      wrapper.appendChild(cat);
      let w = wrapper.offsetWidth;
      let h = wrapper.offsetHeight;
      cat.style.left = ((178 / 2 + (Math.random() * (w / 178 - 1) | 0) * 178) | 0) + 'px';
      let y = -183 - (Math.random() * (h / 183) | 0) * 183;
      let dead = false;
      const falling_speed = 1;
      setInterval(() => {
        w = wrapper.offsetWidth;
        h = wrapper.offsetHeight;
        if (dead) {
          y = -183;
          cat.style.left = (((Math.random() * (w / 178 - 2) | 0) * 178) | 0) + 'px';
        }
        y += falling_speed;
        cat.style.top = (y | 0) + 'px';
        dead = y >= wrapper.offsetHeight;
      }, 10);
      return cat;
    });
  }
  )({ count: 8, wrapper: document.getElementById('cats-wrapper') });
});