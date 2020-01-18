'use strict'

importScripts('./random.js')
importScripts('./simulation.js')

const NUMBER = 1000
let currentGeneration
let random

function simulateGeneration () {
  for (const creature of currentGeneration) {
    creature.reset()
  }
  let time = 0
  while (time < 15) {
    for (const creature of currentGeneration) {
      creature.sim(SIM_TIME)
    }
    time += SIM_TIME
  }
  for (const creature of currentGeneration) {
    creature.data.fitness = Math.abs(creature.position().x)
  }
}

function respond (originalData, responseData = {}) {
  self.postMessage({
    type: 'response',
    response: originalData.type,
    ...responseData
  })
}
self.addEventListener('message', ({ data }) => {
  switch (data.type) {
    case 'init':
      random = new SeededRandom(data.key)
      respond(data)
      break
    case 'start':
      console.time(data.type)
      currentGeneration = new Array(NUMBER)
      for (let i = 0; i < currentGeneration.length; i++) {
        currentGeneration[i] = Creature.makeRandom(random)
        currentGeneration[i].data.id = i
      }
      respond(data, {
        creatures: currentGeneration.map(creature => creature.toJSON())
      })
      console.timeEnd(data.type)
      break
    case 'simulate':
      console.time(data.type)
      simulateGeneration()
      currentGeneration.sort((a, b) => b.data.fitness - a.data.fitness)
      for (let i = 0; i < currentGeneration.length; i++) {
        currentGeneration[i].data.rank = i
      }
      // TODO: Mark for killing
      console.timeEnd(data.type)
      respond(data, {
        creatures: currentGeneration.map(creature => creature.toJSON())
      })
      break
    default:
      respond(data)
  }
})
