const axios = require('axios');
const cheerio = require('cheerio');

const apiMiddleware = (req, resp, next) => {
  if (req.url.startsWith('/api')) {
    const { selectors, ua, url } = req.query;
    const userAgent = ua && req.headers && req.headers['user-agent'];
    
    console.log(`[LOAD] "${url}"`);
    
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    const parseResponse = (payload) => {
      if (!payload && !payload.response) resp.end(JSON.stringify({ error: payload.stack }));
      else {
        if (payload.status === undefined) payload = payload.response;
        
        const results = [];
        const html = payload.data;
        const $ = cheerio.load(html);
        const _selectors = selectors.split('|');
        
        // console.log($.root().html());

        _selectors.forEach(selector => {
          console.log(`  [FIND] Selector: "${selector}"`);

          const nodeData = $(selector);

          if (nodeData && nodeData[0]) {
            results.push({
              attr: nodeData[0].attribs,
              html: nodeData.html(),
              text: nodeData.text(),
            });
          }
        });
        
        resp.end(JSON.stringify({
          results,
          status: payload.status,
          statusText: payload.statusText,
        }));
      }
    };
    
    const opts = {};
    
    if (userAgent) {
      if (!opts.headers) opts.headers = {};
      opts.headers['User-Agent'] = userAgent;
    }
    
    if (Object.keys(opts).length) {
      const formattedOpts = JSON.stringify(opts, null, 2)
        .split('\n')
        .map(line => `  ${line}`)
        .join('\n');
      console.log(`  [REQ_OPTS]\n${formattedOpts}`);
    }
    
    axios.get(url, opts).then(parseResponse).catch(parseResponse);
  }
  else next();
};

module.exports = apiMiddleware;