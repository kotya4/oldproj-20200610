

// additional functionality


$.div = (class_name) => $(`<div class="${class_name}"></div>`);



// main



window.onload = function() {


  // constants


  const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    .split(' ');
  const date = () => `${1 + Math.random() * 30 | 0}.${1 + Math.random() * 12 | 0}.2020`;
  const lorem = () => Array(2 + Math.random() * 30 | 0).fill().map(_ => LOREM[Math.random() * LOREM.length | 0]).join(' ');


  // layout


  $('body').append(
    $.div('container').append(
      Array(15).fill().map(_ =>
        $.div('card').append(
          $.div('name').append(
            $.div('text').html('• ' + date()),
            $.div('link').html('[<a href="https://google.com">@</a>]'),
          ),
          $.div('disc').html(lorem()),
          $.div('foot'),
        )
      )
    )
  );




}
