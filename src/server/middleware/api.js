const axios = require('axios');
const cheerio = require('cheerio');

const apiMiddleware = (req, resp, next) => {
  if (req.url.startsWith('/api')) {
    const { headers, selectors, ua, url } = req.query;
    const userAgent = ua && req.headers && req.headers['user-agent'];
    const additionalHeaders = headers && JSON.parse(decodeURIComponent(headers)) || undefined;
    
    console.log(`[LOAD] "${url}"`);
    
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    const parseResponse = (payload) => {
      if (
        (!payload && !payload.response)
        || payload instanceof Error
      ) {
        const status = payload.status || payload.response.status;
        resp.error(payload.stack, status);
      }
      else {
        if (payload.status === undefined) payload = payload.response;
        
        const results = [];
        const html = payload.data;
        const $ = cheerio.load(html);
        const _selectors = decodeURIComponent(selectors).split('|');
        
        // console.log($.root().html());

        _selectors.forEach(selector => {
          console.log(`  [FIND] Selector: "${selector}"`);

          const nodeData = $(selector);

          if (nodeData && nodeData.length) {
            nodeData.each((ndx, node) => {
              results.push({
                attr: node.attribs,
                html: $(node).html(),
                text: $(node).text(),
              });
            });
          }
        });
        
        resp.json({ results });
      }
    };
    
    const opts = {};
    
    if (userAgent || additionalHeaders) opts.headers = {};
    
    if (userAgent) opts.headers['User-Agent'] = userAgent;
    
    if (additionalHeaders) {
      Object.keys(additionalHeaders).forEach((header) => {
        opts.headers[header] = additionalHeaders[header];
      });
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