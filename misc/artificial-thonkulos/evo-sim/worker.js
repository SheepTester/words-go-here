'use strict'

importScripts('./random.js')
importScripts('./simulation.js')

const NUMBER = 1000
let currentGeneration
let random

function createGeneration (random) {
  const generation = new Array(NUMBER)
  for (let i = 0; i < generation.length; i++) {
    generation[i] = Creature.makeRandom(random)
    generation[i].data.id = i
  }
  return generation
}

function simulateGeneration (generation) {
  for (const creature of generation) {
    creature.reset()
  }
  let time = 0
  while (time < 15) {
    for (const creature of generation) {
      creature.sim(SIM_TIME)
    }
    time += SIM_TIME
  }
  for (const creature of generation) {
    creature.data.fitness = Math.abs(creature.position().x)
  }
}

function rankGeneration (generation) {
  generation.sort((a, b) => b.data.fitness - a.data.fitness)
  for (let i = 0; i < generation.length; i++) {
    generation[i].data.rank = i
  }
}

function purgeOnGradient (generation, random) {
  const half = Math.floor(NUMBER / 2)
  for (let i = 0; i < half; i++) {
    if (random.random() < (i / NUMBER) ** 1.5) {
      generation[i].data.willDie = true
    } else {
      generation[generation.length - 1 - i].data.willDie = true
    }
  }
}

function nextGeneration (oldGeneration, random) {
  const survivors = oldGeneration.filter(creature => !creature.data.willDie)
  const generation = new Array(NUMBER)
  for (let i = 0; i < generation.length; i++) {
    if (oldGeneration[i].data.willDie) {
      generation[i] = survivors.pop().clone().mutate(random)
    } else {
      generation[i] = oldGeneration[i].clone()
    }
    generation[i].data = { id: i }
  }
  return generation
}

function respond (originalData, responseData = {}) {
  self.postMessage({
    type: 'response',
    response: originalData.type,
    ...responseData
  })
}
self.addEventListener('message', ({ data }) => {
  console.time(data.type)
  switch (data.type) {
    case 'init':
      random = new SeededRandom(data.key)
      respond(data)
      break
    case 'start':
      currentGeneration = createGeneration(random)
      respond(data, {
        creatures: currentGeneration.map(creature => creature.toJSON())
      })
      break
    case 'simulate':
      simulateGeneration(currentGeneration)
      rankGeneration(currentGeneration)
      purgeOnGradient(currentGeneration, random)
      respond(data, {
        creatures: currentGeneration.map(creature => creature.toJSON())
      })
      break
    case 'reproduce':
      currentGeneration = nextGeneration(currentGeneration, random)
      respond(data, {
        creatures: currentGeneration.map(creature => creature.toJSON())
      })
    default:
      respond(data)
  }
  console.timeEnd(data.type)
})
