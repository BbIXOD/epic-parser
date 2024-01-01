import { nodeExternalsPlugin } from "esbuild-node-externals";
import { build } from "esbuild";

try {

  build({
    entryPoints: ["src/app.ts"],
    bundle: true,
    //minify: true,
    platform: "node",
    target: "es2022",
    format: "esm",
    tsconfig: "tsconfig.json",
    plugins: [nodeExternalsPlugin()],
    outfile: "app.js",
  })
}
catch (err) {
  console.log(err)
  process.exit(1)
}