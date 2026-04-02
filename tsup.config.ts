import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: {
			index: "src/index.ts",
		},
		format: ["esm", "cjs"],
		dts: true,
		outDir: "dist",
		clean: true,
		splitting: true,
		sourcemap: true,
		target: "node18",
	},
]);
