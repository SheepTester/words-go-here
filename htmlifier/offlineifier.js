function offlineify ({
  log = console.log
} = {}) {
  function toDataURI (response) {
    return response.blob().then(blob => new Promise(resolve => {
      const reader = new FileReader()
      reader.addEventListener('load', e => {
        resolve(reader.result)
      }, { once: true })
      reader.readAsDataURL(blob)
    }))
  }
  function toText (response) {
    return response.ok ? response.text() : Promise.reject(response.status)
  }
  return Promise.all([
    fetch('./index.html').then(toText),
    fetch('https://sheeptester.github.io/scratch-vm/vm.min.js').then(toText),
    fetch('./hacky-file-getter.js').then(toText),
    fetch('./download.js').then(toText),
    fetch('./template.html').then(toDataURI)
  ]).then(([html, vm, hackyFileGetter, downloader, template]) => {
    html = html
      .replace('<body>', '<body class="offline">')
      .replace('<script src="./hacky-file-getter.js" charset="utf-8"></script>', `<script>${hackyFileGetter.replace(/<\/script>/g, '')}</script>`)
      .replace('<script src="./download.js" charset="utf-8"></script>', `<script>${downloader.replace(/<\/script>/g, '')}</script>`)
      .replace(/<!-- no-offline -->.*?<!-- \/no-offline -->/g, '')
      .replace(/\/\* no-offline \*\/.*?\/\* \/no-offline \*\//g, '')
      .replace('// offline-vm-src', `document.getElementById('vm-src').innerHTML`)
      .replace('// fetch template', JSON.stringify(template))
      // Do this last because it phat
      .replace('<script src="https://sheeptester.github.io/scratch-vm/vm.min.js" charset="utf-8"></script>', `<script id="vm-src">${vm.replace(/<\/script>/g, '')}</script>`)
    download(html, 'htmlifier-offline.html', 'text/html')
  })
}
