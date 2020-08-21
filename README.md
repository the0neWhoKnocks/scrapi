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

---

## Releasing

1. Prep the repo
   - Ensure the info in `./bin/releaseConfig.sh` is correct for your repo.
   - Create a `CHANGELOG.md` if one does not already exist. The contents should
   be this.
      ```md
      # Changelog
      ---

      ```
1. Run `./bin/release.sh` and follow the steps.
   - To skip having to enter a Docker password every time, create a
   `.dockercreds` file in the same directory as `release.sh` and put your
   password in there.
   - In order to automatically convert git tags to actual releases you'll need
   to generate a [Personal Access Token](https://github.com/settings/tokens),
   and add it to your global git config `git config --global github.token <YOUR_TOKEN>`.

If something happens during the final stage of the release, you'll have to
manually reset some things.
```sh
# Reset the last commit
git reset --soft HEAD~1
# Verify that just release files will be reset. You should just see:
# - `CHANGELOG.md`
# - `package-lock.json`
# - `package.json`
git status
# If the above is good, unstage those changes
git reset
# Reset changed files
git checkout -- CHANGELOG.md package.json package-lock.json
# Check if a git tag was created
git tag | cat
# If so, remove it
git tag -d <TAG_NAME>
```
