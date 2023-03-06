import chroma from 'chroma'
import { h, Fragment } from 'preact'
import { useState, useMemo } from 'preact/hooks'

const modes = {
  quiz: {
    item: 'Quiz',
    plural: 'Quiz scores',
    maxScore: 3,
    range: [0, 1, 2, 3, 4],
    colours: ['#ef4444', '#eab308', '#84cc16']
  },
  final: {
    item: 'Part',
    plural: 'Parts',
    maxScore: 4,
    range: [0, 1, 2, 3, 4],
    colours: ['#ef4444', '#eab308', '#22c55e']
  }
}

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

function Quiz ({ mode, name, scores, afterCurrent, onSelect }) {
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
            title: `${score}/${modes[mode].maxScore}`,
            style: { flexGrow: count }
          },
          h('span', { class: 'number' }, count)
        )
      )
    )
  )
}

function Quizzes ({ mode, quizzes, quiz, onQuiz }) {
  return h(
    'div',
    { class: 'section quizzes', onMouseLeave: onQuiz && (() => onQuiz(null)) },
    h('h2', { class: 'heading' }, modes[mode].plural),
    quizzes.map((scores, i) =>
      h(Quiz, {
        mode,
        key: i,
        name: `${modes[mode].item} ${i + 1}`,
        scores,
        afterCurrent: quiz !== null && i + 1 > quiz,
        onSelect: onQuiz && (() => onQuiz(i + 1))
      })
    ),
    h(
      'div',
      { class: 'key' },
      h('h3', { class: 'key-heading' }, 'Key'),
      modes[mode].range.map(score =>
        h(
          'div',
          { class: 'score-key', key: score },
          h('div', { class: `score-colour score-${score}` }),
          ' ',
          score,
          `/${modes[mode].maxScore}`
        )
      )
    )
  )
}

function Histogram ({ mode, scores, showingAll }) {
  const maxCount = Math.max(...scores)
  const colours = useMemo(
    () => chroma.scale(modes[mode].colours).mode('lab').colors(scores.length),
    [mode, scores.length]
  )

  const cumStudentsArr = []
  let cumStudents = 0
  for (const count of scores) {
    cumStudentsArr.push(cumStudents)
    cumStudents += count
  }

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
          { class: 'number percentage' },
          `${Math.round((cumStudentsArr[score] / cumStudents) * 100)}%`
        ),
        h(
          'span',
          {
            class: `number count-number ${
              count < maxCount * 0.1 ? 'low-count' : ''
            }`
          },
          count
        ),
        h('span', { class: 'number score-number' }, score),
        score === scores.length - 1 &&
          h('span', { class: 'number percentage percent-100' }, '100%')
      )
    )
  )
}

function Histograms ({ mode, quizzes, histogram, quiz }) {
  const showAll = quiz === null || quiz < 2

  return h(
    'div',
    { class: 'section histograms' },
    h(
      'h2',
      { class: 'heading' },
      mode === 'quiz'
        ? h(
            Fragment,
            null,
            'Histogram of overall scores',
            h('span', { title: 'Lowest quiz score dropped' }, '*')
          )
        : 'Score distribution'
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
        mode === 'quiz'
          ? histogram.map((scores, i) =>
              showAll || i + 2 === quiz
                ? h(Histogram, { mode, scores, key: i, showingAll: showAll })
                : null
            )
          : h(Histogram, { mode, scores: quiz ? quizzes[quiz - 1] : histogram })
      )
    ),
    h('div', { class: 'graph-label graph-label-x' }, 'Score')
  )
}

function QuizStatistics ({ mode, quiz, distribution }) {
  const { total: students, average, median, stddev } = analyze(distribution)

  return h(
    'div',
    { class: 'section quiz-statistics' },
    h('h2', { class: 'heading' }, `${modes[mode].item} `, quiz, ' statistics'),
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

export function App ({ mode = 'quiz', quizzes, histogram }) {
  const [quiz, setQuiz] = useState(null)

  return h(
    Fragment,
    null,
    h(Quizzes, { mode, quizzes, quiz, onQuiz: setQuiz }),
    h(Histograms, { mode, quizzes, histogram, quiz }),
    mode === 'quiz'
      ? h(
          Fragment,
          null,
          h(EstimatedCurve, {
            distribution:
              histogram[
                quiz === null || quiz < 2 ? histogram.length - 1 : quiz - 2
              ]
          }),
          quiz &&
            h(QuizStatistics, { mode, quiz, distribution: quizzes[quiz - 1] })
        )
      : quiz
      ? h(QuizStatistics, { mode, quiz, distribution: quizzes[quiz - 1] })
      : h(EstimatedCurve, { mode, distribution: histogram })
  )
}
