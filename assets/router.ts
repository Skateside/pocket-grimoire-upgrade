import {
    type RouteRecordRaw,
    createWebHistory,
    createRouter,
} from "vue-router";
import PocketGrimoire from "./components/PocketGrimoire.vue";
import KitchenSink from "./components/KitchenSink.vue";

const routes: RouteRecordRaw[] = [
    { path: "/", name: "Pocket Grimoire", component: PocketGrimoire },
    { path: "/kitchensink", name: "Kitchen Sink", component: KitchenSink },
];

export const router = createRouter({
    routes,
    history: createWebHistory(),
});
