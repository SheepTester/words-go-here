const colours = [
  'lightcoral',
  'lightsalmon',
  'darkorange',
  'coral',
  'orange',
  'sandybrown',
  'tomato'
]
const colour = colours[(Math.random() * colours.length) | 0]
const swName = `sw v13 ${(Math.random() * 10) | 0}`

function log (...values) {
  console.log(`%c[${swName}]`, `color: ${colour}; font-weight: bold`, ...values)
}
function logEvent (event, ...values) {
  console.log(
    `%c[${swName}] %c${event.type} %cevent`,
    `color: ${colour}; font-weight: bold`,
    'color: khaki',
    'color: unset',
    event,
    ...values
  )
}

const skipWaitingImmediately = true

self.addEventListener('install', e => {
  logEvent(e, 'Shall start caching...')
  e.waitUntil(
    caches
      .open('wah.')
      .then(cache => cache.addAll(['./', './main.js', './text.txt']))
      .then(() => {
        if (skipWaitingImmediately) {
          log('Finished caching. Shall skip waiting...')
          self.skipWaiting().then(() => {
            log('Skipped waiting.')
          })
        } else {
          log(
            'Finished caching. Tip: Call `skipWaiting()` to run `self.skipWaiting()`'
          )
        }
      })
  )
})

self.addEventListener('fetch', e => {
  logEvent(e, e.request.url)
  e.respondWith(
    caches
      .match(e.request)
      .then(response => response || caches.match('./'))
      .then(r =>
        r.text().then(content => {
          log(`Finished getting ${e.request.url} from cache.`)
          return new Response(
            content.replace(
              /{SW_REPLACE}/g,
              `${new Date()
                .toISOString()
                .replace('T', '')
                .replace('Z', ' UTC')} (v13)`
            ),
            { headers: r.headers }
          )
        })
      )
  )
})

self.addEventListener('activate', e => {
  logEvent(e, 'Tip: Call `claim()` to run `clients.claim()`')
})

self.addEventListener('message', e => {
  logEvent(e)
  if (e.data === 'skipWaiting') {
    log('| Shall skip waiting...')
    self.skipWaiting().then(() => {
      log('Skipped waiting.')
    })
  } else if (e.data === 'claim') {
    log('| Shall claim clients...')
    clients.claim().then(() => {
      log('Claimed clients.')
    })
  }
})
