module.exports = () => {
  // https://nodejs.org/api/inspector.html
  let inspector;
  
  if (process.env.NODE_ENV === 'dev') {
    inspector = require('inspector');
    inspector.open();
  }
  
  return function inspectMiddleware(req, resp, next) {
    resp.setHeader('Content-Type', 'application/json');
    
    if (process.env.NODE_ENV === 'dev') {
      if (req.url === '/json') resp.end(JSON.stringify({}));
      else if (req.url === '/json/list') {
        resp.end(JSON.stringify(inspector.url()));
      }
      else if (req.url === '/json/version') {
        resp.end(JSON.stringify({
          Browser: `node.js/${ process.version }`,
          'Protocol-Version': '1.1',
        }));
      }
      else next();
    }
    else next();
  }
}