function askAPI(url, body = {}, isJSON = false) {
  return fetch('https://test-9d9aa.firebaseapp.com/fword?' + url, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    method: 'POST',
    body: JSON.stringify(body)
  }).then(async r => r.status === 400 ? Promise.reject(await r.text()) : isJSON ? r.json() : r.text());
}
function clickOnEnter(input, btn) {
  input.addEventListener('keydown', e => {
    if (e.keyCode === 13) btn.click();
  });
}
async function renderPosts(wrapper, posts, session, pfps) {
  let mentionedUsers = {};
  Object.values(posts).forEach(postData => {
    if (!pfps[postData.author]) mentionedUsers[postData.author] = true;
    if (postData.likes) {
      Object.keys(postData.likes).forEach(user => {
        if (!pfps[user]) mentionedUsers[user] = true;
      });
    }
  });
  mentionedUsers = Object.keys(mentionedUsers);
  if (mentionedUsers.length) {
    const newPFPs = await askAPI('type=pfps&users=' + mentionedUsers.join('.'), {}, true);
    Object.keys(newPFPs).forEach(user => {
      const [angle, colour1, colour2] = newPFPs[user].split('.');
      newPFPs[user] = `linear-gradient(${angle}deg, #${colour1}, #${colour2})`;
    });
    Object.assign(pfps, newPFPs);
  }
  const ids = Object.keys(posts).reverse();
  wrapper.innerHTML = ids.map(postID => {
    return frontPagePostify(pfps, postID, posts[postID], session);
  }).join('');
  const continueDiv = document.createElement('div');
  wrapper.appendChild(continueDiv);
  return [ids[ids.length - 1], continueDiv];
}
function frontPagePostify(pfps, postID, post, session) {
  let html = `<div class="post" data-id="${postID}">`;
  html += `<div class="pfp pfp-post" style="background-image: ${pfps[post.author]};"></div>`;
  html += `<div class="post-right"><span class="author"><a href="?*${post.author}">${post.author}</a> `;
  if (post.parent) html += `<a class="parent" href="?!${post.parent}">responds</a>`;
  else html += `says`;
  html += `</span><span class="post-content">${minimalMarkupToHTML(post.content)}</span>`;
  if (post.likes) {
    const likers = Object.keys(post.likes);
    html += `<span class="like"><span class="like-count">${likers.length}</span> liker(s): <div class="likers">` + likers.slice(0, 10).map(user => {
      return `<a class="pfp pfp-like" href="?*${user}" title="${user}" style="background-image: ${pfps[user]};"></a>`;
    }).join('') + `</div>`;
    if (session) {
      const userLikes = post.likes[session.username] ? 'unlike' : 'like';
      html += ` <a class="like-btn like-${userLikes}" href="#">${userLikes}</a>`;
    }
    html += `</span>`;
  }
  html += `<a class="date" href="?!${postID}">${new Date(post.date).toLocaleString()}</a>`;
  if (session) {
    if (!post.likes) html += `<a class="like-btn like-solo like-like" href="#">like</a>`;
    html += `<a class="respond-btn like-solo" href="#">respond</a>`;
  }
  html += `</div></div>`;
  return html;
}
const COOKIE_NAME = '[f word] session';
document.addEventListener('DOMContentLoaded', e => {
  let tabFocus = false;
  document.addEventListener('keydown', e => {
    if (e.keyCode === 9) {
      document.body.classList.add('tab-focus');
      tabFocus = true;
    }
  });
  document.addEventListener('keyup', e => {
    if (e.keyCode === 9) {
      tabFocus = false;
    }
  });
  document.addEventListener('focusin', e => {
    if (!tabFocus) {
      document.body.classList.remove('tab-focus');
    }
  });
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
      joinDate: document.getElementById('join-date'),
      pfp: document.getElementById('user-pfp')
    },
    tempPostPage: document.getElementById('temp-post-page-content'),
    settings: {
      pfp: document.getElementById('self-pfp'),
      pfpState: null,
      colour1: document.getElementById('colour1'),
      colour2: document.getElementById('colour2'),
      pfpError: document.getElementById('pfp-error'),
      savePFP: document.getElementById('save-pfp'),
      bio: document.getElementById('self-bio'),
      bioError: document.getElementById('bio-error'),
      saveBio: document.getElementById('save-bio'),
      secret: document.getElementById('self-secret'),
      secretError: document.getElementById('secret-error'),
      saveSecret: document.getElementById('save-secret'),
      expiry: document.getElementById('expiry-length'),
      expiryError: document.getElementById('expiry-error'),
      saveExpiry: document.getElementById('save-expiry'),
      oldPassword: document.getElementById('old-password'),
      newPassword: document.getElementById('new-password'),
      newPassError: document.getElementById('new-pass-error'),
      savePass: document.getElementById('save-password')
    },
    loadMore: document.getElementById('load-more')
  };
  let currentView = 'home';
  let session = localStorage.getItem(COOKIE_NAME);
  if (session) {
    session = JSON.parse(session);
    document.body.classList.add('hide-signed-out-top-nav');
  } else {
    document.body.classList.add('hide-signed-in-top-nav');
  }
  const pfps = {};
  let lastPostID, continueDiv;
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
        switchView('./');
      } else {
        currentView = 'sign-in';
      }
    } else if (search === 'sign-up') {
      if (session) {
        switchView('./');
      } else {
        currentView = 'create-account';
      }
    } else if (search === 'settings') {
      if (session) {
        currentView = 'settings';
        elems.settings.bioError.classList.add('hidden');
        elems.settings.newPassError.classList.add('hidden');
        elems.settings.savePFP.disabled = elems.settings.saveBio.disabled = elems.settings.saveSecret.disabled = elems.settings.saveExpiry.disabled = elems.settings.savePass.disabled = true;
        elems.settings.colour1.disabled = elems.settings.colour2.disabled = elems.settings.bio.disabled = elems.settings.secret.disabled = true;
        elems.settings.bio.style.height = elems.settings.secret.style.height = null;
        elems.settings.expiry.value = elems.settings.oldPassword.value = elems.settings.newPassword.value = '';
        askAPI('type=user&user=' + session.username, {}, true).then(({bio, pfp}) => {
          const [angle, colour1, colour2] = pfp.split('.');
          elems.settings.pfpState = [+angle, colour1, colour2];
          elems.settings.pfp.style.backgroundImage = `linear-gradient(${angle}deg, #${colour1}, #${colour2})`;
          elems.settings.colour1.value = '#' + colour1;
          elems.settings.colour2.value = '#' + colour2;
          elems.settings.bio.value = bio;
          elems.settings.colour1.disabled = elems.settings.colour2.disabled = elems.settings.bio.disabled = false;
          elems.settings.bio.style.height = elems.settings.bio.scrollHeight + 1 + 'px';
        }).catch(err => {
          elems.settings.bioError.textContent = 'Something went wrong.';
          elems.settings.bioError.classList.remove('hidden');
        });
        askAPI('session=true&type=secret', {session: session.id}).then(secret => {
          elems.settings.secret.value = secret;
          elems.settings.secret.disabled = false;
          elems.settings.secret.style.height = elems.settings.secret.scrollHeight + 1 + 'px';
        }).catch(err => {
          elems.settings.secretError.textContent = 'Something went wrong.';
          elems.settings.secretError.classList.remove('hidden');
        });
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
        const [angle, colour1, colour2] = pfp.split('.');
        elems.user.pfp.style.backgroundImage = `linear-gradient(${angle}deg, #${colour1}, #${colour2})`;
      }).catch(() => {
        elems.user.joinDate.textContent = 'Not yet';
        elems.user.bio.textContent = 'Hello! I don\'t exist. Oh well.';
      });
    } else {
      currentView = 'home';
      if (search !== '') history.replaceState({}, '', './');
      elems.loadMore.disabled = true;
      askAPI('type=recent-posts&limit=20', {}, true).then(async posts => {
        [lastPostID, continueDiv] = await renderPosts(elems.posts, posts, session, pfps);
        elems.loadMore.disabled = false;
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
      if (e.target.classList.contains('sign-out')) {
        askAPI('session=true&type=signout', {session: session.id}).then(signOut).catch(checkSessionExpire());
        e.preventDefault();
      } else if (e.target.classList.contains('like-btn')) {
        const unlike = e.target.classList.contains('like-unlike') ? 'unlike' : 'like';
        let post = e.target.parentNode.parentNode;
        if (!post.classList.contains('post')) post = post.parentNode;
        const postID = post.dataset.id;
        const likeCount = post.querySelector('.like-count');
        e.target.classList.add('disabled');
        e.target.removeAttribute('href');
        askAPI(`session=true&type=${unlike}&post=${postID}`, {session: session.id}).then(likes => {
          e.target.classList.remove('disabled');
          e.target.classList.remove('like-' + unlike);
          const like = unlike === 'unlike' ? 'like' : 'unlike';
          e.target.classList.add('like-' + like);
          e.target.textContent = like;
          e.target.setAttribute('href', '#');
          if (likeCount) likeCount.textContent = likes;
        }).catch(checkSessionExpire(null, () => {
          e.target.classList.remove('disabled');
        }));
        e.preventDefault();
      } else if (e.target.classList.contains('respond-btn')) {
        const postContent = e.target.parentNode;
        const postID = postContent.parentNode.dataset.id;
        postContent.removeChild(e.target);
        const postarea = document.createElement('textarea');
        postarea.className = 'postarea';
        postarea.placeholder = 'start a controversy...'
        const error = document.createElement('p');
        error.className = 'error auth-p hidden';
        const postBtn = document.createElement('button');
        postBtn.className = 'auth-btn';
        postBtn.textContent = 'respond';
        postBtn.disabled = true;
        postContent.appendChild(postarea);
        postContent.appendChild(error);
        postContent.appendChild(postBtn);
        postarea.addEventListener('input', e => {
          postBtn.disabled = false;
        }, {once: true});
        postBtn.addEventListener('click', e => {
          postarea.disabled = postBtn.disabled = true;
          askAPI('session=true&type=post', {
            session: session.id,
            content: postarea.value,
            parent: postID
          }).then(postID => {
            switchView('?!' + postID);
          }).catch(checkSessionExpire(err => {
            error.classList.remove('hidden');
            if (err === 'too long') {
              error.textContent = 'Your argument is too long and boring.';
              postarea.focus();
            } else if (err === 'too short') {
              error.textContent = 'An empty response is no response at all.';
              postarea.focus();
            } else {
              error.textContent = 'Problem.';
            }
          }));
        }, {once: true});
        e.preventDefault();
      } else if (href && href[0] === '?') {
        switchView(href);
        e.preventDefault();
      }
    }
  });
  elems.signIn.username.addEventListener('keydown', e => {
    if (e.keyCode === 13) elems.signIn.password.focus();
  });
  clickOnEnter(elems.signIn.password, elems.signIn.submit);
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
      switchView('./');
    }).catch(err => {
      elems.signIn.username.disabled = elems.signIn.password.disabled = elems.signIn.submit.disabled = false;
      if (err === 'incorrect password') {
        elems.signIn.error.textContent = 'Incorrect password.';
        elems.signIn.password.focus();
      } else {
        elems.signIn.error.textContent = 'Problem.';
      }
      elems.signIn.error.classList.remove('hidden');
    });
  });
  elems.signUp.username.addEventListener('keydown', e => {
    if (e.keyCode === 13) elems.signUp.password.focus();
  });
  clickOnEnter(elems.signUp.password, elems.signUp.submit);
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
        switchView('./');
      }).catch(err => {
        elems.signUp.username.disabled = elems.signUp.password.disabled = elems.signUp.submit.disabled = false;
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
      elems.postContent.disabled = elems.postSubmit.disabled = false;
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
    }));
  });
  elems.settings.bio.addEventListener('input', e => {
    elems.settings.saveBio.disabled = false;
    elems.settings.saveBio.textContent = 'save';
  });
  elems.settings.saveBio.addEventListener('click', e => {
    elems.settings.saveBio.disabled = true;
    askAPI('session=true&type=setbio', {session: session.id, content: elems.settings.bio.value}).then(() => {
      elems.settings.saveBio.textContent = 'saved';
      elems.settings.bioError.classList.add('hidden');
    }).catch(checkSessionExpire(err => {
      if (err === 'too long') {
        elems.settings.bioError.textContent = 'Too detailed. Please simplify.';
        elems.settings.bio.focus();
      } else {
        elems.settings.bioError.textContent = 'Problem.';
      }
      elems.settings.bioError.classList.remove('hidden');
    }));
  });
  elems.settings.secret.addEventListener('input', e => {
    elems.settings.saveSecret.disabled = false;
    elems.settings.saveSecret.textContent = 'save';
  });
  elems.settings.saveSecret.addEventListener('click', e => {
    elems.settings.saveSecret.disabled = true;
    askAPI('session=true&type=setsecret', {session: session.id, content: elems.settings.secret.value}).then(() => {
      elems.settings.saveSecret.textContent = 'saved';
      elems.settings.secretError.classList.add('hidden');
    }).catch(checkSessionExpire(err => {
      if (err === 'too long') {
        elems.settings.secretError.textContent = 'You have too many secrets!';
        elems.settings.secret.focus();
      } else {
        elems.settings.secretError.textContent = 'Problem.';
      }
      elems.settings.secretError.classList.remove('hidden');
    }));
  });
  elems.settings.expiry.addEventListener('input', e => {
    elems.settings.saveExpiry.disabled = false;
    elems.settings.saveExpiry.textContent = 'save';
  });
  clickOnEnter(elems.settings.expiry, elems.settings.saveExpiry);
  elems.settings.saveExpiry.addEventListener('click', e => {
    elems.settings.saveExpiry.disabled = true;
    let time = +elems.settings.expiry.value;
    if (time !== -1) time *= 86400000; // days -> ms
    askAPI('session=true&type=setexpiry', {session: session.id, time: time}).then(() => {
      elems.settings.saveExpiry.textContent = 'saved';
      elems.settings.expiryError.classList.add('hidden');
    }).catch(checkSessionExpire(err => {
      if (err === 'too short') {
        elems.settings.expiryError.textContent = 'Such a short expiry length will be so short that you can\'t even be signed in long enough to undo it.';
        elems.settings.expiry.focus();
      } else {
        elems.settings.expiryError.textContent = 'Problem.';
      }
      elems.settings.expiryError.classList.remove('hidden');
    }));
  });
  elems.settings.oldPassword.addEventListener('keydown', e => {
    if (e.keyCode === 13) settings.newPassword.focus();
  });
  elems.settings.newPassword.addEventListener('input', e => {
    elems.settings.savePass.disabled = false;
    elems.settings.savePass.textContent = 'save';
  });
  clickOnEnter(elems.settings.newPassword, elems.settings.savePass);
  elems.settings.savePass.addEventListener('click', e => {
    elems.settings.savePass.disabled = true;
    askAPI('session=true&type=setpass', {session: session.id, password: elems.settings.newPassword.value}).then(() => {
      elems.settings.savePass.textContent = 'saved';
      elems.settings.oldPassword.value = elems.settings.newPassword.value = '';
      elems.settings.newPassError.classList.add('hidden');
    }).catch(checkSessionExpire(err => {
      if (err === 'dumb password') {
        elems.settings.newPassError.textContent = 'Please secure your password with at least one space character.';
        elems.settings.newPassword.focus();
      } else {
        elems.settings.newPassError.textContent = 'Problem.';
      }
      elems.settings.newPassError.classList.remove('hidden');
    }));
  });
  function calcAngle(client) {
    const rect = elems.settings.pfp.getBoundingClientRect();
    const calcAngle = 90 + Math.atan2(client.clientY - rect.y - rect.height / 2, client.clientX - rect.x - rect.width / 2) * 180 / Math.PI;
    elems.settings.savePFP.disabled = false;
    elems.settings.savePFP.textContent = 'save';
    elems.settings.pfpState[0] = Math.round((calcAngle + 360) % 360);
    const [angle, colour1, colour2] = elems.settings.pfpState;
    elems.settings.pfp.style.backgroundImage = `linear-gradient(${angle}deg, #${colour1}, #${colour2})`;
  }
  elems.settings.pfp.addEventListener('touchmove', e => {
    calcAngle(e.changedTouches[0]);
  });
  elems.settings.pfp.addEventListener('mousedown', e => {
    document.addEventListener('mousemove', calcAngle);
    document.addEventListener('mouseup', e => {
      document.removeEventListener('mousemove', calcAngle);
    }, {once: true});
  });
  elems.settings.colour1.addEventListener('input', e => {
    elems.settings.savePFP.disabled = false;
    elems.settings.savePFP.textContent = 'save';
    elems.settings.pfpState[1] = elems.settings.colour1.value.slice(1);
    const [angle, colour1, colour2] = elems.settings.pfpState;
    elems.settings.pfp.style.backgroundImage = `linear-gradient(${angle}deg, #${colour1}, #${colour2})`;
  });
  elems.settings.colour2.addEventListener('input', e => {
    elems.settings.savePFP.disabled = false;
    elems.settings.savePFP.textContent = 'save';
    elems.settings.pfpState[2] = elems.settings.colour2.value.slice(1);
    const [angle, colour1, colour2] = elems.settings.pfpState;
    elems.settings.pfp.style.backgroundImage = `linear-gradient(${angle}deg, #${colour1}, #${colour2})`;
  });
  elems.settings.savePFP.addEventListener('click', e => {
    elems.settings.savePFP.disabled = true;
    askAPI('session=true&type=setpfp', {session: session.id, newpfp: elems.settings.pfpState.join('.')}).then(() => {
      elems.settings.savePFP.textContent = 'saved';
      elems.settings.pfpError.classList.add('hidden');
    }).catch(checkSessionExpire(err => {
      elems.settings.pfpError.textContent = 'Problem.';
      elems.settings.pfpError.classList.remove('hidden');
    }));
  });
  elems.loadMore.addEventListener('click', e => {
    elems.loadMore.disabled = true;
    askAPI('type=recent-posts&limit=21&from=' + lastPostID, {}, true).then(async posts => {
      const len = Object.keys(posts).length;
      console.log(len);
      if (len) {
        delete posts[lastPostID];
        [lastPostID, continueDiv] = await renderPosts(continueDiv, posts, session, pfps);
        if (len >= 21) elems.loadMore.disabled = false;
      }
    });
  });
}, false);
