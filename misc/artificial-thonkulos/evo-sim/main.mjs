import { Container, View, Text, Button, Fieldset, Canvas } from './ui.mjs'
import { RenderSimulation } from '../render-simulation.mjs'
import { easeInOutQuart } from '../utils.mjs'

let generation = 0
let currentGeneration
function nextGeneration () {
  return sendWorker({ type: 'simulate' }).then(({ creatures }) => {
    currentGeneration = creatures.map(data => new Creature(data).reset())
  })
}

const views = {
  start: new View('start-view', [
    new Text('title', 'Epic evolution'),
    new Button('start-btn', 'Start', btn => {
      document.body.classList.add('state-gen0')
      btn.elem.disabled = true
      sendWorker({ type: 'start' }).then(({ creatures }) => {
        currentGeneration = creatures.map(creature => new Creature(creature).reset())
        showView(views.creatures)
      })
    })
  ]),
  creatures: new View('creatures-view', [
    new Canvas('creatures', (wrapper, view) => {
      const { canvas, ctx: c } = wrapper
      let cols, rows, horizSpacing, vertSpacing
      wrapper.on('repaint', () => {
        if (animationTime !== null) return

        c.clearRect(0, 0, wrapper.width, wrapper.height)

        cols = Math.round(Math.sqrt(currentGeneration.length * wrapper.width / wrapper.height))
        rows = Math.ceil(currentGeneration.length / cols)
        horizSpacing = wrapper.width / (cols + 1)
        vertSpacing = wrapper.height / (rows + 1)
        for (const creature of currentGeneration) {
          c.save()
          const index = creature.data.rank === undefined || currentGeneration.notSorted
            ? creature.data.id : creature.data.rank
          c.translate(
            (index % cols + 1) * horizSpacing,
            Math.floor(index / cols + 1) * vertSpacing
          )
          // Creatures are approximately 1.1 un tall at most
          c.scale(vertSpacing / 2 / 1.1, vertSpacing / 2 / 1.1)
          creature.render(c)
          c.restore()
        }
      })

      let showingPreview = false
      function setPreview (e) {
        const rect = wrapper.elem.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) / horizSpacing - 0.5)
        const y = Math.floor((e.clientY - rect.top) / vertSpacing)
        const index = x + y * cols
        const prop = currentGeneration[0].data.rank === undefined ||
          currentGeneration.notSorted ? 'id' : 'rank'
        const creature = currentGeneration.find(creature => creature.data[prop] === index)
        if (creature && x >= 0 && x < cols && y >= 0 && y < rows) {
          views.creaturePreview.emit('preview', creature)
          showingPreview = true
        }
      }
      function hidePreview () {
        if (showingPreview) {
          views.creaturePreview.hide()
          showingPreview = false
        }
      }
      wrapper.elem.addEventListener('pointerdown', setPreview)
      wrapper.elem.addEventListener('pointermove', setPreview)
      wrapper.elem.addEventListener('pointerleave', hidePreview)

      const ANIM_LENGTH = 3
      let animationTime = null
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
        for (const creature of currentGeneration) {
          creature.initX = (creature.data.id % cols + 1)
          creature.initY = Math.floor(creature.data.id / cols + 1)
          creature.destX = (creature.data.rank % cols + 1)
          creature.destY = Math.floor(creature.data.rank / cols + 1)
        }
        currentGeneration.notSorted = false

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
            currentGeneration.notSorted = true
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
        simTime: SIM_TIME
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
    new Text('creature-info', '', (text, view) => {
      view.on('info', creature => {
        const lines = [
          `Creature ${creature.data.id}`,
          `Class n${creature.nodes.length}m${creature.muscles.length}`
        ]
        if (creature.data.rank !== undefined) {
          lines.push(`Ranked #${creature.data.rank + 1}`)
        }
        if (creature.data.fitness !== undefined) {
          lines.push(`Fitness: ${creature.data.fitness.toFixed(4)}`)
        }
        text.elem.textContent = lines.join('\n')
      })
    }),
    new Canvas('preview', (wrapper, view) => {
      let pointerX, pointerY, width, height, windowWidth, windowHeight
      document.addEventListener('pointermove', e => {
        pointerX = e.clientX
        pointerY = e.clientY
        if (!view.hidden) {
          view.elem.style.left = (width && pointerX + width > windowWidth ? pointerX - width : pointerX) + 'px'
          view.elem.style.top = (height && pointerY + height > windowHeight ? pointerY - height : pointerY) + 'px'
        }
      })
      view.on('resize', onReady => {
        const rect = view.elem.getBoundingClientRect()
        width = rect.width
        height = rect.height
        windowWidth = window.innerWidth
        windowHeight = window.innerHeight
        return onReady.then(() => {
          view.elem.style.left = (pointerX + width > windowWidth ? pointerX - width : pointerX) + 'px'
          view.elem.style.top = (pointerY + height > windowHeight ? pointerY - height : pointerY) + 'px'
        })
      })

      // Sad code repetition. Maybe one day I'll derepetitivify it
      const { canvas, ctx: c, sizeReady } = wrapper
      let creature, scrollX, scrollY, clock

      const renderer = new RenderSimulation({
        render: () => {
          c.fillStyle = clock > 15 ? '#6095a9' : 'skyblue'
          c.fillRect(0, 0, wrapper.width, wrapper.height)

          c.fillStyle = 'forestgreen'
          c.fillRect(0, -scrollY, wrapper.width, wrapper.height + scrollY)

          c.fillStyle = 'black'
          c.textBaseline = 'top'
          c.font = '16px monospace'
          c.fillText(`Time: ${clock.toFixed(2)}s`, 5, 2)
          c.fillText(`Distance: ${creature.position().x.toFixed(4)}m`, 5, 25)

          c.save()
          c.translate(-scrollX, -scrollY)
          // The ~1.1 un tall creature should take up 60% of the screen height
          c.scale(wrapper.height * 0.1 / 1.1, wrapper.height * 0.1 / 1.1)
          creature.render(c)
          c.restore()
        },
        simulate: time => {
          creature.sim(time)
          clock += time
        },
        simTime: SIM_TIME
      })
      view.on('preview', previewCreature => {
        if (creature === previewCreature) return
        if (view.hidden) {
          view.show()
          view.resize()
        }
        creature = previewCreature
        view.emit('info', creature)
        clock = 0
        creature.reset()
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
  if (!views.creaturePreview.hidden) {
    views.creaturePreview.resize()
  }
})
views.creaturePreview.addTo(document.body)

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
