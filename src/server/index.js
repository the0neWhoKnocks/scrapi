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

function startServer() {
  server.listen(PORT, err => {
    if (err) console.log('error', err);
    else {
      console.log(`Server running at: ${protocol}://localhost:${port}`);
      
      if (process.env.VPN_ENABLED) {
        const axios = require('axios');
        axios.get('https://api.ipify.org/', { timeout: 3000 })
          .then(resp => {
            console.log(`Public IP: "${resp.data}"`);
          })
          .catch(err => {
            console.log(err);
            process.exit(1);
          });
      }
    }
  });
}

if (process.env.VPN_ENABLED) {
  const { networkInterfaces } = require('os');
  const maxSeconds = 60;
  let count = 1;
  
  console.log('[WAIT] For VPN to connect');
  
  const waitForConnection = setInterval(() => {
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          if (name.startsWith('tun')) {
            clearInterval(waitForConnection);
            startServer();
          }
        }
      }
    }
    
    if (count === maxSeconds) {
      clearInterval(waitForConnection);
      console.log(`[ERROR] It's been ${maxSeconds} seconds, and the VPN hasn't connected. Giving up.`);
      process.exit(1);
    }
    count += 1;
  }, 1000);
}
else startServer();
