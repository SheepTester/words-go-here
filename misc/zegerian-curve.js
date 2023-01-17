import chroma from 'chroma'
import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'

function analyze (distribution) {
  const total = distribution.reduce((a, b) => a + b)
  const average = distribution
    .map((count, score) => (count / total) * score)
    .reduce((a, b) => a + b)
  let remaining = Math.floor(total / 2)
  let median = 0
  while (true) {
    remaining -= distribution[median]
    if (remaining < 0) {
      if (total % 2 === 0 && remaining === -1) {
        let next = median + 1
        while (distribution[next] === 0) next++
        median = (median + next) / 2
      }
      break
    }
    median++
  }
  const stddev = Math.sqrt(
    distribution
      .map((count, score) => count * (score - average) ** 2)
      .reduce((a, b) => a + b) / total
  )
  return {
    total,
    average,
    median,
    stddev
  }
}

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
          h('span', { class: 'number' }, count)
        )
      )
    )
  )
}

function Quizzes ({ quizzes, quiz, onQuiz }) {
  return h(
    'div',
    { class: 'section quizzes', onMouseLeave: onQuiz && (() => onQuiz(null)) },
    h('h2', { class: 'heading' }, 'Quiz scores'),
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

const barGradient = chroma.scale(['#ef4444', '#eab308', '#84cc16']).mode('lab')

function Histogram ({ scores, showingAll }) {
  const maxCount = Math.max(...scores)
  const colours = barGradient.colors(scores.length)

  return h(
    'div',
    { class: `histogram ${showingAll ? 'showing-all' : ''}` },
    scores.map((count, score) =>
      h(
        'div',
        {
          key: score,
          class: 'bar',
          style: {
            height: `${(count / maxCount) * 100}%`,
            backgroundColor: colours[score]
          }
        },
        h(
          'span',
          {
            class: `number count-number ${
              count < maxCount * 0.1 ? 'low-count' : ''
            }`
          },
          count
        ),
        h('span', { class: 'number score-number' }, score)
      )
    )
  )
}

function Histograms ({ histogram, quiz }) {
  const showAll = quiz === null || quiz < 2

  return h(
    'div',
    { class: 'section histograms' },
    h(
      'h2',
      { class: 'heading' },
      'Histogram of total scores',
      h('span', { title: 'Lowest quiz score dropped' }, '*')
    ),
    h(
      'div',
      { class: 'histogram-row' },
      h(
        'div',
        { class: 'graph-label graph-label-y' },
        h('span', { class: 'graph-label-y-text' }, 'Students')
      ),
      h(
        'div',
        { class: 'histogram-wrapper' },
        histogram.map((scores, i) =>
          showAll || i + 2 === quiz
            ? h(Histogram, { scores, key: i, showingAll: showAll })
            : null
        )
      )
    ),
    h('div', { class: 'graph-label graph-label-x' }, 'Score')
  )
}

function QuizStatistics ({ quiz, distribution }) {
  const { total: students, average, median, stddev } = analyze(distribution)

  return h(
    'div',
    { class: 'section' },
    h('h2', { class: 'heading' }, 'Quiz ', quiz, ' statistics'),
    h('p', null, 'Total students: ', h('strong', null, students)),
    h(
      'p',
      null,
      'Average quiz score: ',
      h('strong', null, average.toFixed(2)),
      '/3'
    ),
    h(
      'p',
      null,
      'Average percentage: ',
      h('strong', null, ((average / 3) * 100).toFixed(2)),
      '%'
    ),
    h('p', null, 'Median: ', h('strong', null, median)),
    h('p', null, 'Standard deviation: ', h('strong', null, stddev.toFixed(2)))
  )
}

function EstimatedCurve ({ distribution }) {
  const { total: students, average, median, stddev } = analyze(distribution)

  return h(
    'div',
    { class: 'section estimated-curve' },
    h('h2', { class: 'heading' }, 'Overall statistics'),
    h('p', null, 'Total students: ', h('strong', null, students)),
    h(
      'p',
      null,
      'Average total score: ',
      h('strong', null, average.toFixed(2)),
      '/',
      distribution.length - 1
    ),
    h(
      'p',
      null,
      'Average percentage: ',
      h(
        'strong',
        null,
        ((average / (distribution.length - 1)) * 100).toFixed(2)
      ),
      '%'
    ),
    h('p', null, 'Median: ', h('strong', null, median)),
    h('p', null, 'Standard deviation: ', h('strong', null, stddev.toFixed(2)))
  )
}

export function App ({ quizzes, histogram }) {
  const [quiz, setQuiz] = useState(null)

  return h(
    Fragment,
    null,
    h(Quizzes, { quizzes, quiz, onQuiz: setQuiz }),
    h(Histograms, { histogram, quiz }),
    h(
      'div',
      { class: 'stat-column' },
      h(EstimatedCurve, {
        distribution:
          histogram[quiz === null || quiz < 2 ? histogram.length - 1 : quiz - 2]
      }),
      quiz &&
        h(QuizStatistics, {
          quiz,
          distribution: quizzes[quiz - 1]
        })
    )
  )
}
