import { h, Fragment, render } from 'preact'
import { useEffect, useState, useRef } from 'preact/hooks'

function Quiz ({ name, scores, afterCurrent, onSelect }) {
  return h(
    'div',
    {
      class: `quiz ${afterCurrent ? 'after' : ''}`,
      onMouseEnter: onSelect
    },
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
          h('span', { class: 'score-number' }, count)
        )
      )
    )
  )
}

function Quizzes ({ quizzes, quiz, onQuiz }) {
  return h(
    'div',
    { class: 'quizzes', onMouseLeave: onQuiz && (() => onQuiz(null)) },
    h('h2', { class: 'heading quizzes-heading' }, 'Quiz scores'),
    quizzes.map((scores, i) =>
      h(Quiz, {
        key: i,
        name: `Quiz ${i + 1}`,
        scores,
        afterCurrent: quiz !== null && i + 1 > quiz,
        onSelect: onQuiz && (() => onQuiz(i + 1))
      })
    ),
    h(
      'div',
      { class: 'key' },
      h('h3', { class: 'key-heading' }, 'Key'),
      [0, 1, 2, 3].map(score =>
        h(
          'div',
          { class: 'score-key', key: score },
          h('div', { class: `score-colour score-${score}` }),
          ' ',
          score,
          '/3'
        )
      )
    )
  )
}

function Histogram ({ scores, showingAll }) {
  const maxCount = Math.max(...scores)

  return h(
    'div',
    { class: `histogram ${showingAll ? 'showing-all' : ''}` },
    scores.map((count, score) =>
      h('div', {
        key: score,
        class: 'bar',
        style: { height: `${(count / maxCount) * 100}%` }
      })
    )
  )
}

function Histograms ({ histogram, quiz }) {
  const showAll = quiz === null || quiz < 2

  return h(
    'div',
    { class: 'histograms' },
    h(
      'div',
      { class: 'histogram-wrapper' },
      histogram.map((scores, i) =>
        showAll || i + 2 === quiz
          ? h(Histogram, { scores, key: i, showingAll: showAll })
          : null
      )
    )
  )
}

function App ({ quizzes, histogram }) {
  const [quiz, setQuiz] = useState(null)

  return h(
    Fragment,
    null,
    h(Quizzes, { quizzes, quiz, onQuiz: setQuiz }),
    h(Histograms, { histogram, quiz })
  )
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
