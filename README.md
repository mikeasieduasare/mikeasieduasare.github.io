# mikeasieduasare.github.io

Personal research website of Michael Asiedu Asare, AI safety researcher,
engineer, and builder. Live at <https://mikeasieduasare.github.io>.

The product specification (`docs/`) is kept locally by the owner and is not
part of this repository; `.gitignore` prevents it from being committed.

## Stack

Static HTML, one stylesheet, one script. No framework, no build step, no
dependencies. GitHub Pages serves the repository root of `main` directly.
Pages runs its default Jekyll pass, which copies the HTML through unchanged;
`_config.yml` only excludes `README.md` from the published site.

```
index.html          Home (hero, research, selected work, building, publications,
                    writing, about, contact)
research.html       Research agenda and the six research areas
projects.html       Projects: problem, method, result, status
publications.html   Published, under review, preprints and other outputs
writing.html        Essay index
essays/             One page per essay (relative URLs use ../)
about.html          Biography and trajectory
cv.html             Web CV with PDF download
404.html            Not-found page (uses root-absolute URLs; see below)
_config.yml         Keeps this README out of the published site
style.css           All styles
script.js           Theme toggle, mobile navigation, hero figure
assets/fonts/       Space Grotesk (variable, Latin subset) + OFL licence
assets/icons/       favicon.svg
assets/documents/   Downloadable documents (CV PDF)
assets/images/      Images (none yet)
```

## Preview locally

Any static server works. From the repository root:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Conventions

**Shared header and footer.** Every page carries an identical copy of the
header and footer (only `aria-current="page"` on the active nav link differs).
There is no templating step, so a change to either must be made on all eight
pages (plus each essay). `404.html` uses root-absolute URLs (`/style.css`, `/research.html`)
because GitHub Pages serves it at arbitrary paths; every other page uses
relative URLs.

**Theme.** A small inline script in each page's `<head>` applies the saved or
system theme before first paint (`localStorage` key `theme`, values `light` /
`dark`). Colours are defined once as tokens at the top of `style.css`; dark
mode redefines the tokens rather than inverting them.

**CSS.** `style.css` is ordered: tokens → reset/base → typography → navigation
→ shared components → page components → responsive → reduced motion. It is
mobile-first; breakpoints are 600, 900, 1024, and 1200px, plus container
queries inside the hero. Each selector is defined in one place. No fixed
heights on content sections and no `overflow: hidden` on page containers.

**Hero figure.** A conceptual illustration, not data. The state
(stable / uncertain / warning / unsafe) is the point's normalised distance
from the centre relative to the boundary contour. The geometry constants
(`FIG` in `script.js`) also produced the static SVG in `index.html`; if you
change them, regenerate the static paths so the no-JavaScript version matches.
The script rebuilds the contours at runtime from the same function.

**Line endings.** LF, enforced by `.gitattributes`.

## Updating content

- **Publication:** add an entry to `publications.html` (and the short list on
  `index.html` and the CV if published). Use only verified metadata; link the
  DOI via `https://doi.org/…`. Never invent a link.
- **Project:** add a `<li class="work" id="…">` to `projects.html` with Problem /
  Method / Result and a status line.
- **Essay:** copy an existing page in `essays/`, replace its title, meta tags,
  and body, then add it to the top of the list on `writing.html` (and the
  homepage Writing section if it is the latest).
- **CV PDF:** replace `assets/documents/Michael_Asiedu_Asare_CV.pdf` with the
  new file (same name) and update the web CV to match.

## Public repository

This repository and the site are public. Do not commit API keys, credentials,
tokens, private research data, unpublished manuscripts, or other people's contact
details. Source material (papers, CV drafts, essays in
progress) stays outside version control; see `.gitignore`.
