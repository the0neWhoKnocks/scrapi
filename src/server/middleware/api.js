const axios = require('axios');
const cheerio = require('cheerio');

const apiMiddleware = (req, resp, next) => {
  if (req.url.startsWith('/api')) {
    const { selectors, url } = req.query;
    
    console.log(`[LOAD] "${url}"`);

    axios.get(url)
      .then((page) => {
        if (page.status === 200) {
          const html = page.data;
          const $ = cheerio.load(html);
          const results = [];
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
          
          resp.setHeader('Access-Control-Allow-Origin', '*');
          resp.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
          resp.end(JSON.stringify(results));
        }
      })
      .catch((err) => {
        console.log(err);
        resp.end(JSON.stringify({ error: err.stack }));
      });
  }
  else next();
};

module.exports = apiMiddleware;