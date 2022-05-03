import { h, Fragment, render } from 'preact'
import { useEffect, useState, useRef } from 'preact/hooks'

function Quiz ({ name, scores }) {
  return h(
    'div',
    { class: 'quiz' },
    h('h3', { class: 'quiz-name' }, name),
    h(
      'div',
      { class: 'scores' },
      scores.map((count, score) =>
        h(
          'div',
          {
            class: `score score-${score}`,
            title: `${score}/3`,
            style: { flexGrow: count }
          },
          count
        )
      )
    )
  )
}

function Quizzes ({ quizzes }) {
  return h(
    'div',
    { class: 'quizzes' },
    h('h2', { class: 'heading quizzes-heading' }, 'Quiz scores'),
    quizzes.map((scores, i) => h(Quiz, { name: `Quiz ${i + 1}`, scores })),
    h(
      'div',
      { class: 'key' },
      h('h3', { class: 'key-heading' }, 'Key'),
      [0, 1, 2, 3].map(score =>
        h(
          'div',
          { class: 'score-key' },
          h('div', { class: `score-colour score-${score}` }),
          ' ',
          score,
          '/3'
        )
      )
    )
  )
}

function App ({ quizzes, histogram }) {
  return h(Fragment, null, h(Quizzes, { quizzes }))
}

render(
  h(App, {
    // https://canvas.ucsd.edu/courses/35544/pages/quiz-scores
    quizzes: [
      [37, 51, 34, 25],
      [61, 43, 36, 3],
      [79, 40, 21, 3],
      [54, 56, 12, 10],
      [47, 57, 19, 6]
    ],
    histogram: [
      [25, 50, 46, 27],
      [21, 22, 36, 27, 23, 16, 2],
      [9, 23, 15, 29, 20, 13, 10, 7, 6, 1],
      [6, 16, 18, 20, 18, 19, 10, 8, 7, 2, 5, 4]
    ]
  }),
  document.getElementById('root')
)
