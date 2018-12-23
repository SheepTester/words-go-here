(function() {
  'use strict';

  const content = document.querySelector('table tr:nth-child(2) td:last-child'),
        pageName = document.querySelector('title'),
        path = window.location.pathname,
        page = {

    set title(tabName) {
      pageName.textContent = 'Gamepro5 - ' + tabName;
    },

    get topify() {
      content.vAlign = 'top';
    },

    swapLink(oldLink, newLink) {
      document.querySelectorAll(`a[href="${oldLink}"]`).forEach(el => el.href = newLink);
    }

  };

  page.swapLink('https://goo.gl/forms/tj4LqFKzyMPuOlqg1', 'https://goo.gl/forms/EeA1rGx8marT03MB3');
  page.swapLink('https://goo.gl/forms/ziifb6S4XmK0k3QS2', 'https://goo.gl/forms/AOE4M5FjmbfvbTis2');

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

  if (path.startsWith('/programs')) {

    function newProgram(title, description, url) {
      const id = title.toLowerCase().replace(/\s/g, '_');
      if (path === '/programs/' + id) {
        page.title = 'Programs';
        content.innerHTML = `
          <a href="/programs.html">
            <img class="backarrow" src="/images/backarrow.svg">
          </a>
          <p>
          <p>
          <h3><b>${title}</b></h3>
          ${description ? `<p>${description}</p>` : ''}
          <iframe src="${url}" height="500" width="600"></iframe>
        `;
      } else if (path[9] !== '/') {
        content.appendChild(document.createElement('p')).innerHTML = `
          ${title}
          <br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${button('play', '/programs/' + id)}
        `;
      }
    }

    // ====== CUSTOM PROGRAMS ======
    // newProgram('test', 'hmmm', 'https://sheeptester.github.io/');

  }
  else switch (path) {

    case '/':

      function newNotif(title) {
        const wrapper = document.createElement('center');
        const id = atob(title).replace(/[^a-z]/gi, '') || 'a' + content.textContent.length;
        if (localStorage[id] === 'yes') wrapper.style.display = 'none';
        content.insertBefore(wrapper, content.querySelector('center:nth-of-type(2)'));
        return {
          set innerHTML(html) {
            wrapper.innerHTML = `
            <div class="alert" style="width: 280px;" id="${id}">
              <span class="closebtn" onclick="this.parentElement.parentElement.style.display='none';localStorage.${id}='yes';">&times;</span>
          	  <br>
              <h3>${title}</h3>
              <br>
              ${html}
            </div>
            <br>
            `;
          }
        }
      }

      // ====== CUSTOM ALERTS ======
      // newNotif('test').innerHTML = `lollololollol<p><a class="popupbutton" href="#">do nothing</a></p>`;

      break;

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
      page.title = 'Is Gamekeeper 5 a gud programer?';
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
