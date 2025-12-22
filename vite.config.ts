import { basename, dirname, resolve } from "node:path";
import { glob } from "glob";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		target: "es2022",
		outDir: resolve(process.cwd(), "dist"),
		rollupOptions: {
			input: (await glob("public/**/index.html")).reduce(
				(put: Record<string, string>, path: string) => {
					put[basename(dirname(path))] = path;
					return put;
				},
				{}
			)
		},
		sourcemap: true
	},
	publicDir: resolve(process.cwd(), "static"),
	root: resolve(process.cwd(), "public"),
	appType: "mpa",
	plugins: []
});
