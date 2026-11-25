# srinivasaimandi.github.io

Personal site of Srinivasa Rao Imandi, Test Automation Engineer. It's live at
<https://srinivasaimandi.github.io/>.

## Structure

- `index.html`: the current one-page site
- `style.css`: styles for the current site
- `favicon.svg`: browser tab icon
- `images/`: images used by the current site
- `old/`: earlier versions of the site (v1 to v4), kept for reference

## Running locally

The site is plain HTML and CSS with no build step. Open `index.html` in a browser,
or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploying

GitHub Pages serves the `master` branch, so pushing to `master` publishes the site.
