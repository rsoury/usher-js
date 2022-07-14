/* eslint-disable no-console */

import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import filesize from "rollup-plugin-filesize";
import visualizer from "rollup-plugin-visualizer";
import injectProcessEnv from "rollup-plugin-inject-process-env";
import alias from "@rollup/plugin-alias";
import dotenv from "@gedhean/rollup-plugin-dotenv";
import json from "@rollup/plugin-json";
import nodePolyfills from "rollup-plugin-polyfill-node";
import ts from "rollup-plugin-ts";

import pkg from "./package.json";

const isProd = process.env.NODE_ENV === "production";

console.log(`Running in ${isProd ? "Production" : "Development"}`);

const input = "src/index.ts";
const extensions = [".ts", ".js", ".json"];
const codes = [
	"THIS_IS_UNDEFINED",
	"MISSING_GLOBAL_NAME",
	"CIRCULAR_DEPENDENCY"
];
// const minifyExtension = (pathToFile) => pathToFile.replace(/\.js$/, ".min.js");
const discardWarning = (warning) => {
	if (codes.includes(warning.code)) {
		return;
	}

	console.error(warning);
};

const plugins = (format = "cjs") => {
	const p = [
		ts({
			browserslist: ["> 0%"],
			tsconfig: "tsconfig.json",
			transpiler: "swc",
			swcConfig: {
				minify: isProd,
				sourceMaps: !isProd,
				module: {
					type: format
				}
			}
		}),
		commonjs(),
		json(),
		nodePolyfills({ include: ["crypto"] }),
		alias({
			entries: [{ find: "@", replacement: path.resolve(__dirname, "./src") }]
		}),
		external(),
		resolve({
			browser: true,
			extensions,
			preferBuiltins: false
		}),
		dotenv(),
		injectProcessEnv({
			NODE_ENV: process.env.NODE_ENV || "development"
		}),
		filesize(),
		visualizer()
	];

	return p;
};

export default [
	// CommonJS
	{
		output: {
			file: pkg.main,
			format: "cjs",
			exports: "named",
			sourcemap: !isProd
		},
		plugins: plugins("cjs")
	},

	// UMD
	{
		output: {
			file: pkg.browser,
			format: "umd",
			name: "usher",
			esModule: false,
			exports: "named",
			sourcemap: !isProd
		},
		plugins: plugins("umd")
	},

	// ES
	{
		output: {
			file: pkg.module,
			format: "es",
			exports: "named",
			sourcemap: !isProd
		},
		plugins: plugins("es6")
	}
].map((conf) => ({
	input,
	onwarn: discardWarning,
	treeshake: true,
	...conf
}));
