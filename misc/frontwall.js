(function() {
  'use strict';

  const content = document.querySelector('table tr:nth-child(2) td:last-child'),
        pageName = document.querySelector('title')
        path = window.location.pathname,
        page = {

    set name(name) {
      pageName.textContent = name;
    }

    set innerHTML(html) {
      content.innerHTML = html;
    }

  };

  let customButtons = 0;
  function button(text, onclick = '#') {
    if (typeof onclick === 'string') {
      return `<a class="button" href="${onclick}">${text}</a>`
    } else if (typeof onclick === 'function') {
      let fnName = btoa(customButtons++).replace(/[^a-z]/gi, '') || 'a' + customButtons;
      window[fnName] = () => onclick();
      return `<button onclick="window.${fnName}()" class="dropbtn">${text}</button>`
    }
  }

  switch (path) {

    case '/news':
    case '/news_list':
      const list = path === '/news_list';

      const postLinks = content.querySelector('td > center');
      const posts = content.querySelector('.shadow');

      function newPost(title, date) {
        const id = title.replace(/\s/g, '_').replace(/[^a-z_]/gi, '');
        if (!list)
          postLinks.insertBefore(document.createElement('p'), postLinks.firstElementChild)
            .innerHTML = `<a href="#${id}" class="article">${id}</a>`;

        return {
          set innerHTML(html) {
            const post = document.createElement('div');
            post.innerHTML = `<i>${formatDate(date)}</i><p><b></b></p>`
              + `<h3><b>${title}</b></h3>`
              + html;
            if (list) {
              post.insertBefore(document.createElement('hr'), post.firstElementChild)
                .color = 'red';
              content.insertBefore(post, content.querySelector('hr'));
            } else {
              post.className = 'popup';
              post.id = id;
              posts.appendChild(post);
            }
          }
        }
      }

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      function formatDate(date) {
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getYear()}`
      }

      // ====== CUSTOM POSTS ======
      newPost('test', new Date()).innerHTML = ``;

      break;

  }

}());
