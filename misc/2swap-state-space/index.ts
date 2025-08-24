import { traverse } from './Board.ts'

console.log(
  Array.from(
    traverse(
      {
        board: {
          width: 4,
          height: 5,
          blocks: [
            { width: 1, height: 2, canHorizontal: true, canVertical: true },
            { width: 2, height: 2, canHorizontal: true, canVertical: true },
            { width: 1, height: 2, canHorizontal: true, canVertical: true },
            { width: 1, height: 2, canHorizontal: true, canVertical: true },
            { width: 2, height: 1, canHorizontal: true, canVertical: true },
            { width: 1, height: 1, canHorizontal: true, canVertical: true },
            { width: 1, height: 1, canHorizontal: true, canVertical: true },
            { width: 2, height: 1, canHorizontal: true, canVertical: true },
            { width: 1, height: 1, canHorizontal: true, canVertical: true },
            { width: 1, height: 1, canHorizontal: true, canVertical: true }
          ]
        },
        blocks: [
          { left: 0, top: 0 },
          { left: 1, top: 0 },
          { left: 3, top: 0 },
          { left: 0, top: 2 },
          { left: 1, top: 2 },
          { left: 1, top: 3 },
          { left: 2, top: 3 },
          { left: 3, top: 2 },
          { left: 0, top: 4 },
          { left: 3, top: 4 }
        ]
      },
      'breadth'
    )
  )
)
