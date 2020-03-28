'use strict'

function loadEditor (value) {
  const editor = CodeMirror(document.body, {
    value,
    mode: 'text/html',
    lineNumbers: true,
    matchBrackets: true,
    matchTags: true,
    viewportMargin: Infinity,

    theme: 'material',
    lineWrapping: true
  })

  return editor
}

function loadHTML (html, longLength = 300, previewChars = 30) {
  const longLines = new Map()
  const lines = html.split(/\r?\n/)
    .map((line, i) => {
      if (line.length >= longLength) {
        longLines.set(i, line)
        return line.slice(0, previewChars) + line.slice(-previewChars)
      } else {
        return line
      }
    })
  return {
    value: lines.join('\n'),
    longLines,
    previewChars
  }
}

function lockLongLines (editor, longLines) {
  const markers = Array.from(longLines.keys(), lineNumber => {
    // https://stackoverflow.com/a/17482204
    const longLineBadge = document.createElement('span')
    longLineBadge.className = 'long-line-badge'
    editor.setBookmark({ line: lineNumber, ch: 30 }, {
      widget: longLineBadge
    })
    return editor.markText({ line: lineNumber, ch: 0 }, { line: lineNumber }, {
      readOnly: true,
      className: 'readonly'
    })
  })
  return function getPositions () {
    return Array.from(longLines, ([lineNumber, line], i) => {
      return {
        line,
        position: markers[i].find()
      }
    })
  }
}

function exportHTML (editor, markerPositions) {
  const value = editor.getValue()
  let html = ''
  let lastIndex = 0
  for (const { line, position: { from, to } } of markerPositions) {
    const fromIndex = editor.indexFromPos(from)
    const toIndex = editor.indexFromPos(to)
    html += value.slice(lastIndex, fromIndex) + line
    lastIndex = toIndex
  }
  return html + value.slice(lastIndex)
}

const navbar = document.getElementById('navbar')
const fileNameElem = document.getElementById('file-name')

function init (fileName, htmlFile) {
  const { value, longLines } = loadHTML(htmlFile)
  const editor = loadEditor(value)
  const getPositions = lockLongLines(editor, longLines)

  const saveBtn = document.createElement('button')
  saveBtn.className = 'save-btn'
  saveBtn.textContent = 'Save'
  saveBtn.addEventListener('click', e => {
    download(exportHTML(editor, getPositions()), fileName, 'text/html')
  })
  navbar.appendChild(saveBtn)

  fileNameElem.textContent = fileName
  document.title += ' - Editing ' + fileName

  window.addEventListener('beforeunload', e => {
    e.preventDefault()
    e.returnValue = ''
  })
}

const fileInput = document.getElementById('html')
fileInput.addEventListener('change', e => {
  if (fileInput.files[0]) {
    document.body.removeChild(fileInput)
    document.body.classList.add('no-file-input')
    console.log(fileInput.files[0])
    fileInput.files[0].text().then(htmlFile => {
      init(fileInput.files[0].name, htmlFile)
    })
  }
})
