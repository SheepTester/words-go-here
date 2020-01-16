'use strict'

importScripts('./random.js')
importScripts('./simulation.js')

const NUMBER = 1000
let currentGeneration
let random

function simulateGeneration () {
  let time = 0
  while (time < 15) {
    for (const creature of currentGeneration) {
      creature.sim(SIM_TIME)
    }
    time += SIM_TIME
  }
  for (const creature of currentGeneration) {
    creature.fitness = Math.abs(creature.position().x)
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
      }
      respond(data, {
        creatures: currentGeneration.map(creature => creature.toJSON())
      })
      console.timeEnd(data.type)
      break
    case 'simulate':
      console.time(data.type)
      simulateGeneration()
      console.timeEnd(data.type)
      // currentGeneration.sort((a, b) => b.fitness - a.fitness)
      respond(data, {
        creatures: currentGeneration.map(creature => {
          const json = creature.toJSON()
          json.fitness = creature.fitness
          return json
        })
      })
      break
    default:
      respond(data)
  }
})
