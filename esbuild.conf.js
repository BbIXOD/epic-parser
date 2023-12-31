import { nodeExternalsPlugin } from "esbuild-node-externals";
import { build } from "esbuild";

try {

  build({
    entryPoint: "src/app.ts",
    bundle: true,
    minify: true,
    platform: "node",
    sourcemap: true,
    tsconfig: "tsconfig.json",
    plugins: [nodeExternalsPlugin()],
    outdir: "dist",
  })
}
catch (err) {
  console.log(err)
  process.exit(1)
}