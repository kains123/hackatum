# LogiCreate — Interactive 3D with Logitech Devices

![Hackatum demo](./hackatum.gif)

<sub>If the demo GIF does not show, place `hackatum.gif` in the repository `public/` folder (`public/hackatum.gif`).</sub>

Inspiration

We wanted to make creating interactive 3D content as simple as using the Logitech devices creators already love, because we believe the next generation of content—after YouTube and short-form—is fully interactive.

What it does

LogiCreate lets creators control, build, and interact with 3D scenes directly through customized Logitech device actions.

How we built it

We developed a Logitech plugin that maps device inputs to real-time 3D engine controls for importing, positioning, and interacting with assets.

Challenges we ran into

Our biggest challenge was synchronizing device events with smooth, low-latency actions inside the 3D environment.

Accomplishments that we're proud of

We’re proud that creators can now prototype interactive 3D content with physical controls instead of complex software menus.

What we learned

We learned how powerful tactile input can be in simplifying 3D creation workflows and making them more accessible.

What's next for LogiCreate

Next, we plan to add AI-assisted 3D generation and expand compatibility with more engines and publishing platforms.


# obj-rain

**obj-rain** is a small Vite + React prototype that includes an interactive canvas component (`SceneCanvas.jsx`) and a lightweight debugging hook (`useMxConsole.js`). It's set up with Tailwind CSS and ESLint and is intended as a starting point for experiments with realtime or WebGL-based scenes.

**Quick Start**

- **Prerequisites**: Node.js (16+ recommended) and `npm` or `pnpm`.
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

**What you'll find**

- **Tech stack**: Vite, React (JSX), Tailwind CSS, ESLint
- **Entry point**: `src/main.jsx`
- **App root**: `src/App.jsx`
- **Interactive canvas**: `src/SceneCanvas.jsx` (main scene component)
- **Custom hooks**: `src/hooks/useMxConsole.js` (developer console / debug helper)
- **Assets**: `src/assets/` (models, textures, images)

**Repository Layout**

- `index.html`: App HTML shell
- `package.json`: Scripts and dependencies
- `vite.config.js`: Vite configuration
- `tailwind.config.cjs`: Tailwind configuration
- `eslint.config.js`: ESLint configuration
- `src/`: Source files
	- `main.jsx`: App bootstrap
	- `App.jsx`: Top-level React component
	- `SceneCanvas.jsx`: Canvas / scene component
	- `assets/`: Static assets used by the scene
	- `hooks/useMxConsole.js`: Small debugging hook

**Development Notes**

- Editing `src/SceneCanvas.jsx` should hot-reload the scene in development.
- Place static models or textures in `src/assets/` and import them into `SceneCanvas.jsx` or other components.
- Tailwind is configured — update `tailwind.config.cjs` to change theme, safelist, or plugins.

**Scripts** (typical; verify in `package.json`)

- `npm run dev`: Starts Vite dev server with HMR.
- `npm run build`: Produces a production build in `dist/`.
- `npm run preview`: Serves the production build locally for testing.

**Troubleshooting**

- If the dev server port is in use, set a different port: `npm run dev -- --port 5174`.
- If assets fail to load, confirm their paths under `src/assets/` and any loaders used in the scene component.

**Contributing**

- Open a branch for features or fixes and submit a pull request.
- Keep changes focused and document notable additions in this `README.md` or via PR description.

**License & Contact**

- Add a `LICENSE` file to declare the project's license. If this is a hackathon prototype, consider `MIT` for simplicity.
- For questions, contact the repo owner or open an issue in the repository.

---

If you'd like, I can also:

- Add a small usage example in `src/SceneCanvas.jsx` README section.
- Create a `CONTRIBUTING.md` with PR guidelines.
- Run the dev server here and confirm HMR works.
