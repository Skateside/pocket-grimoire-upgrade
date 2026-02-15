import {
    type RouteRecordRaw,
    createWebHistory,
    createRouter,
} from "vue-router";
import PocketGrimoire from "./components/PocketGrimoire.vue";
// import MainPage from "./components/pages/main/MainPage.vue";
import SetupWrapper from "./components/pages/main/setup/Wrapper.vue";
import SelectEdition from "./components/pages/main/setup/SelectEdition.vue";
import KitchenSink from "./components/KitchenSink.vue";

const routes: RouteRecordRaw[] = [
    { path: "/", name: "setup", component: SetupWrapper, redirect: { name: "select-edition" }, children: [
        { path: "", name: "select-edition", component: SelectEdition },
    ] },
    { path: "/original", name: "original", component: PocketGrimoire },
    { path: "/kitchensink", name: "kitchen-sink", component: KitchenSink },
];

export const router = createRouter({
    routes,
    history: createWebHistory(),
});
