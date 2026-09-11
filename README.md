# mac-duo.com

The website for [Mac Duo](https://github.com/ninobc/mac-duo). Static, built with Vite; the hero is a Three.js MacBook whose lid closes as you scroll, with the app's fold shader running on its screen (`src/fold-shader.js` mirrors `DuoShaders.swift`, `src/fold-math.js` mirrors `DuoCore`).

```sh
npm install
npm run dev       # http://localhost:5180
npm run build     # dist/
```

Pushes to `main` deploy to GitHub Pages (`.github/workflows/deploy.yml`). `public/CNAME` holds the domain; point GoDaddy's A records at GitHub Pages (185.199.108–111.153) and `www` at `ninobc.github.io`. `public/updates.json` is the feed the app polls for new versions; update it with each release.

The MacBook Pro 14 model (`public/models/macbook-pro-14.glb`) is Apple's AR Quick Look asset (`macbook_pro_14_silver.usdz`), converted with ModelIO → OBJ → obj2gltf → Draco; parts are named `lid__…` / `body__…` and the loader re-bases the lid on a hinge pivot. It is Apple's property and is used for illustration only. The Draco decoder in `public/draco/` is from Three.js (MIT).
