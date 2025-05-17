// import { type Plugin, defineConfig } from "vite";
import { defineConfig } from "vite";
import symfonyPlugin from "vite-plugin-symfony";
import vue from "@vitejs/plugin-vue"
import localeDataPlugin from "./tools/locale-data-plugin";
import { readdirSync } from "fs";
import { resolve } from "path";

const getGeneratedInputs = () => {
    const compiledPath = resolve("./assets/data/compiled");
    try {
        return readdirSync(compiledPath)
            .filter((file) => file.endsWith(".js"))
            .reduce((inputs, fileName) => {
                const locale = fileName.replace(/\.js$/, "");
                inputs[`data/${locale}`] = resolve(compiledPath, fileName);
                return inputs;
            }, {} as Record<string, string>);
    } catch (_ignore) {
        console.warn("Warning: compiled files not found yet.");
        return {};
    }
};

export default defineConfig({
    plugins: [
        localeDataPlugin(),
        vue(),
        symfonyPlugin(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: "./assets/main.ts",
                ...getGeneratedInputs(),
            },
        }
    },
});
