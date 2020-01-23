import { Container, View, Text, Button, Fieldset, Canvas } from './ui.mjs'
import { RenderSimulation } from '../render-simulation.mjs'
import { easeInOutQuart } from '../utils.mjs'

const HISTOGRAM_INTERVAL = 0.2
const CREATURE_SIZE = 3
const history = []
const classes = new Map()
let maxScore = 0
let generation
let currentGeneration
function creatureify (creatures) {
  return creatures.map(data => new Creature(data).reset())
}
function recordGeneration () {
  const histogram = new Map()
  const demographics = new Map()
  for (const creature of currentGeneration) {
    const interval = Math.floor(creature.data.fitness / HISTOGRAM_INTERVAL)
    if (histogram.has(interval)) {
      histogram.set(interval, histogram.get(interval) + 1)
    } else {
      histogram.set(interval, 1)
    }
    const creatureClass = `n${creature.nodes.length}m${creature.muscles.length}`
    if (demographics.has(creatureClass)) {
      demographics.set(creatureClass, demographics.get(creatureClass) + 1)
    } else {
      demographics.set(creatureClass, 1)
    }
  }
  let histogramMax = 0
  for (const [_, count] of histogram) {
    if (count > histogramMax) histogramMax = count
  }
  if (currentGeneration[0].data.fitness > maxScore) {
    maxScore = currentGeneration[0].data.fitness
  }
  const percentiles = {}
  for (let i = 0; i <= 10; i++) {
    percentiles[100 - i * 10] = currentGeneration[Math.min(
      Math.floor(currentGeneration.length * i / 10),
      currentGeneration.length - 1
    )].data.fitness
  }
  for (let i = 1; i < 10; i++) {
    percentiles[100 - i] = currentGeneration[Math.min(
      Math.floor(currentGeneration.length * i / 100),
      currentGeneration.length - 1
    )].data.fitness
    percentiles[i] = currentGeneration[Math.min(
      Math.floor(currentGeneration.length * (1 - i / 100)),
      currentGeneration.length - 1
    )].data.fitness
  }
  history.push({
    histogram,
    histogramMax,
    demographics,
    percentiles,
    best: currentGeneration[0],
    median: currentGeneration[Math.floor(currentGeneration.length / 2)],
    worst: currentGeneration[currentGeneration.length - 1]
  })
}
function addNewClasses () {
  for (const creature of currentGeneration) {
    const creatureClass = `n${creature.nodes.length}m${creature.muscles.length}`
    if (!classes.has(creatureClass)) {
      // Random enough, no?
      classes.set(creatureClass, (creature.nodes.length * 147 + creature.muscles.length * 50) % 360)
    }
  }
}
function simGeneration () {
  return sendWorker({ type: 'simulate' }).then(({ creatures }) => {
    currentGeneration = creatureify(creatures)
    recordGeneration()
  })
}
function nextGeneration () {
  return sendWorker({ type: 'reproduce' }).then(({ creatures }) => {
    currentGeneration = creatureify(creatures)
    addNewClasses()
  })
}

function winnerPhoto (winner) {
  return (wrapper, view) => {
    const { canvas, ctx: c } = wrapper

    wrapper.on('repaint', () => {
      c.clearRect(0, 0, wrapper.width, wrapper.height)
      if (history[generation - 1]) {
        const creature = history[generation - 1][winner]
        c.save()
        c.translate(wrapper.width / 2, wrapper.height - 10)
        c.scale((wrapper.height - 20) / CREATURE_SIZE, (wrapper.height - 20) / CREATURE_SIZE)
        creature.render(c)
        c.restore()
      }
    })
    view.on('gen-change', () => {
      wrapper.emit('repaint')
    })

    let hasPreview = false
    wrapper.elem.addEventListener('pointerenter', e => {
      if (history[generation - 1]) {
        const creature = history[generation - 1][winner]
        views.creaturePreview.emit('preview', creature)
        hasPreview = true
      }
    })
    wrapper.elem.addEventListener('pointerleave', e => {
      if (hasPreview) {
        views.creaturePreview.hide()
        hasPreview = false
      }
    })
  }
}

function renderSim (c, wrapper, creature, scrollX, scrollY) {
  // The ~CREATURE_SIZE un tall creature should take up 50% of the screen height
  const scale = wrapper.height * 0.5 / CREATURE_SIZE
  c.save()
  c.translate(wrapper.width / 2, wrapper.height / 2)
  c.scale(scale, scale)
  c.translate(-scrollX, -scrollY)

  const start = scrollX - wrapper.width / 2 / scale
  const stop = scrollX + wrapper.width / 2 / scale
  c.fillStyle = 'forestgreen'
  c.fillRect(start, 0, stop - start, wrapper.height / 2 / scale + scrollY)
  c.font = '0.3px monospace'
  c.textAlign = 'center'
  c.fillStyle = 'rgba(0, 0, 0, 0.5)'
  c.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  c.lineWidth = 0.05
  const startTick = Math.floor(start)
  const stopTick = Math.ceil(stop)
  c.beginPath()
  for (let i = startTick; i < stopTick; i++) {
    c.moveTo(i, 0)
    c.lineTo(i, 0.2)
    c.fillText(i, i, 0.3)
  }
  c.stroke()

  creature.render(c)

  c.restore()
}

const IDEAL_SPACING = 100 // px ("visual coordinates")
const spacingCoefficients = [1, 2, 5] // In "data coordinates" ish
// Returns spacing in "data coordinates"
function getSpacing (dataRange, visualRange) {
  // Transform into "data coordinates"
  const idealDataSpacing = dataRange * IDEAL_SPACING / visualRange
  const magnitude = 10 ** Math.floor(Math.log10(idealDataSpacing))
  const coefficient = idealDataSpacing / magnitude
  let closestCoefficient = spacingCoefficients[0]
  for (let i = 1; i < spacingCoefficients.length; i++) {
    if (Math.abs(spacingCoefficients[i] - coefficient) < Math.abs(closestCoefficient - coefficient)) {
      closestCoefficient = spacingCoefficients[i]
    }
  }
  return magnitude * closestCoefficient
}

const views = {
  start: new View('start-view', [
    new Text('title', 'Epic evolution'),
    new Button('start-btn', 'Start', btn => {
      document.body.classList.add('state-gen0')
      btn.elem.disabled = true
      sendWorker({ type: 'start' }).then(({ creatures }) => {
        currentGeneration = creatures.map(creature => new Creature(creature).reset())
        for (const creature of currentGeneration) {
          const creatureClass = `n${creature.nodes.length}m${creature.muscles.length}`
          if (!classes.has(creatureClass)) {
            // Random enough, no?
            classes.set(creatureClass, (creature.nodes.length * 147 + creature.muscles.length * 50) % 360)
          }
        }
        showView(views.creatures)
      })
    })
  ]),
  creatures: new View('creatures-view', [
    new Canvas('creatures', (wrapper, view) => {
      const { canvas, ctx: c } = wrapper
      let cols, rows, horizSpacing, vertSpacing

      let showDead = false
      wrapper.on('repaint', () => {
        if (animationTime !== null) return

        c.clearRect(0, 0, wrapper.width, wrapper.height)

        cols = Math.round(Math.sqrt(currentGeneration.length * wrapper.width / wrapper.height))
        rows = Math.ceil(currentGeneration.length / cols)
        horizSpacing = wrapper.width / (cols + 1)
        vertSpacing = wrapper.height / (rows + 1)
        const prop = currentGeneration[0].data.rank === undefined ||
          currentGeneration.notSorted ? 'id' : 'rank'
        for (const creature of currentGeneration) {
          const index = creature.data[prop]
          if (showDead && creature.data.willDie) {
            c.fillStyle = 'black'
            c.fillRect(
              (index % cols + 0.5) * horizSpacing,
              (Math.floor(index / cols) + 0.5) * vertSpacing,
              horizSpacing,
              vertSpacing
            )
          } else {
            c.save()
            c.translate(
              (index % cols + 1) * horizSpacing,
              (Math.floor(index / cols) + 1.5) * vertSpacing
            )
            // Creatures are approximately CREATURE_SIZE un tall at most
            c.scale(vertSpacing / CREATURE_SIZE, vertSpacing / CREATURE_SIZE)
            creature.render(c)
            c.restore()
          }
        }
      })

      const previewMarker = document.createElement('div')
      previewMarker.classList.add('preview-marker')
      wrapper.elem.append(previewMarker)
      let showingPreview = false
      function setPreview (e) {
        const rect = wrapper.elem.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) / horizSpacing - 0.5)
        const y = Math.floor((e.clientY - rect.top) / vertSpacing - 0.5)
        const index = x + y * cols
        const prop = currentGeneration[0].data.rank === undefined ||
          currentGeneration.notSorted ? 'id' : 'rank'
        const creature = currentGeneration.find(creature => creature.data[prop] === index)
        if (creature && x >= 0 && x < cols && y >= 0 && y < rows) {
          showingPreview = true
          views.creaturePreview.emit('preview', creature)
          previewMarker.style.left = (x + 0.5) * horizSpacing + 'px'
          previewMarker.style.top = (y + 0.5) * vertSpacing + 'px'
          previewMarker.style.width = horizSpacing + 'px'
          previewMarker.style.height = vertSpacing + 'px'
          previewMarker.classList.add('showing')
        } else if (showingPreview) {
          views.creaturePreview.hide()
          showingPreview = false
          previewMarker.classList.remove('showing')
        }
      }
      function hidePreview () {
        if (showingPreview) {
          views.creaturePreview.hide()
          showingPreview = false
          previewMarker.classList.remove('showing')
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
          const progress = animationTime / ANIM_LENGTH
          if (progress >= 1) {
            sortingAnimation.stop()
            document.body.classList.remove('state-sorting')
            document.body.classList.add('state-sorted')
            animationTime = null
            wrapper.emit('repaint')
            return
          }
          const position = easeInOutQuart(progress)

          c.clearRect(0, 0, wrapper.width, wrapper.height)
          horizSpacing = wrapper.width / (cols + 1)
          vertSpacing = wrapper.height / (rows + 1)
          for (const creature of currentGeneration) {
            c.save()
            c.translate(
              (position * (creature.destX - creature.initX) + creature.initX) * horizSpacing,
              (position * (creature.destY - creature.initY) + creature.initY) * vertSpacing
            )
            c.scale(vertSpacing / CREATURE_SIZE, vertSpacing / CREATURE_SIZE)
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
          creature.initY = Math.floor(creature.data.id / cols) + 1.5
          creature.destX = (creature.data.rank % cols + 1)
          creature.destY = Math.floor(creature.data.rank / cols) + 1.5
        }
        currentGeneration.notSorted = false

        animationTime = 0
        sortingAnimation.start()
      })
      view.on('show-dead', () => {
        showDead = true
        wrapper.emit('repaint')
      })
      view.on('show-new', () => {
        showDead = false
        wrapper.emit('repaint')
      })
    }),
    new Container('creature-btns', [
      new Container('gen0', [
        new Text('', 'Here\'s a thousand randomly-generated creatures to start with'),
        new Button('', 'Okay', () => {
          document.body.classList.remove('state-gen0')
          document.body.classList.add('generation-zero')
          generation = 0
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
        new Button('', 'Semigenocide', btn => {
          document.body.classList.remove('state-sorted')
          document.body.classList.add('state-dead')
          btn.view.emit('show-dead')
        })
      ]),
      new Container('dead', [
        new Text('', 'Faster creatures are more likely to survive to reproduce.'),
        new Button('', 'Reproduce', btn => {
          btn.elem.disabled = true
          nextGeneration().then(() => {
            btn.elem.disabled = false
            document.body.classList.remove('state-dead')
            document.body.classList.remove('generation-zero')
            document.body.classList.add('state-reproduction')
            btn.view.emit('show-new')
          })
        })
      ]),
      new Container('reproduction', [
        new Text('', 'Here are the contenders of the next generation.'),
        new Button('', 'Nice', btn => {
          document.body.classList.remove('state-reproduction')
          generation = history.length
          showView(views.generations)
        })
      ])
    ])
  ]),
  generations: new View('generations-view', [
    new Container('gen-side gen-left', [
      new Text('heading').on('view', (view, text) => {
        function update () {
          text.elem.textContent = `Generation ${generation}`
        }
        view.on('show', update)
        view.on('gen-change', update)
      }),
      new Text().on('view', (view, text) => {
        function update () {
          if (generation > 0) {
            text.elem.textContent = `Median: ${history[generation - 1].median.data.fitness.toFixed(4)}m`
          }
        }
        view.on('show', update)
        view.on('gen-change', update)
      }),
      new Container('graphs', [
        new Canvas('line-graph', (wrapper, view) => {
          const { canvas, ctx: c } = wrapper

          const PADDING = 20
          const minorPercentiles = []
          for (let i = 1; i <= 9; i++) minorPercentiles.push(i)
          for (let i = 91; i <= 99; i++) minorPercentiles.push(i)
          const majorPercentiles = []
          for (let i = 0; i <= 100; i += 10) {
            if (i !== 50) { // Median is rendered separately
              majorPercentiles.push(i)
            }
          }
          function renderPercentile (percentile, scale) {
            c.moveTo(0, wrapper.height - PADDING - history[0].percentiles[percentile] * scale)
            if (history.length === 1) {
              c.lineTo(
                wrapper.width,
                wrapper.height - PADDING - history[0].percentiles[percentile] * scale
              )
            } else {
              for (let i = 1; i < history.length; i++) {
                c.lineTo(
                  i / (history.length - 1) * wrapper.width,
                  wrapper.height - PADDING - history[i].percentiles[percentile] * scale
                )
              }
            }
          }
          wrapper.on('repaint', () => {
            c.clearRect(0, 0, wrapper.width, wrapper.height)
            if (history.length) {
              const scale = (wrapper.height - PADDING * 2) / maxScore
              c.strokeStyle = 'rgba(255, 255, 255, 0.3)'
              c.lineWidth = 1
              c.beginPath()
              for (const percentile of minorPercentiles) {
                renderPercentile(percentile, scale)
              }
              c.stroke()
              c.strokeStyle = 'rgba(255, 255, 255, 0.6)'
              c.lineWidth = 2
              c.beginPath()
              for (const percentile of majorPercentiles) {
                renderPercentile(percentile, scale)
              }
              c.stroke()
              c.strokeStyle = '#f66'
              c.beginPath()
              renderPercentile(50, scale)
              c.stroke()

              const spacing = getSpacing(maxScore, wrapper.height - 2 * PADDING)
              c.strokeStyle = 'rgba(255, 255, 255, 0.2)'
              c.lineWidth = 1
              c.fillStyle = 'rgba(255, 255, 255, 0.5)'
              c.font = '10px "Poppins", sans-serif'
              c.textAlign = 'left'
              c.textBaseline = 'bottom'
              c.beginPath()
              const lines = Math.floor(maxScore / spacing)
              for (let i = 0; i <= lines; i++) {
                const score = i * spacing
                const visualY = wrapper.height - PADDING - score * scale
                c.moveTo(0, visualY)
                c.lineTo(wrapper.width, visualY)
                c.fillText(+score.toPrecision(12) + 'm', 0, visualY - 5)
              }
              c.stroke()
            }
          })
        }),
        new Canvas('area-graph', (wrapper, view) => {
          const { canvas, ctx: c } = wrapper

          wrapper.on('repaint', () => {
            c.clearRect(0, 0, wrapper.width, wrapper.height)
            if (history.length) {
              const ys = new Array(history.length).fill(0)
              for (const [creatureClass, hue] of classes) {
                c.fillStyle = `hsl(${hue}, 100%, 50%)`
                c.beginPath()
                c.moveTo(0, ys[0] * wrapper.height)
                if (history.length === 1) {
                  c.lineTo(wrapper.width, ys[0] * wrapper.height)
                  ys[0] += history[0].demographics.get(creatureClass) / currentGeneration.length || 0
                  c.lineTo(wrapper.width, ys[0] * wrapper.height)
                  c.lineTo(0, ys[0] * wrapper.height)
                } else {
                  for (let i = 1; i < history.length; i++) {
                    c.lineTo(wrapper.width * i / (history.length - 1), ys[i] * wrapper.height)
                  }
                  for (let i = history.length; i--;) {
                    ys[i] += history[i].demographics.get(creatureClass) / currentGeneration.length || 0
                    c.lineTo(wrapper.width * i / (history.length - 1), ys[i] * wrapper.height)
                  }
                }
                c.closePath()
                c.fill()
              }
            }
          })
        }),
        new Container('current-gen', [
          new Canvas('area-graph-labels', (wrapper, view) => {
            const { canvas, ctx: c } = wrapper

            wrapper.on('repaint', () => {
              c.clearRect(0, 0, wrapper.width, wrapper.height)

              if (history[generation - 1]) {
                c.textBaseline = 'middle'
                c.font = '10px "Poppins", sans-serif'
                const BOX_HEIGHT = 16
                const { demographics } = history[generation - 1]
                let y = 0
                for (const [creatureClass, hue] of classes) {
                  const count = demographics.get(creatureClass) || 0
                  const percentage = count / currentGeneration.length
                  if (percentage > 0.05) {
                    let visualY = wrapper.height * (y + percentage / 2)
                    if (visualY + BOX_HEIGHT / 2 > wrapper.height) {
                      visualY = wrapper.height - BOX_HEIGHT / 2
                    } else if (visualY - BOX_HEIGHT / 2 < 0) {
                      visualY = BOX_HEIGHT / 2
                    }
                    c.fillStyle = 'rgba(255, 255, 255, 0.8)'
                    c.fillRect(0, visualY - BOX_HEIGHT / 2, wrapper.width, BOX_HEIGHT)
                    c.fillStyle = `hsl(${hue}, 100%, 30%)`
                    c.fillText(`${creatureClass}: ${count}`, 0, visualY)
                  }
                  y += percentage
                }
              }
            })
            view.on('gen-change', () => {
              wrapper.emit('repaint')
            })
          })
        ]).on('view', (view, { elem }) => {
          function update () {
            if (generation > 0) {
              elem.style.left = (history.length === 1 ? 1 : (generation - 1) / (history.length - 1)) * 100 + '%'
            }
          }
          view.on('show', update)
          view.on('gen-change', update)
        })
      ])
    ]),
    new Container('gen-side gen-right', [
      new Fieldset('gens-buttons', [
        new Button('', 'Watch next generation', () => {
          showView(views.watch)
        }),
        new Button('', 'Generate immediately', btn => {
          btn.parent.elem.disabled = true
          simGeneration().then(() => {
            btn.parent.elem.disabled = false
            currentGeneration.notSorted = true
            document.body.classList.add('state-results')
            showView(views.creatures)
          })
        }),
        new Button('', 'Generate automatically', btn => {
          if (btn.playing) {
            btn.elem.textContent = 'Generate automatically'
            btn.elem.disabled = true
            btn.playing = false
            sendWorker({ type: 'stop-auto' }).then(() => {
              btn.parent.descendants[0].elem.disabled = false
              btn.parent.descendants[1].elem.disabled = false
              btn.elem.disabled = false
            })
          } else {
            btn.elem.textContent = 'Stop generating'
            btn.parent.descendants[0].elem.disabled = true
            btn.parent.descendants[1].elem.disabled = true
            btn.playing = true
            sendWorker({ type: 'start-auto' })
          }
        })
      ]),
      new Container('winners', [
        new Container('winner', [
          new Text('winner-label', 'Worst'),
          new Canvas('winner-photo', winnerPhoto('worst'))
        ]),
        new Container('winner', [
          new Text('winner-label', 'Median'),
          new Canvas('winner-photo', winnerPhoto('median'))
        ]),
        new Container('winner', [
          new Text('winner-label', 'Best'),
          new Canvas('winner-photo', winnerPhoto('best'))
        ])
      ]),
      new Canvas('generation-slider', (wrapper, view) => {
        const { canvas, ctx: c } = wrapper
        const KNOB = 40
        function renderKnob (genProg) {
          c.clearRect(0, 0, wrapper.width, wrapper.height)
          c.fillStyle = '#ffd369'
          c.fillRect(
            genProg * (wrapper.width - KNOB),
            0,
            KNOB,
            wrapper.height
          )
          c.fillStyle = 'rgba(0, 0, 0, 0.8)'
          c.font = '24px "Poppins", sans-serif'
          c.textAlign = 'center'
          c.textBaseline = 'middle'
          c.fillText(generation, genProg * (wrapper.width - KNOB) + KNOB / 2,
            wrapper.height / 2)
        }
        wrapper.on('repaint', () => {
          if (generation > 0) {
            renderKnob(pointerId === null
              ? history.length === 1 ? 0.5 : (generation - 1) / (history.length - 1)
              : genProg)
          }
        })

        let pointerId = null
        let genProg
        let possibleGeneration
        function drag (e) {
          if (e.pointerId === pointerId) {
            const { left, width } = wrapper.elem.getBoundingClientRect()
            genProg = Math.max(Math.min((e.clientX - left - KNOB / 2) / (width - KNOB), 1), 0)
            generation = Math.round(genProg * (history.length - 1)) + 1
            renderKnob(genProg) // Might be redundant, but might also be smoother
            view.emit('gen-change')
          }
        }
        function stopDrag (e) {
          if (e.pointerId === pointerId) {
            pointerId = null
          }
        }
        wrapper.elem.addEventListener('pointerdown', e => {
          if (pointerId === null) {
            pointerId = e.pointerId
            drag(e)
            wrapper.elem.setPointerCapture(pointerId)
          }
        })
        wrapper.elem.addEventListener('pointermove', drag)
        wrapper.elem.addEventListener('pointerup', stopDrag)
        wrapper.elem.addEventListener('pointercancel', stopDrag)
      }),
      new Canvas('histogram', (wrapper, view) => {
        const { canvas, ctx: c } = wrapper

        const PADDING = 40
        wrapper.on('repaint', () => {
          c.clearRect(0, 0, wrapper.width, wrapper.height)

          if (history[generation - 1]) {
            const { histogram, histogramMax, median } = history[generation - 1]
            const medianBar = Math.floor(median.data.fitness / HISTOGRAM_INTERVAL)
            const max = Math.floor(maxScore / HISTOGRAM_INTERVAL)
            const bars = max + 1
            const barWidth = (wrapper.width - 2 * PADDING) / bars
            for (let i = 0; i <= max; i++) {
              const count = histogram.get(i)
              if (count) {
                const barHeight = count / histogramMax * (wrapper.height - 2 * PADDING)
                c.fillStyle = i === medianBar ? '#f66' : 'rgba(255, 255, 255, 0.5)'
                c.fillRect(
                  PADDING + i * barWidth,
                  wrapper.height - PADDING - barHeight,
                  barWidth,
                  barHeight
                )
              }
            }

            const xSpacing = getSpacing(maxScore, wrapper.width - 2 * PADDING)
            const ySpacing = getSpacing(histogramMax, wrapper.height - 2 * PADDING)
            c.strokeStyle = 'rgba(255, 255, 255, 0.2)'
            c.lineWidth = 1
            c.fillStyle = 'rgba(255, 255, 255, 0.5)'
            c.font = '10px "Poppins", sans-serif'
            c.beginPath()
            c.textAlign = 'center'
            c.textBaseline = 'top'
            const xLines = Math.floor(bars * HISTOGRAM_INTERVAL / xSpacing)
            for (let i = 0; i <= xLines; i++) {
              const x = i * xSpacing
              const visualX = PADDING + x / HISTOGRAM_INTERVAL * barWidth
              c.moveTo(visualX, PADDING)
              c.lineTo(visualX, wrapper.height - PADDING)
              c.fillText(+x.toPrecision(12), visualX, wrapper.height - PADDING + 5)
            }
            c.textAlign = 'right'
            c.textBaseline = 'middle'
            const yLines = Math.floor(histogramMax / ySpacing)
            for (let i = 0; i <= yLines; i++) {
              const y = i * ySpacing
              const visualY = wrapper.height - PADDING - y / histogramMax * (wrapper.height - 2 * PADDING)
              c.moveTo(PADDING, visualY)
              c.lineTo(wrapper.width - PADDING, visualY)
              c.fillText(+y.toPrecision(12), PADDING - 5, visualY)
            }
            c.stroke()
            // Always label your axes!
            c.font = '12px "Poppins", sans-serif'
            c.textAlign = 'center'
            c.textBaseline = 'bottom'
            c.fillText('Fitness (m)', wrapper.width / 2, wrapper.height - 7)
            c.save()
            c.rotate(-Math.PI / 2)
            c.textBaseline = 'top'
            c.fillText('Number of creatures', -wrapper.height / 2, 7)
            c.restore()
          }
        })
        view.on('gen-change', () => {
          wrapper.emit('repaint')
        })
      })
    ])
  ]),
  watch: new View('watch-view', [
    new Canvas('watch', (wrapper, view) => {
      const { canvas, ctx: c, sizeReady } = wrapper
      let current, currentCreature
      let scrollX, scrollY
      let clock
      let stop
      let creatures
      let simGenerationReady

      const renderer = new RenderSimulation({
        render: () => {
          if (stop) return

          c.clearRect(0, 0, wrapper.width, wrapper.height)

          if (current === null) return
          c.fillStyle = 'black'
          c.textBaseline = 'top'
          c.font = '16px monospace'
          c.fillText(`Creature ${current + 1} of ${creatures.length}`, 5, 5)
          c.fillText(`Time: ${clock.toFixed(2)}s`, 5, 25)
          c.fillText(`Distance: ${currentCreature.position().x.toFixed(2)}m`, 5, 45)
          c.fillText(`Speed: ${renderer.speed}x`, 5, 65)

          renderSim(c, wrapper, currentCreature, scrollX, scrollY)
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
                simGenerationReady.then(() => {
                  currentGeneration.notSorted = true
                  document.body.classList.add('state-results')
                  showView(views.creatures)
                })
                return
              }
            }
            currentCreature = creatures[current].clone().reset()
          }

          currentCreature.sim(time)
          clock += time

          const { x, y } = currentCreature.position()
          scrollX += (x - scrollX) / 10
          scrollY += (y - scrollY) / 10
        },
        simTime: SIM_TIME
      })
      view.on('speed', speed => {
        renderer.speed = speed
      })
      view.on('show', () => {
        creatures = currentGeneration
        simGenerationReady = simGeneration()
        sizeReady.then(() => {
          stop = false
          current = null
          scrollX = 0
          scrollY = 0
          view.speed = 1
          renderer.speed = 1
          renderer.start()
        })
      })
      view.on('hide', () => {
        renderer.stop()
      })
    }),
    new Container('controls', [
      new Button('', 'Slower', btn => {
        btn.view.speed /= 2
        if (btn.view.speed < 1/8) btn.view.speed = 1/8
        btn.view.emit('speed', btn.view.speed)
      }),
      new Button('', 'Faster', btn => {
        btn.view.speed *= 2
        if (btn.view.speed > 8192) btn.view.speed = 8192
        btn.view.emit('speed', btn.view.speed)
      })
    ])
  ]),
  creaturePreview: new View('creature-preview', [
    new Container('preview-content', [
      new Text('creature-info').on('view', (view, text) => {
        view.on('info', creature => {
          const lines = [
            `Creature ${creature.data.id}`
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
      new Text('creature-info').on('view', (view, text) => {
        view.on('info', creature => {
          const creatureClass = `n${creature.nodes.length}m${creature.muscles.length}`
          text.elem.style.color = `hsl(${classes.get(creatureClass)}, 100%, 30%)`
          text.elem.textContent = `Class ${creatureClass}`
        })
      }),
      new Canvas('preview', (wrapper, view) => {
        let pointerX, pointerY, width, height, windowWidth, windowHeight
        document.addEventListener('pointermove', e => {
          pointerX = e.clientX
          pointerY = e.clientY
          if (!view.hidden) {
            const rect = view.elem.getBoundingClientRect()
            width = rect.width
            height = rect.height
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
        let creature, simCreature
        let scrollX, scrollY
        let clock

        const renderer = new RenderSimulation({
          render: () => {
            c.fillStyle = clock > 15 ? '#6095a9' : 'skyblue'
            c.fillRect(0, 0, wrapper.width, wrapper.height)

            c.fillStyle = 'black'
            c.textBaseline = 'top'
            c.font = '16px monospace'
            c.fillText(`Time: ${clock.toFixed(2)}s`, 5, 2)
            c.fillText(`Distance: ${simCreature.position().x.toFixed(4)}m`, 5, 25)

            renderSim(c, wrapper, simCreature, scrollX, scrollY)
          },
          simulate: time => {
            simCreature.sim(time)
            clock += time
            const { x, y } = simCreature.position()
            scrollX += (x - scrollX) / 10
            scrollY += (y - scrollY) / 10
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
          simCreature = creature.clone().reset()
          sizeReady.then(() => {
            if (!creature) return // In case it is aborted early
            scrollX = 0
            scrollY = 0
            renderer.start()
          })
        })
        view.on('hide', () => {
          creature = null
          renderer.stop()
        })
      })
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
  if (!views.creaturePreview.hidden) {
    views.creaturePreview.resize()
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
    case 'full-generation':
      currentGeneration = creatureify(data.fitnessCreatures)
      recordGeneration()
      currentGeneration = creatureify(data.newCreatures)
      addNewClasses()
      generation = history.length
      document.body.classList.remove('generation-zero')
      showView(views.generations)
      break
  }
})

const params = new URL(window.location).searchParams
sendWorker({
  type: 'init',
  key: params.get('seed') || 'epic',
  count: +params.get('count') || 1000,
  logTime: !!params.get('log-time')
}).then(() => {
  showView(views.start)
})

views.creaturePreview.addTo(document.body)
