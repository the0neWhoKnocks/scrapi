# ScrAPI

A simple API to scrape specific HTML data.

---

## Install

`npm i`

---

## Start

```sh
# Standard Server
npm run start

# Development Server
npm run start:dev
```

---

## Request Data

```js
// The URL of the page you want to scrape data from
var url = encodeURIComponent('https://google.com/');
// A list of CSS selectors separated by a pipe `|` character
var selectors = encodeURIComponent('meta[itemprop="image"]|img[alt="Google"]|form[action="/search"]|.bad-selector');

fetch(`http://localhost:3000/api?url=${url}&selectors=${selectors}`)
  .then(resp => resp.json())
  .then((resp) => {
    console.log(resp);
  })
  .catch((err) => {
    console.error(err);
  });
```
