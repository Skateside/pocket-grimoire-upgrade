import { createApp } from "vue"
import { createPinia } from "pinia"
import { router } from "./router";
// import Storage from "./classes/Storage";
import GameWrapper from "./views/main/GameWrapper.vue";

const game = createApp(GameWrapper);
// game.provide("storage", new Storage("pg"));
game.use(createPinia());
game.use(router);
game.mount("#game");
