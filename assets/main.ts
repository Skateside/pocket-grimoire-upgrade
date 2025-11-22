import { createApp } from "vue"
import { createPinia } from "pinia"
import Storage from "./scripts/classes/Storage";
import PocketGrimoire from "./components/PocketGrimoire.vue"

const game = createApp(PocketGrimoire);
game.provide("storage", new Storage("pg"));
game.use(createPinia());
game.mount("#game");
