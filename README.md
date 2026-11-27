# srinivasaimandi.github.io

Personal site of Srinivasa Rao Imandi, Test Automation Engineer. It's live at
<https://srinivasaimandi.github.io/>.

## Structure

- `index.html`: the current one-page site
- `style.css`: styles for the current site
- `favicon.svg`: browser tab icon
- `images/`: images used by the current site
- `resume/`: the résumé
  - `Srinivasa_Rao_Imandi_Resume.pdf` is the one the site links to. Keep this name and replace the file
    to update the résumé, so shared links never break.
  - `Srinivasa_Rao_Imandi_Resume_ver1.pdf` (two pages, the current live version) and
    `Srinivasa_Rao_Imandi_Resume_ver2.pdf` (one page, backup) are the two versions.

The learning guide lives in its own repository and is served under this site's address:
[selenium-to-playwright](https://github.com/Srinivasaimandi/selenium-to-playwright).

Earlier versions of the site are in the git history.

## Running locally

The site is plain HTML and CSS with no build step. Open `index.html` in a browser,
or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploying

GitHub Pages serves the `master` branch, so pushing to `master` publishes the site.
