import { Container, View, Text, Button } from './ui.mjs'

const views = {
  start: new View('start-view', [
    new Text('title', 'Epic evolution'),
    new Button('start-btn', 'Start', () => {
      showView(views.generations)
    })
  ]),
  generations: new View('generations-view', [
    new Container('gen-side gen-left', [
      new Text('heading', 'Generation 0'),
      new Container('line-graph-wrapper'),
      new Container('area-graph-wrapper')
    ]),
    new Container('gen-side gen-right', [
      new Container('gens-buttons', [
        new Button('', 'Watch next generation'),
        new Button('', 'Generate immediately'),
        new Button('', 'Generate automatically')
      ]),
      new Container('winners'),
      new Container('histogram-wrapper')
    ])
  ])
}
let currentView
function showView (view) {
  if (currentView) {
    currentView.hide()
  }
  view.show()
  currentView = view
}

showView(views.start)
