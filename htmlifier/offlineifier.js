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
    return response.ok ? response.text() : Promise.reject(new Error(response.status))
  }
  function removeScriptTag (js) {
    return js.replace(/<\/script>/g, '')
  }
  log('Getting all required files')
  return Promise.all([
    fetch('./index.html').then(toText),
    fetch('https://sheeptester.github.io/scratch-vm/16-9/vm.min.js')
      .then(toText)
      .then(async vmCode => {
        let extensionWorker
        const extensionWorkerMatch = vmCode.match(extensionWorkerGet)
        if (!extensionWorkerMatch) return Promise.reject(new Error('Cannot find extension-worker.js'))
        const workerCode = await fetch('https://sheeptester.github.io/scratch-vm/16-9/' + extensionWorkerMatch[1])
          .then(r => r.text())
        return [vmCode, workerCode].map(removeScriptTag)
      }),
    fetch('./hacky-file-getter.js').then(toText).then(removeScriptTag),
    fetch('./download.js').then(toText).then(removeScriptTag),
    fetch('./template.html').then(toDataURI),
    fetch('./main.css').then(toText)
  ]).then(([html, [vm, extensionWorker], hackyFileGetter, downloader, template, css]) => {
    html = html
      .replace('<body>', '<body class="offline">')
      // Using functions to avoid $ substitution
      .replace('<script src="./hacky-file-getter.js" charset="utf-8"></script>', () => `<script>${hackyFileGetter}</script>`)
      .replace('<script src="./download.js" charset="utf-8"></script>', () => `<script>${downloader}</script>`)
      // . wildcard in regex doesn't include newlines lol
      // https://stackoverflow.com/a/45981809
      .replace(/<!-- no-offline -->[^]*?<!-- \/no-offline -->/g, '')
      .replace(/\/\* no-offline \*\/[^]*?\/\* \/no-offline \*\//g, '')
      .replace('// [offline-vm-src]', `Promise.resolve(document.getElementById('vm-src').innerHTML)`)
      .replace('// [offline-extension-worker-src]', `const workerCode = document.getElementById('worker-src').innerHTML`)
      .replace('<link rel="stylesheet" href="./main.css">', () => `<style>${css}</style>`)
      .replace('// [template]', () => JSON.stringify(template))
      // Do this last because it phat
      // javascript/worker: https://www.html5rocks.com/en/tutorials/workers/basics/
      .replace('<script src="https://sheeptester.github.io/scratch-vm/16-9/vm.min.js" charset="utf-8"></script>', () => `<script id="vm-src">${vm}</script><script id="worker-src" type="javascript/worker">${extensionWorker}</script>`)
    log('Attempting to download...')
    download(html, 'htmlifier-offline.html', 'text/html')
    log('All good!')
  })
}
