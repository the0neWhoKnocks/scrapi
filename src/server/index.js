const compression = require('compression');
const polka = require('polka');
const { PORT } = require('../constants');
const apiMiddleware = require('./middleware/api');
const heartbeatMiddleware = require('./middleware/heartbeat');
const inspectMiddleware = require('./middleware/inspect');

const port = process.env.PORT || PORT;
const middleware = [
  compression({ threshold: 0 }),
  inspectMiddleware(),
  heartbeatMiddleware,
  apiMiddleware,
];
const { handler: requestHandler } = polka().use(...middleware);

let httpModule;
let protocol = 'http';
let server;

if (process.env.NODE_EXTRA_CA_CERTS) {
  const { readFileSync } = require('fs');
  const cert = readFileSync(process.env.NODE_EXTRA_CA_CERTS, 'utf8');
  const key = readFileSync(process.env.NODE_EXTRA_CA_CERTS.replace('.crt', '.key'), 'utf8');
  
  httpModule = require('https');
  protocol = 'https';
  server = httpModule.createServer({ cert, key }, requestHandler);
}
else {
  httpModule = require('http');
  server = httpModule.createServer(requestHandler);
}

server.listen(PORT, err => {
  if (err) console.log('error', err);
  else {
    console.log(`Server running at: ${protocol}://localhost:${port}`);
  }
});
