const nodemon = require('nodemon');
const { PORT } = require('./src/constants');

const port = +process.env.PORT || PORT;
const LOG_PREFIX = '[WATCHER]';
let httpModule;
let protocol = 'http';

if (process.env.NODE_EXTRA_CA_CERTS) {
  httpModule = require('https');
  protocol = 'https';
}
else {
  httpModule = require('http');
}

const checkServer = () => new Promise((rootResolve, rootReject) => {
  let count = 0;
  const check = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      const serverAddress = `${protocol}://localhost:${port}`;

      console.log(`${LOG_PREFIX} Pinging ${serverAddress}`);
      httpModule
        .get(serverAddress, (res) => resolve(res))
        .on('error', (err) => reject(err));
    }, 1000);
  });
  const handleError = (err) => {
    if (count < 3) {
      ping();
      count++;
    }
    else {
      console.log(err)
      rootReject();
    }
  };
  const handleSuccess = () => { rootResolve(); };
  const ping = () => {
    check()
      .then(handleSuccess)
      .catch(handleError);
  };

  ping();
});

nodemon({
  delay: 500,
  script: './src/server',
  watch: [
    './src/server/**/*.js'
  ],
})
  .on('restart', () => {
    console.log(`${LOG_PREFIX} Server restarting because file(s) changed`);

    checkServer()
      .then(() => {
        console.log('Server has fully started');
      })
      .catch(() => {
        console.log("Couldn't detect the server, a manual reload may be required");
      });
  });

function killWatcher(evType) {
  console.log(`${LOG_PREFIX} Killing watcher (${evType})`);
  nodemon.emit('quit');
  process.exit(0);
}

process.on('SIGINT', killWatcher.bind(null, 'SIGINT'));
process.on('SIGTERM', killWatcher.bind(null, 'SIGTERM'));
process.on('SIGUSR2', killWatcher.bind(null, 'SIGUSR2'));