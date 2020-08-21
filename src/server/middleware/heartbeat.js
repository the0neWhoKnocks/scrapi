const heartbeatMiddleware = (req, resp, next) => {
  if (req.url === '/') resp.end('Alive');
  else next();
};

module.exports = heartbeatMiddleware;