# mac-duo.com

The website for [Mac Duo](https://github.com/ninobc/mac-duo). Static, built with Vite; the hero is a Three.js MacBook whose lid closes as you scroll, with the app's fold shader running on its screen (`src/fold-shader.js` mirrors `DuoShaders.swift`, `src/fold-math.js` mirrors `DuoCore`).

```sh
npm install
npm run dev       # http://localhost:5180
npm run build     # dist/
```

Pushes to `main` deploy to GitHub Pages (`.github/workflows/deploy.yml`). `public/CNAME` holds the domain; point GoDaddy's A records at GitHub Pages (185.199.108–111.153) and `www` at `ninobc.github.io`. `public/updates.json` is the feed the app polls for new versions; update it with each release.

The MacBook model (`public/models/macbook.glb`) comes from the MIT-licensed [react-macbookpro](https://github.com/shahdinsalman23/react-macbookpro) project; the Draco decoder in `public/draco/` is from Three.js (MIT).
