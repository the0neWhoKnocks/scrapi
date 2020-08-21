const compression = require('compression');
const polka = require('polka');
const { PORT } = require('../constants');
const heartbeatMiddleware = require('./middleware/heartbeat');
const apiMiddleware = require('./middleware/api');

const port = process.env.PORT || PORT;
const middleware = [
  compression({ threshold: 0 }),
  heartbeatMiddleware,
  apiMiddleware,
];

polka()
  .use(...middleware)
  .listen(PORT, err => {
    if (err) console.log('error', err);
    else {
      console.log(`Server running at: http://localhost:${port}`);
    }
  });
