# ScrAPI

A simple API to scrape specific HTML data.

---

## Install

`npm i`

### HTTPS

Some experiences will complain if the App isn't run over https. To get that
wired up, follow the below instructions.

- Run `./bin/gen-certs.sh "App Name"`
   - This'll create a `certs.app-name` folder with files like
     ```sh
     /certs.app-name
       app-name.crt
       app-name.key
       app-name-CA.crt
       app-name-CA.key
     ```
- The non-`-CA` files will be used for the App. When starting the App via Node
or Docker, you'll need to set this environment variable
   ```sh
   `NODE_EXTRA_CA_CERTS="$PWD/certs/app-name.crt"`
   ```
   - Note that `$PWD` expands to an absolute file path.
   - The App automatically determines the `.key` file so long as the `.key` & `.crt`
   files have the same name.
- Install the Certificate Authority in **Chrome**:
   - Settings > In the top input, filter by `cert` > Click `Security`
   - Click on `Manage certificates`
   - Go the `Trusted Root Certification Authorities` tab
   - Choose `Import`
   - Find the `certs/app-name-CA.crt` file, and add it.
   - If the cert doesn't seem to be working, try in Incognito first. If it's
   working there, then just restart Chrome to get it to work in non-Incognito.
- Install the Certificate Authority in **Firefox**:
   - Options > In the top input, filter by `cert` > Click `View Certificates...`
   - Go to the `Authorities` tab
   - Click on `Import`
   - Find the `certs/app-name-CA.crt` file, and add it.
   - Check `Trust this CA to identify websites`.
- Install the Certificate Authority on **Android**:
   - Copy the CA `.crt` & `.key` to the device
   - Go to `Settings` > `Security` > Click on `Install from storage`
   - Select the `.crt` file
   - Give it a name

---

## Start

```sh
# Standard Server
npm run start

# Development Server
npm run start:dev

# Via Docker
docker-compose up --abort-on-container-exit
```

For more info on how the `config` for the VPN is set up, visit: https://github.com/the0neWhoKnocks/docker-vpn

---

## Request Data

**Accepted Params**
| Param | Optional | Description |
| ----- | -------- | ----------- |
| `headers` | `true` | Any extra headers you may need to send along to the `url` |
| `selectors` | `false` | A pipe `|` delimited list of CSS selectors. |
| `ua` | `true` | Whether or not to pass the request's User-Agent along. |
| `url` | `false` | The URL to the page you want to scrape. |

```js
const url = new URL('https://localhost:3000/api');
url.search = new URLSearchParams({
  // Any extra headers that may be required for the page
	headers: encodeURIComponent(JSON.stringify({
    Host: 'site.com',
    Referer: 'https://site.com/page/',
	})),
  // A list of CSS selectors separated by a pipe `|` character
	selectors: encodeURIComponent('meta[itemprop="image"]|img[alt="Google"]|form[action="/search"]|.bad-selector'),
	ua: true,
  // The URL of the page you want to scrape data from
	url: 'https://google.com/',
}).toString();

fetch(url)
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
