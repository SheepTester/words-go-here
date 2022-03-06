import { render, h, Fragment } from 'https://esm.sh/preact@10.6.6/'
import { useState, useEffect } from 'https://esm.sh/preact@10.6.6/hooks'

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
  'empty left',
  'empty right'
]
const DEFAULT_STYLE = 'empty'

function SizeControl ({ value, onChange, children }) {
  return h(
    'label',
    { class: 'size-control' },
    children,
    ' ',
    h('input', {
      type: 'range',
      class: 'slider',
      min: 1,
      max: 20,
      value,
      onChange: e => onChange(+e.currentTarget.value)
    })
  )
}

function App () {
  const [width, setWidth] = useState(10)
  const [height, setHeight] = useState(10)
  const [data, setData] = useState(() =>
    Array.from(
      range(width * height),
      () => tileStyles[(tileStyles.length * Math.random()) | 0]
    )
  )
  const [selected, setSelected] = useState('fill')
  const [pointerId, setPointerId] = useState(null)

  const paint = e => {
    const tile = document.elementFromPoint(e.clientX, e.clientY)
    if (tile && tile.dataset.current !== selected) {
      const index = +tile.dataset.index
      setData(data => data.map((old, i) => (i === index ? selected : old)))
    }
  }

  return h(
    Fragment,
    null,
    h(
      'div',
      {
        class: 'tile-selection'
      },
      tileStyles.map(style =>
        h(
          'div',
          { class: 'tile-select-wrapper', key: style },
          h('button', {
            class: `tile-select-tile tile ${style} ${
              selected === style ? 'tile-selected' : ''
            }`,
            onClick: () => setSelected(style)
          }),
          h(
            'div',
            { class: 'tile-count' },
            data.filter(tile => tile === style).length
          )
        )
      )
    ),
    h(
      'div',
      {
        class: 'board',
        style: { '--width': width, '--height': height },
        onPointerDown: e => {
          setPointerId(e.pointerId)
          e.currentTarget.setPointerCapture(e.pointerId)
          paint(e)
        },
        onPointerUp: e => {
          if (e.pointerId === pointerId) {
            setPointerId(null)
          }
        },
        onPointerCancel: e => {
          if (e.pointerId === pointerId) {
            setPointerId(null)
          }
        },
        // Setting pointer capture does not bubble pointerenter to descendants,
        // and pointerover on parent doesn't work either :(
        onMouseMove: e => {
          // e.target is always the board
          if (pointerId !== null) {
            paint(e)
          }
        }
      },
      Array.from(range(width * height), key =>
        h('div', {
          class: `tile ${data[key]}`,
          key,
          'data-index': key,
          'data-current': data[key]
        })
      )
    ),
    h(
      'div',
      { class: 'controls' },
      h(
        SizeControl,
        {
          value: width,
          onChange: newWidth => {
            setWidth(newWidth)
            setData(
              Array.from(range(height), row =>
                Array.from(range(newWidth), column =>
                  column < width ? data[column + row * width] : DEFAULT_STYLE
                )
              ).flat()
            )
          }
        },
        'Width'
      ),
      h(
        SizeControl,
        {
          value: height,
          onChange: newHeight => {
            setHeight(newHeight)
            setData(
              Array.from(range(height), row =>
                row < height
                  ? data.slice(row * width, (row + 1) * width)
                  : Array.from(range(width), () => DEFAULT_STYLE)
              ).flat()
            )
          }
        },
        'Height'
      ),
      h(
        'button',
        {
          class: 'reset-btn',
          onClick: () => {
            setData(
              Array.from(range(height), row =>
                Array.from(range(width), column =>
                  row === 0 || row === height - 1
                    ? column === 0 || column === width - 1
                      ? `empty ${row === 0 ? 'top' : 'bottom'}-${
                          column === 0 ? 'left' : 'right'
                        }`
                      : 'fill'
                    : column === 0 || column === width - 1
                    ? 'fill'
                    : 'empty'
                )
              ).flat()
            )
          }
        },
        'Reset'
      )
    )
  )
}

render(h(App), document.getElementById('root'))
