import { render, h } from 'https://esm.sh/preact@10.6.6/'
import { useState } from 'https://esm.sh/preact@10.6.6/hooks'

function * range (count) {
  for (let i = 0; i < count; i++) {
    yield i
  }
}

const tileStyles = [
  'empty',
  'empty top-left',
  'empty top-right',
  'empty bottom-left',
  'empty bottom-right',
  'fill',
  'fill top-left',
  'fill top-right',
  'fill bottom-left',
  'fill bottom-right',
  'fill left',
  'fill right'
]

function App () {
  const [width, setWidth] = useState(10)
  const [height, setHeight] = useState(10)
  const [data, setData] = useState(() =>
    Array.from(
      range(width * height),
      () => tileStyles[(tileStyles.length * Math.random()) | 0]
    )
  )

  return h(
    'div',
    { class: 'board', style: { '--width': width, '--height': height } },
    Array.from(range(width * height), key =>
      h('div', { class: `tile ${data[key]}`, key })
    )
  )
}

render(h(App), document.getElementById('root'))
