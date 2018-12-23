const VERSION = 1; // change to force update

function addFooterHeader(title, html) {
  return `<!DOCTYPE html>
<html>
	<head>
  	<link href="https://fonts.googleapis.com/css?family=Fredoka+One|Open+Sans" rel="stylesheet">
  	<link href="/css/buttons.css" rel="stylesheet">
  	<link href="/css/gamepro5.css" rel="stylesheet">
  	<link href="/css/accordion.css" rel="stylesheet">
  	<link href="/css/dropdown.css" rel="stylesheet">
  	<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
  	<title>${title}</title>
	</head>
  <body background=/images/background.jpg>
    <center>
      <table border=10 bordercolor=red width=880 bgcolor=#aaa8ad>
        <tr><td colspan=2><h1><center>Gamepro5</center></h1></td></tr>
        <tr><td width=100 valign=top></td>${html}</tr>
      </table>
      <p></p>
    </center>
    <center>
      <font color="white">
        Website made by Gamepro5 and was helped by Sheeptester.
        Visit him <a class="newlinks" href=https://sheeptester.github.io> HERE</a>.
      </font>
    </center>
    <script src="/buttons_links.js"></script>
    <script src="/js/dropdown.js"></script>
  </body>
</html>`;
}

const customHTML = {
  '/test-sw': addFooterHeader('Gamepro5 - Test SW page', `<td valign="center"><h3>test</h3></td>`)
};

self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname === 'gamepro5.github.io' && customHTML[url.pathname]) {
    e.respondWith(new Response(customHTML[url.pathname], {status: 200, statusText: 'OK'}));
  }
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

const errors = [];
self.addEventListener('error', e => {
  errors.push(e);
});
