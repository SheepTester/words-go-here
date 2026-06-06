export async function setup ({ destroy, ...availabilityArgs }) {
  const status = document.getElementById('setup-status')

  if (!window.LanguageModel) {
    status.style.display = 'flex'
    status.innerHTML = [
      '<h2>Blessed you are!</h2>',
      '<p>Your browser has spared you from <a href="https://developer.chrome.com/docs/ai/prompt-api" class="link">Google\'s AI whims</a>, so websites can\'t just download 4 GB on your computer willy nilly. However, that means this web page is of little use to you. Switch to Chrome if you really want to download 4 GB just for a web demo.</p>'
    ].join('')
    await new Promise(() => {})
  }

  const availability = await LanguageModel.availability(availabilityArgs)
  if (availability === 'unavailable') {
    status.style.display = 'flex'
    status.innerHTML = [
      '<h2>Blessed you are!</h2>',
      '<p>Your device is so weak it has been spared from <a href="https://developer.chrome.com/docs/ai/prompt-api" class="link">Google\'s AI whims</a>, so websites can\'t just download 4 GB on your computer willy nilly. However, that means this web demo is of little use to you. Switch to a <a href="https://developer.chrome.com/docs/ai/prompt-api#hardware-requirements" class="link">more expensive device</a> if you want AI slop.</p>'
    ].join('')
    await new Promise(() => {})
  }

  status.className = 'normal'
  if (availability === 'downloadable' || availability === 'available') {
    status.style.display = 'flex'
    if (availability === 'downloadable') {
      status.innerHTML = [
        '<h2>Your computer is pure</h2>',
        '<p>A random website hasn\'t already silently downloaded a 4 GB LLM on your computer (since <a href="https://developer.chrome.com/docs/ai/prompt-api" class="link">Chrome lets them do that</a>), so this website will be the first. Press the button below when you\'re ready.</p>',
        '<div class="button-row"><button type="button" class="button primary-btn" id="setup-download">Download four gigabytes</button></div>',
        '<progress id="setup-progress" min="0" max="100" value="0">your browser doesnt support progress</progress>',
        "<p>Tip: It can get stuck around 90%. I think it means it finished downloading the model, so it's moving the gigabytes around on your computer.</p>"
      ].join('')
      await new Promise(resolve =>
        document
          .getElementById('setup-download')
          .addEventListener('click', resolve)
      )
    } else {
      status.innerHTML = [
        '<p>Getting ready...</p>',
        '<progress id="setup-progress" min="0" max="100" value="0">your browser doesnt support progress</progress>'
      ].join('')
    }
    const progress = document.getElementById('setup-progress')
    const session = await LanguageModel.create({
      ...availabilityArgs,
      monitor: monitor => {
        monitor.addEventListener('downloadprogress', e => {
          progress.value = e.loaded * 100
        })
      }
    })
    status.style.display = 'none'
    if (destroy) {
      session.destroy()
    } else {
      return session
    }
  }
}
