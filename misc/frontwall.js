(function() {
  'use strict';

  const content = document.querySelector('table tr:nth-child(2) td:last-child'),
        pageName = document.querySelector('title'),
        path = window.location.pathname,
        page = {

    set name(name) {
      pageName.textContent = name;
    },

    get topify() {
      content.vAlign = 'top';
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
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
      }

      // ====== CUSTOM POSTS ======
      // newPost('Title', new Date()).innerHTML = ``;

      break;

    case '/is-gamepro5-good-programmer':
      content.innerHTML = `
        <center>
          <h3>Is Gamekeeper 5 a gud programer?</h3>
          <p>
            <big><big><big><big><big><big><big><big><big><big><big><big><big>NO!</big></big></big></big></big></big></big></big></big></big></big></big></big>
          </p>
          ${button('why?', '/about-website?programing')}
        </center>
      `;
      break;

    case '/about-website':
      content.querySelector('.button').href = 'https://goo.gl/forms/EeA1rGx8marT03MB3';

      if (window.location.search === '?programing') {
        const paragraph = content.querySelector('p');
        paragraph.innerHTML = paragraph.innerHTML
          .replace('This site is by far my greatest accomplishment.', '<x-highlight>$&</x-highlight>');
        document.head.appendChild(document.createElement('style')).textContent = `
          x-highlight {
            background-color: rgba(255, 0, 0, 0.1);
            font-weight: bold;
            /* border-bottom: 2px dashed red; */
          }
        `;
      }
      break;

  }

}());
