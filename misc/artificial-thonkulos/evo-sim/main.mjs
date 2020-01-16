import { Container, View, Text, Button, Fieldset, Canvas } from './ui.mjs'
import { RenderSimulation } from '../render-simulation.mjs'
import { easeInOutQuart } from '../utils.mjs'

let generation = 0
let currentGeneration
function nextGeneration () {
  return sendWorker({ type: 'simulate' }).then(({ creatures }) => {
    currentGeneration = creatures.map(data => {
      const creature = new Creature(data)
      creature.fitness = data.fitness
      creature.reset()
      return creature
    })
  })
}

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
        if (animationTime !== null) return

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

      const ANIM_LENGTH = 3
      let animationTime = null, cols, rows
      const sortingAnimation = new RenderSimulation({
        render: (_, elapsed) => {
          if (animationTime === null) return

          animationTime += elapsed
          let progress = Math.min(animationTime / ANIM_LENGTH, 1)
          if (progress === 1) {
            sortingAnimation.stop()
            document.body.classList.remove('state-sorting')
            document.body.classList.add('state-sorted')
            animationTime = null
          }
          const position = easeInOutQuart(progress)

          c.clearRect(0, 0, wrapper.width, wrapper.height)
          const horizSpacing = wrapper.width / (cols + 1)
          const vertSpacing = wrapper.height / (rows + 1)
          for (const creature of currentGeneration) {
            c.save()
            c.translate(
              (position * (creature.destX - creature.initX) + creature.initX) * horizSpacing,
              (position * (creature.destY - creature.initY) + creature.initY) * vertSpacing
            )
            c.scale(vertSpacing / 2 / 1.1, vertSpacing / 2 / 1.1)
            creature.render(c)
            c.restore()
          }
        },
        // Don't even dare try to simulate anything
        maxDelay: 0
      })
      view.on('sort', () => {
        cols = Math.round(Math.sqrt(currentGeneration.length * wrapper.width / wrapper.height))
        rows = Math.ceil(currentGeneration.length / cols)
        for (let i = 0; i < currentGeneration.length; i++) {
          currentGeneration[i].initX = (i % cols + 1)
          currentGeneration[i].initY = Math.floor(i / cols + 1)
        }
        currentGeneration.sort((a, b) => b.fitness - a.fitness)
        for (let i = 0; i < currentGeneration.length; i++) {
          currentGeneration[i].destX = (i % cols + 1)
          currentGeneration[i].destY = Math.floor(i / cols + 1)
        }

        animationTime = 0
        sortingAnimation.start()
      })
    }),
    new Container('creature-btns', [
      new Container('gen0', [
        new Text('', 'Here\'s a thousand randomly-generated creatures to start with'),
        new Button('', 'Okay', () => {
          document.body.classList.remove('state-gen0')
          showView(views.generations)
        })
      ]),
      new Container('results', [
        new Text('', 'Here\'re the results!'),
        new Button('', 'Sort', btn => {
          document.body.classList.remove('state-results')
          document.body.classList.add('state-sorting')
          btn.view.emit('sort')
        })
      ]),
      new Container('sorting', [
        new Text('', 'Sorting!')
      ]),
      new Container('sorted', [
        new Text('', 'From the top to bottom are the fastest to slowest.'),
        new Button('', 'Semigenocide', () => {
          document.body.classList.remove('state-sorted')
        })
      ])
    ])
  ]),
  generations: new View('generations-view', [
    new Container('gen-side gen-left', [
      new Text('heading', 'Generation 0'),
      new Canvas('line-graph'),
      new Canvas('area-graph')
    ]),
    new Container('gen-side gen-right', [
      new Fieldset('gens-buttons', [
        new Button('', 'Watch next generation', () => {
          showView(views.watch)
        }),
        new Button('', 'Generate immediately', btn => {
          btn.parent.elem.disabled = true
          nextGeneration().then(() => {
            btn.parent.elem.disabled = false
            document.body.classList.add('state-results')
            showView(views.creatures)
          })
        }),
        new Button('', 'Generate automatically')
      ]),
      new Container('winners'),
      new Canvas('histogram')
    ])
  ]),
  watch: new View('watch-view', [
    new Canvas('watch', (wrapper, view) => {
      const { canvas, ctx: c, sizeReady } = wrapper
      let current, scrollX, scrollY, clock, stop, creatures, nextGenerationReady

      const renderer = new RenderSimulation({
        render: () => {
          if (stop) return

          c.clearRect(0, 0, wrapper.width, wrapper.height)
          c.fillStyle = 'forestgreen'
          c.fillRect(0, -scrollY, wrapper.width, wrapper.height + scrollY)

          if (current === null) return
          c.fillStyle = 'black'
          c.textBaseline = 'top'
          c.font = '16px monospace'
          c.fillText(`Creature ${current + 1} of ${creatures.length}`, 5, 5)
          c.fillText(`Time: ${clock.toFixed(2)}s`, 5, 25)
          c.fillText(`Distance: ${creatures[current].position().x.toFixed(2)}m`, 5, 45)

          c.save()
          c.translate(-scrollX, -scrollY)
          // The ~1.1 un tall creature should take up 60% of the screen height
          c.scale(wrapper.height * 0.1 / 1.1, wrapper.height * 0.1 / 1.1)
          creatures[current].render(c)
          c.restore()
        },
        simulate: time => {
          if (stop) return

          if (current === null || clock > 15) {
            clock = 0
            if (current === null) {
              current = 0
            } else {
              current++
              if (current >= creatures.length) {
                stop = true
                nextGenerationReady.then(() => {
                  document.body.classList.add('state-results')
                  showView(views.creatures)
                })
                return
              }
            }
          }

          creatures[current].sim(time)
          clock += time
        },
        simTime: SIM_TIME,
        speed: 1000
      })
      view.on('show', () => {
        creatures = currentGeneration
        nextGenerationReady = nextGeneration()
        sizeReady.then(() => {
          stop = false
          current = null
          scrollX = -wrapper.width / 2
          scrollY = -wrapper.height + 50
          renderer.start()
        })
      })
      view.on('hide', () => {
        renderer.stop()
      })
    })
  ]),
  creaturePreview: new View('creature-preview', [
    new Canvas('preview', (wrapper, view) => {
      let pointerX, pointerY, width, height, windowWidth, windowHeight
      document.addEventListener('pointermove', e => {
        pointerX = e.clientX
        pointerY = e.clientY
        if (!view.hidden) {
          view.style.left = (width && pointerX + width > windowWidth ? windowWidth - width : pointerX) + 'px'
          view.style.top = (height && pointerY + height > windowHeight ? windowHeight - height : pointerY) + 'px'
        }
      })
      view.on('resize', onReady => {
        const rect = view.elem.getBoundingClientRect()
        width = rect.width
        height = rect.height
        windowWidth = window.innerWidth
        windowHeight = window.innerHeight
        return onReady.then(() => {
          view.style.left = (pointerX + width > windowWidth ? windowWidth - width : pointerX) + 'px'
          view.style.top = (pointerY + height > windowHeight ? windowHeight - height : pointerY) + 'px'
        })
      })

      // Sad code repetition. Maybe one day I'll derepetitivify it
      const { canvas, ctx: c, sizeReady } = wrapper
      let creature, scrollX, scrollY, clock

      const renderer = new RenderSimulation({
        render: () => {
          c.clearRect(0, 0, wrapper.width, wrapper.height)
          c.fillStyle = 'forestgreen'
          c.fillRect(0, -scrollY, wrapper.width, wrapper.height + scrollY)

          c.fillStyle = 'black'
          c.textBaseline = 'top'
          c.font = '16px monospace'
          c.fillText(`Time: ${clock.toFixed(2)}s`, 5, 2)
          c.fillText(`Distance: ${creatures[current].position().x.toFixed(2)}m`, 5, 25)

          c.save()
          c.translate(-scrollX, -scrollY)
          // The ~1.1 un tall creature should take up 60% of the screen height
          c.scale(wrapper.height * 0.1 / 1.1, wrapper.height * 0.1 / 1.1)
          creatures[current].render(c)
          c.restore()
        },
        simulate: time => {
          creatures[current].sim(time)
          clock += time
        },
        simTime: SIM_TIME
      })
      view.on('preview', previewCreature => {
        view.show()
        creature = previewCreature
        sizeReady.then(() => {
          if (!creature) return // In case it is aborted early
          scrollX = -wrapper.width / 2
          scrollY = -wrapper.height + 50
          renderer.start()
        })
      })
      view.on('hide', () => {
        creature = null
        renderer.stop()
      })
    })
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
  if (!view.creaturePreview.hidden) {
    view.creaturePreview.resize()
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
