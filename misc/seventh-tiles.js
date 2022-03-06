import { render, h, Fragment } from 'https://esm.sh/preact@10.6.6/'
import { useState, useEffect } from 'https://esm.sh/preact@10.6.6/hooks'

function * range (count) {
  for (let i = 0; i < count; i++) {
    yield i
  }
}

const tileStyles = [
  'empty',
  'fill',
  'empty top-left',
  'empty top-right',
  'empty bottom-left',
  'empty bottom-right',
  'fill top-left',
  'fill top-right',
  'fill bottom-left',
  'fill bottom-right',
  'empty right',
  'empty left'
]
const DEFAULT_STYLE = 'empty'
const PALETTE = ['#e36f1d', '#19948C']

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
      onInput: e => onChange(+e.currentTarget.value)
    })
  )
}

function App ({ initWidth, initHeight, initColour, initData }) {
  const [width, setWidth] = useState(initWidth)
  const [height, setHeight] = useState(initHeight)
  const [colour, setColour] = useState(initColour)
  const [data, setData] = useState(initData)
  const [selected, setSelected] = useState('fill')
  const [pointerId, setPointerId] = useState(null)

  const toUrl = () => {
    return `?${new URLSearchParams({ width, height, colour })}#${data
      .map(style => tileStyles.indexOf(style).toString(36))
      .join('')}`
  }
  useEffect(() => {
    window.history.pushState({}, '', toUrl())
  }, [width, height, colour])

  const paint = e => {
    const tile = document.elementFromPoint(e.clientX, e.clientY)
    if (tile && tile.dataset.current !== selected) {
      const index = +tile.dataset.index
      setData(data => data.map((old, i) => (i === index ? selected : old)))
    }
  }
  const handlePointerEnd = e => {
    if (pointerId === e.pointerId) {
      setPointerId(null)
      window.history.replaceState({}, '', toUrl())
    }
  }

  return h(
    'div',
    { class: 'root', style: { '--colour': colour } },
    h(
      'div',
      { class: 'tile-selection' },
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
        onPointerUp: handlePointerEnd,
        onPointerCancel: handlePointerEnd,
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
        'div',
        { class: 'colours' },
        PALETTE.map(colour =>
          h('button', {
            class: 'clickable colour-select default-colour',
            key: colour,
            style: { backgroundColor: colour },
            onClick: () => setColour(colour)
          })
        ),
        h('input', {
          type: 'color',
          class: 'clickable colour-select custom-colour',
          value: colour,
          onInput: e => setColour(e.currentTarget.value)
        })
      ),
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

const params = new URL(window.location).searchParams
const width = +params.get('width') || 10
const height = +params.get('height') || 10

render(
  h(App, {
    initWidth: width,
    initHeight: height,
    initColour: params.get('colour') ?? PALETTE[0],
    initData:
      window.location.hash.length > 1
        ? Array.from(
            window.location.hash.slice(1, width * height + 1).padEnd('0'),
            index => tileStyles[parseInt(index, 36)]
          )
        : Array.from(
            range(width * height),
            () => tileStyles[(tileStyles.length * Math.random()) | 0]
          )
  }),
  document.getElementById('root')
)
