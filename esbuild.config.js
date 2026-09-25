import build from "./config/esbuild.defaults.js"

// You can customize this as you wish, perhaps to add new esbuild plugins.
//
// You can also support custom base_path deployments via changing `publicPath`.
//
// ```
// const esbuildOptions = {
//   publicPath: "/my_subfolder/_bridgetown/static",
//   ...
// }
// ```

/**
 * @typedef { import("esbuild").BuildOptions } BuildOptions
 * @type {BuildOptions}
 */
const esbuildOptions = {
  entryPoints: [
    "frontend/javascript/index.js",
    "frontend/javascript/alphatab.js",
  ],
  plugins: [
    // add new plugins here...
  ],
}

build(esbuildOptions)
