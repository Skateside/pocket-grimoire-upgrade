import { createApp } from "vue"
import { createPinia } from "pinia"
import Storage from "./scripts/classes/Storage";
import Game from "./components/Game.vue"

const game = createApp(Game);
game.provide("storage", new Storage("pg"));
game.use(createPinia());
game.mount("#game");
