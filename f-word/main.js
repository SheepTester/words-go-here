function askAPI(url, body = {}, isJSON = false) {
  return fetch('https://test-9d9aa.firebaseapp.com/fword?' + url, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    method: 'POST',
    body: JSON.stringify(body)
  }).then(async r => r.status === 400 ? Promise.reject(await r.text()) : isJSON ? r.json() : r.text());
}
const COOKIE_NAME = '[f word] session';
document.addEventListener('DOMContentLoaded', e => {
  function checkSessionExpire(otherwise, then) {
    return err => {
      if (err === 'session doesn\'t exist' || err === 'expired session') {
        signOut();
      } else if (otherwise) {
        otherwise(err);
      }
      if (then) then();
    };
  }
  const elems = {
    container: document.getElementById('container'),
    signIn: {
      username: document.getElementById('sign-in-username'),
      password: document.getElementById('sign-in-password'),
      error: document.getElementById('sign-in-error'),
      submit: document.getElementById('sign-in-btn')
    },
    signUp: {
      username: document.getElementById('sign-up-username'),
      password: document.getElementById('sign-up-password'),
      error: document.getElementById('sign-up-error'),
      submit: document.getElementById('sign-up-btn')
    },
    posts: document.getElementById('posts'),
    postError: document.getElementById('post-error'),
    postContent: document.getElementById('postarea'),
    postSubmit: document.getElementById('post-submit'),
    user: {
      name: document.getElementById('username'),
      bio: document.getElementById('bio'),
      joinDate: document.getElementById('join-date')
    },
    tempPostPage: document.getElementById('temp-post-page-content')
  };
  let currentView = 'home';
  let session = localStorage.getItem(COOKIE_NAME);
  if (session) {
    session = JSON.parse(session);
    document.body.classList.add('hide-signed-out-top-nav');
  } else {
    document.body.classList.add('hide-signed-in-top-nav');
  }
  function loadView(search) {
    container.classList.remove(currentView);
    if (currentView === 'sign-in') {
      elems.signIn.username.value = elems.signIn.password.value = '';
      elems.signIn.error.classList.add('hidden');
    } else if (currentView === 'sign-up') {
      elems.signUp.username.value = elems.signUp.password.value = '';
      elems.signUp.error.classList.add('hidden');
    } else if (currentView === 'home') {
      elems.postContent.value = '';
      elems.postError.classList.add('hidden');
    }
    search = search.slice(1);
    if (search === 'sign-in') {
      if (session) {
        switchView('?');
      } else {
        currentView = 'sign-in';
      }
    } else if (search === 'sign-up') {
      if (session) {
        switchView('?');
      } else {
        currentView = 'create-account';
      }
    } else if (search === 'settings') {
      if (session) {
        currentView = 'settings';
      } else {
        switchView('?signin');
      }
    } else if (search[0] === '!') {
      currentView = 'post-page';
      elems.tempPostPage.value = 'Loading...';
      askAPI('type=post&post=' + search.slice(1), {}, true).then(({content, author, date, parent, likes}) => {
        elems.tempPostPage.value = `CONTENT:\n\n${content}\n\nAUTHOR: ${author}\nDATE: ${new Date(date).toLocaleString()}\nPARENT: ${parent || '[NOT A RESPONSE]'}\nLIKES: ${JSON.stringify(likes) || '[NONE]'}`;
      }).catch(err => {
        elems.tempPostPage.value = 'ERROR\n\n' + err;
      });
    } else if (search[0] === '*') {
      currentView = 'user-page';
      const user = decodeURIComponent(search.slice(1));
      elems.user.name.textContent = user;
      elems.user.joinDate.textContent = 'Loading...';
      elems.user.bio.textContent = 'Loading...';
      askAPI('type=user&user=' + user, {}, true).then(({bio, pfp, joinDate}) => {
        elems.user.joinDate.textContent = new Date(joinDate).toLocaleString();
        elems.user.bio.innerHTML = minimalMarkupToHTML(bio);
      }).catch(() => {
        elems.user.joinDate.textContent = 'Not yet';
        elems.user.bio.textContent = 'Hello! I don\'t exist. Oh well.';
      });
    } else {
      currentView = 'home';
      askAPI('type=recent-posts&limit=20', {}, true).then(posts => {
        elems.posts.innerHTML = Object.keys(posts).reverse().map(postID => {
          const post = posts[postID];
          let html = `<div class="post">`;
          html += `<span class="author"><a href="?*${post.author}">${post.author}</a> `;
          if (post.parent) html += `<a class="parent" href="?!${post.parent}">responds</a>`;
          else html += `says`;
          html += `</span><span class="post-content">${minimalMarkupToHTML(post.content)}</span>`;
          html += `<a class="date" href="?!${postID}">${new Date(post.date).toLocaleString()}</a></div>`;
          return html;
        }).join('');
      });
    }
    container.classList.add(currentView);
  }
  function switchView(view) {
    history.pushState({}, '', view);
    loadView(view);
  }
  function signOut() {
    document.body.classList.remove('hide-signed-out-top-nav');
    document.body.classList.add('hide-signed-in-top-nav');
    session = null;
    localStorage.removeItem(COOKIE_NAME);
  }
  loadView(window.location.search);
  window.addEventListener('popstate', e => {
    loadView(window.location.search);
  });
  document.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      const href = e.target.getAttribute('href');
      if (href && href[0] === '?') {
        switchView(href);
        e.preventDefault();
      } else if (e.target.classList.contains('sign-out')) {
        askAPI('session=true&type=signout', {session: session.id}).then(signOut).catch(checkSessionExpire());
      }
    }
  });
  elems.signIn.username.addEventListener('keydown', e => {
    if (e.keyCode === 13) elems.signIn.password.focus();
  });
  elems.signIn.password.addEventListener('keydown', e => {
    if (e.keyCode === 13) elems.signIn.submit.click();
  });
  elems.signIn.submit.addEventListener('click', e => {
    if (session) return;
    elems.signIn.username.disabled = elems.signIn.password.disabled = elems.signIn.submit.disabled = true;
    askAPI('type=signin', {
      user: elems.signIn.username.value,
      password: elems.signIn.password.value
    }).then(sessionID => {
      session = {
        id: sessionID,
        username: elems.signIn.username.value
      };
      localStorage.setItem(COOKIE_NAME, JSON.stringify(session));
      elems.signIn.password.value = '';
      elems.signIn.username.disabled = elems.signIn.password.disabled = elems.signIn.submit.disabled = false;
      document.body.classList.add('hide-signed-out-top-nav');
      document.body.classList.remove('hide-signed-in-top-nav');
      switchView('?');
    }).catch(err => {
      if (err === 'incorrect password') {
        elems.signIn.error.textContent = 'Incorrect password.';
        elems.signIn.password.focus();
      } else {
        elems.signIn.error.textContent = 'Problem.';
      }
      elems.signIn.error.classList.remove('hidden');
      elems.signIn.username.disabled = elems.signIn.password.disabled = elems.signIn.submit.disabled = false;
    });
  });
  elems.signUp.username.addEventListener('keydown', e => {
    if (e.keyCode === 13) elems.signUp.password.focus();
  });
  elems.signUp.password.addEventListener('keydown', e => {
    if (e.keyCode === 13) elems.signUp.submit.click();
  });
  elems.signUp.submit.addEventListener('click', e => {
    if (session) return;
    const errors = [];
    if (elems.signUp.username.value[0] === ' ') {
      errors.push('Why would a username start with a space?');
      elems.signUp.username.focus();
    }
    if (elems.signUp.username.value.length < 1) {
      errors.push('That username is a tad bit too short.');
      elems.signUp.username.focus();
    }
    if (elems.signUp.username.value.length > 26) {
      errors.push('That username is too fat.');
      elems.signUp.username.focus();
    }
    if (elems.signUp.username.value[elems.signUp.username.value.length - 1] === ' ') {
      errors.push('Why would a username end with a space?');
      elems.signUp.username.focus();
    }
    if (!elems.signUp.password.value.includes(' ')) {
      errors.push('Your password is too weak. Consider adding a space.');
      elems.signUp.password.focus();
    }
    if (elems.signUp.username.value.includes('  ')) {
      errors.push('What kind of person would use double spaces? Especially in their username?!');
      elems.signUp.username.focus();
    }
    if (/[^a-z ]/.test(elems.signUp.username.value)) {
      errors.push('Your username is too diverse. Use only socially acceptable characters.');
      elems.signUp.username.focus();
    }
    if (errors.length) {
      elems.signUp.error.innerHTML = errors.join('<br>');
      elems.signUp.error.classList.remove('hidden');
    } else {
      elems.signUp.username.disabled = elems.signUp.password.disabled = elems.signUp.submit.disabled = true;
      askAPI('type=createuser', {
        user: elems.signUp.username.value,
        password: elems.signUp.password.value
      }).then(sessionID => {
        session = {
          id: sessionID,
          username: elems.signUp.username.value
        };
        localStorage.setItem(COOKIE_NAME, JSON.stringify(session));
        elems.signUp.password.value = '';
        elems.signUp.username.disabled = elems.signUp.password.disabled = elems.signUp.submit.disabled = false;
        document.body.classList.add('hide-signed-out-top-nav');
        document.body.classList.remove('hide-signed-in-top-nav');
        switchView('?');
      }).catch(err => {
        if (err === 'dumb username') {
          elems.signUp.error.textContent = 'Dangerous username.';
          elems.signUp.username.focus();
        } else if (err === 'dumb password') {
          elems.signUp.error.textContent = 'Troublesome password.';
          elems.signUp.password.focus();
        } else if (err === 'user exists') {
          elems.signUp.error.textContent = `${elems.signUp.username.value} was faster. Use a different username.`;
          elems.signUp.username.focus();
        } else {
          elems.signUp.error.textContent = 'Problem.';
        }
        elems.signUp.error.classList.remove('hidden');
        elems.signUp.username.disabled = elems.signUp.password.disabled = elems.signUp.submit.disabled = false;
      });
    }
  });
  elems.postSubmit.addEventListener('click', e => {
    elems.postContent.disabled = elems.postSubmit.disabled = true;
    askAPI('session=true&type=post', {
      session: session.id,
      content: elems.postContent.value
    }).then(postID => {
      elems.postContent.disabled = elems.postSubmit.disabled = false;
      switchView('?!' + postID);
    }).catch(checkSessionExpire(err => {
      elems.postError.classList.remove('hidden');
      if (err === 'too long') {
        elems.postError.textContent = 'Not concise enough. OC disapproves';
        elems.postContent.focus();
      } else if (err === 'too short') {
        elems.postError.textContent = 'Your silence will be unappreciated. Might as well block it now.';
        elems.postContent.focus();
      } else {
        elems.postError.textContent = 'Problem.';
      }
      elems.postContent.disabled = elems.postSubmit.disabled = false;
    }))
  });
}, false);
