import * as esbuild from 'esbuild'
import http from 'node:http'

const build = process.argv[2] !== 'dev'

const ctx = await esbuild.context({
  bundle: true,
  format: 'esm',
  entryPoints: ['./misc/kaaba/index.ts'],
  outdir: './misc/kaaba/',
  sourcemap: !build,
  minify: build
})

if (build) {
  await ctx.rebuild()
  process.exit()
}

const { hosts, port } = await ctx.serve({ servedir: '..' })

http
  .createServer((req, res) => {
    const options = {
      hostname: hosts[0],
      port: port,
      path: req.url,
      method: req.method,
      headers: req.headers
    }

    // Forward each incoming request to esbuild
    const proxyReq = http.request(options, proxyRes => {
      // Allow 5us precision performance.now()
      // https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#security_requirements
      proxyRes.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
      proxyRes.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
      res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers)
      proxyRes.pipe(res, { end: true })
    })

    // Forward the body of the request to esbuild
    req.pipe(proxyReq, { end: true })
  })
  .listen(8080)

console.log('http://localhost:8080/words-go-here/misc/kaaba/')
