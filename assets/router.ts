import {
    type RouteRecordRaw,
    createWebHistory,
    createRouter,
} from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "main",
        component: () => import("./components/views/main/MainPage.vue"),
        redirect: { name: "setup" },
        children: [
            {
                path: "setup",
                name: "setup",
                component: () => import("./components/views/setup/PageWrapper.vue"),
                redirect: { name: "select-edition" },
                children: [
                    /*
                    {
                        path: "select-edition",
                        name: "select-edition",
                        component: () => import("./components/views/setup/SelectEdition.vue"),
                    },
                    */
                    {
                        path: "select-edition",
                        name: "select-edition",
                        component: () => import("./components/views/setup/select-edition/SelectEdition.vue"),
                        redirect: { name: "select-edition-official" },
                        children: [
                            {
                                path: "official",
                                name: "select-edition-official",
                                component: () => import("./components/views/setup/select-edition/OfficialScripts.vue"),
                            },
                            {
                                path: "upload",
                                name: "select-edition-upload",
                                component: () => import("./components/views/setup/select-edition/UploadScript.vue"),
                            },
                            {
                                path: "url",
                                name: "select-edition-url",
                                component: () => import("./components/views/setup/select-edition/URLLookup.vue"),
                            },
                            {
                                path: "clipboard",
                                name: "select-edition-clipboard",
                                component: () => import("./components/views/setup/select-edition/ClipboardPaste.vue"),
                            },
                            {
                                path: "botc-scripts",
                                name: "select-edition-botc-scripts",
                                component: () => import("./components/views/setup/select-edition/BotcLookup.vue"),
                            },

                        ],
                    },
                    {
                        path: "set-players",
                        name: "set-players",
                        component: () => import("./components/views/setup/SetPlayers.vue"),
                    },
                    {
                        path: "assign-roles",
                        name: "assign-roles",
                        component: () => import("./components/views/setup/AssignRoles.vue"),
                    },
                    {
                        path: "cache",
                        name: "cache",
                        component: () => import("./components/views/setup/ClearCache.vue"),
                    },
                ],
            },
        ],
    },
    {
        path: "/original",
        name: "original",
        component: () => import("./components/PocketGrimoire.vue"),
    },
    {
        path: "/kitchensink",
        name: "kitchen-sink",
        component: () => import("./components/KitchenSink.vue"),
    },
];

export const router = createRouter({
    routes,
    history: createWebHistory(),
});
