# SFACSTUDIO Viewer

[![License](https://img.shields.io/github/license/sfacspace/sfacstudio-viewer)](https://github.com/sfacspace/sfacstudio-viewer/blob/main/LICENSE)

| [Local Development](#local-development) | [Features](#features) | [Project Structure](#project-structure) | [Localization](#localization) |

SFACSTUDIO is a PlayCanvas-based 3D Gaussian Splatting viewer. It lets you load PLY files in the browser, use the timeline and camera keyframes, selection and volume tools, **add description comments** (speech-bubble markers with camera restore), and export to video or a single HTML file. It is built on web technologies and runs in the browser, so there's nothing to download or install.

A live version of this tool is available at: https://sfacstudio.vercel.app/

![SFACSTUDIO Viewer – 3D viewport, timeline, and interactive controls](static/Landingimg.gif)

## Local Development

To initialize a local development environment for SFACSTUDIO Viewer, ensure you have [Node.js](https://nodejs.org/) 18 or later installed. Follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/sfacspace/sfacstudio-viewer.git
   cd sfacstudio-viewer
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server (copies assets, then starts Vite):

   ```sh
   npm run dev
   ```

4. Open a web browser and navigate to `http://localhost:5173`.

When changes to the source are detected, the app is rebuilt automatically. Simply refresh your browser to see your changes.

### Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Development server (copy-assets + Vite) |
| `npm run build` | Production build to `dist/` |
| `npm run start` | Preview production build on port 8000 |

## Features

Features are implemented by modules under `js/`.

| Area | Modules | Description |
|------|---------|-------------|
| **Viewer & loading** | `core/viewer.js`, `splatLoader`, `fileLoader`, `loadSessionManager`, `plySequenceController`, `sequencePlayback` | Orbit camera (LMB rotate, wheel zoom, RMB pan), infinite grid, axis gizmo; load PLY via URL, file picker, or drag-and-drop; session and sequence playback |
| **Timeline** | `timeline/` (keyframes, playback, cameraMoving, cameraTemplates, pin, ticks, tooltip) | Keyframes, playback, camera movement and templates, timeline UI |
| **Selection** | `tools/selectionTool`, `SelectorOverlay`, `SelectionHistory`, selectors (Rectangle, Brush, Box, Sphere) | Rectangle, brush, and volume (box/sphere) selection |
| **UI** | `ui/inspector`, `objectDetailsPanel`, `objectDescription`, `gizmo`, `draggablePanel`, `gridDraw`, `cameraSettings`, `performanceSettings` | Inspector, object details, **description comments** (speech-bubble markers, camera restore), transform gizmo, draggable panels, grid, settings |
| **Camera** | `camera/flyMode` | Fly mode (WASD, Q/E, LMB look); return to Orbit with **quaternion slerp** (no roll flip) |
| **Export** | `export/exportVideo`, `exportSingleHTML`, `embeddedViewerScript`, `exportPly`, `compressedPlyExport` | MP4 video, single HTML viewer (comments overlay, default Fly mode, quaternion camera transition), PLY and compressed PLY |
| **Services** | `services/memoryMonitor`, `importCache`, `i18n.js` | Memory monitoring, import cache, i18n (en, ko) |

**Tech stack:** [PlayCanvas](https://playcanvas.com/) 2.15.1 · [@playcanvas/splat-transform](https://github.com/playcanvas/splat-transform) · [Vite](https://vitejs.dev/) 5 · JavaScript (ES modules)

## Project Structure

```
├── index.html          # Entry HTML
├── css/                # Styles (main, timeline, sections, animations)
├── js/
│   ├── main.js         # App bootstrap, UI wiring
│   ├── core/           # viewer, splatLoader, fileLoader, loadSessionManager, plySequenceController, sequencePlayback
│   ├── ui/             # timeline, grid, gizmo, inspector, objectDetailsPanel, objectDescription, cameraSettings, performanceSettings, draggablePanel, selectorOverlay
│   ├── tools/          # selectionTool, SelectionHistory, selectors (Rectangle, Brush, Box, Sphere, SelectionRenderer)
│   ├── timeline/       # keyframes, playback, cameraMoving, cameraTemplates, pin, ticks, tooltip, objects
│   ├── export/         # exportVideo, exportSingleHTML, embeddedViewerScript, exportPly, compressedPlyExport
│   ├── camera/         # flyMode
│   ├── services/       # memoryMonitor, importCache
│   └── i18n.js         # i18n (en, ko)
├── static/             # Favicon, logo, loading SVG
├── public/             # Vite static assets (playcanvas.mjs via copy-assets)
└── locales/            # i18n (en, ko)
```

## Localization

Supported languages are in the `locales/` directory (e.g. `en`, `ko`). The app uses `js/i18n.js` for internationalization. To add or change a language, add or edit the corresponding JSON file under `locales/` and wire it in `i18n.js` as needed.

## License

MIT. See [LICENSE](LICENSE).

## Third-Party Licenses

This project uses third-party software that may have different licenses. See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for attributions and license notices, including:

- **PlayCanvas** (MIT) – 3D engine  
- **ammo.js** (zlib-style) – physics (Bullet), loaded from CDN  
- **@playcanvas/splat-transform** (MIT) – Gaussian Splatting transform  
- **fflate** (MIT) – compression  
- **mediabunny** (MPL-2.0) – media handling (e.g. video export)
