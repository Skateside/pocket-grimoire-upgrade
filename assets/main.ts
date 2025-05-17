import { createApp } from "vue"
import { createPinia } from "pinia"
import Storage from "./scripts/classes/Storage";
import Game from "./Game.vue"

const pinia = createPinia();

const game = createApp(Game);
game.provide("storage", new Storage("pg"));
game.use(pinia);
game.mount("#game");
