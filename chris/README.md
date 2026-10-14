# Mentor Canada — Bootstrap 5 rebuild

Buildless HTML, CSS, and JavaScript rebuild of Figma frame `641:349`.

Open `index.html` directly, or serve this directory with any static web server. No npm installation or build step is needed.

- `index.html`: complete 16-chapter story, desktop composition and mobile document flow.
- `styles.css`: Figma layer styling and responsive artwork compositions.
- `script.js`: artwork sizing, reading progress, and Bootstrap offcanvas chapter navigation.
- `fonts.css`: locally hosted Big Shoulders Text and Nunito.
- `assets/`: 66 original Figma PNG/SVG assets, Bootstrap 5.3.3 CSS/JS, and fonts.

Desktop chapters preserve the 1440px Figma compositions and scale to tablet widths. Below 768px, a Bootstrap grid reflows the story for readable mobile text. `data-node-id` attributes map desktop layers to Figma.

The publisher header and footer retain the original raster artwork from Figma. Live links and a Bootstrap section menu are provided. Publisher accounts and memberships use the publisher's existing site.

Verified in Chrome at 1440px and 390px: all 100 desktop artwork placements load, no JavaScript errors, no mobile horizontal overflow, and working chapter navigation. All assets are stored locally; no temporary Figma asset URLs are used at runtime.

Live GitHub Pages URL: https://loogart.github.io/futureofgood-mentor/chris/
