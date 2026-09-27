# mikeasieduasare.github.io

Personal research website of Michael Asiedu Asare, AI safety researcher,
engineer, and builder. Live at <https://mikeasieduasare.github.io>.


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



