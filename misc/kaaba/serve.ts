import { serveDir, serveFile } from 'jsr:@std/http/file-server'

Deno.serve({ port: 8080 }, (req: Request) => {
  return serveDir(req, {
    fsRoot: '..',
    // Allow 5us precision performance.now()
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#security_requirements
    headers: [
      'Cross-Origin-Opener-Policy: same-origin',
      'Cross-Origin-Embedder-Policy: require-corp',
      // https://stackoverflow.com/a/2068407
      'Cache-Control: no-cache, no-store, must-revalidate',
      'Pragma: no-cache',
      'Expires: 0'
    ]
  })
})

console.log('http://localhost:8080/')
