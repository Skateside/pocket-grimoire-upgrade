import { createApp } from "vue"
import { createPinia } from "pinia"
import { router } from "./router";
import Storage from "./scripts/classes/Storage";
// import PocketGrimoire from "./components/PocketGrimoire.vue"
import MainPage from "./components/MainPage.vue";

// const game = createApp(PocketGrimoire);
const game = createApp(MainPage);
game.provide("storage", new Storage("pg"));
game.use(createPinia());
game.use(router);
game.mount("#game");
