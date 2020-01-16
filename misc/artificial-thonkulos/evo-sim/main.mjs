import { Container, View, Text, Button, Canvas } from './ui.mjs'

let currentGeneration
const views = {
  start: new View('start-view', [
    new Text('title', 'Epic evolution'),
    new Button('start-btn', 'Start', btn => {
      document.body.classList.add('state-gen0')
      btn.elem.disabled = true
      sendWorker({ type: 'start' }).then(({ creatures }) => {
        currentGeneration = creatures.map(creature => {
          creature = new Creature(creature)
          creature.reset()
          return creature
        })
        showView(views.creatures)
      })
    })
  ]),
  creatures: new View('creatures-view', [
    new Canvas('creatures', (wrapper, view) => {
      const { canvas, ctx: c } = wrapper
      wrapper.on('repaint', () => {
        c.clearRect(0, 0, wrapper.width, wrapper.height)

        const cols = Math.round(Math.sqrt(currentGeneration.length * wrapper.width / wrapper.height))
        const rows = Math.ceil(currentGeneration.length / cols)
        const horizSpacing = wrapper.width / (cols + 1)
        const vertSpacing = wrapper.height / (rows + 1)
        for (let i = 0; i < currentGeneration.length; i++) {
          c.save()
          c.translate(
            (i % cols + 1) * horizSpacing,
            Math.floor(i / cols + 1) * vertSpacing
          )
          // Creatures are approximately 1.1 un tall at most
          c.scale(vertSpacing / 2 / 1.1, vertSpacing / 2 / 1.1)
          currentGeneration[i].render(c)
          c.restore()
        }
      })
    }),
    new Container('creature-btns', [
      new Container('gen0', [
        new Text('', 'Here\'s a thousand randomly-generated creatures to start with'),
        new Button('', 'Okay', () => {
          showView(views.generations)
        })
      ])
    ])
  ]),
  generations: new View('generations-view', [
    new Container('gen-side gen-left', [
      new Text('heading', 'Generation 0'),
      new Canvas('line-graph-wrapper'),
      new Canvas('area-graph-wrapper')
    ]),
    new Container('gen-side gen-right', [
      new Container('gens-buttons', [
        new Button('', 'Watch next generation'),
        new Button('', 'Generate immediately'),
        new Button('', 'Generate automatically')
      ]),
      new Container('winners'),
      new Canvas('histogram-wrapper')
    ])
  ])
}
let currentView
function showView (view) {
  if (currentView) {
    currentView.hide()
  }
  view.show()
  view.resize()
  currentView = view
}
window.addEventListener('resize', e => {
  if (currentView) {
    currentView.resize()
  }
})

const worker = new Worker('./worker.js')
const expectingResponses = []
function sendWorker (data, response = true) {
  if (response) {
    return new Promise(resolve => {
      expectingResponses.push({ responseId: data.type, resolve })
      worker.postMessage(data)
    })
  } else {
    worker.postMessage(data)
  }
}
worker.addEventListener('message', ({ data }) => {
  switch (data.type) {
    case 'response':
      for (let i = 0; i < expectingResponses.length; i++) {
        if (data.response === expectingResponses[i].responseId) {
          expectingResponses[i].resolve(data)
          expectingResponses.splice(i, 1)
          i--
        }
      }
      break
  }
})
sendWorker({ type: 'init', key: 'epic' }).then(() => {
  showView(views.start)
})
