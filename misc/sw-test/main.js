function log (...values) {
  console.log('%c[window]', 'color: aqua; font-weight: bold', ...values)
}
function logEvent (event, ...values) {
  console.log(
    `%c[window] %c${event.type} %cevent`,
    'color: aqua; font-weight: bold',
    'color: khaki',
    'color: unset',
    event,
    ...values
  )
}

function setRegis (registration, source = '[unknown]') {
  if (window.registration && window.registration !== registration) {
    log(
      `${source}: Odd, the registrations are different.`,
      window.registration,
      registration
    )
  }
  window.registration = registration
}

const reloadOnUpdate = true

log("{SW_REPLACE} should be replaced by the SW if it's active.")
log('| Registering service worker...')
navigator.serviceWorker.register('./sw.js').then(registration => {
  log('.register() resolved', registration)
  setRegis(registration, '.register()')
  const wasInstalling = registration.installing
  registration.addEventListener('updatefound', e => {
    const installing = registration.installing
    logEvent(
      e,
      'Is registration.installing the same as before?',
      wasInstalling === installing
    )
    if (wasInstalling !== installing) {
      installing.addEventListener('statechange', e => {
        logEvent(e, installing.state, '(new)')
        if (reloadOnUpdate && installing.state === 'activated') {
          log(
            "Shall reload, since there's a new update, and the new service worker is activated (which I think implies a `controllerchange`)!"
          )
          window.location.reload()
        }
      })
    }
  })

  log('| sw scope', registration.scope)
  log('| sw installing', wasInstalling)
  log('| sw waiting', registration.waiting)
  log('| sw active', registration.active)

  const sw =
    registration.active || registration.waiting || registration.installing
  if (sw) {
    sw.addEventListener('statechange', e => {
      logEvent(e, sw.state)
    })
  } else {
    log("| Can't get a service worker object, oh well")
  }
})
log('| sw controller', navigator.serviceWorker.controller)
navigator.serviceWorker.ready.then(registration => {
  log('.ready resolved', registration)
  setRegis(registration, '.ready')
  fetch('./text.txt')
    .then(r => r.text())
    .then(text => {
      log('text.txt contains', text)
    })
})
navigator.serviceWorker.addEventListener('controllerchange', logEvent)
navigator.serviceWorker.addEventListener('error', logEvent)
navigator.serviceWorker.addEventListener('message', logEvent)
navigator.serviceWorker.getRegistration().then(registration => {
  log('.getRegistration() resolved', registration)
  if (registration) {
    setRegis(registration, '.getRegistration()')
  }
})
navigator.serviceWorker.getRegistrations().then(registrations => {
  log('.getRegistrations() resolved', registrations)
  if (registrations[0]) {
    setRegis(registrations[0], '.getRegistrations()[0]')
  }
})

function sendToSw (message) {
  return worker => {
    if (worker instanceof ServiceWorker) {
      worker.postMessage(message)
    } else {
      throw new TypeError(
        'The first argument must be an instance of ServiceWorker. Try registration.active or navigator.serviceWorker.controller.'
      )
    }
  }
}
const skipWaiting = sendToSw('skipWaiting')
const claim = sendToSw('claim')
