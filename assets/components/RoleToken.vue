<template>

    <template v-if="!role || role.id === '_meta'">
        <p><strong>Warning:</strong> Either no role or the meta role given.</p>
    </template>
    <template v-else>

        <div
            class="role-token"
            :data-top="Math.min((role.reminders?.length ?? 0) + (role.remindersGlobal?.length ?? 0), 6)"
            :data-first="(role.firstNight ?? 0) > 0"
            :data-other="(role.otherNight ?? 0) > 0"
            :data-setup="role.setup ?? false"
        >
            <span class="role-token__image" :class="`role-token__image--${role.team}`">
                <img :src="image" alt="" class="role-token__icon" width="150" height="150" loading="lazy">
            </span>
            <svg viewBox="0 0 150 150" class="role-token__text">
                <path d="M 13 75 C 13 160, 138 160, 138 75" id="curve" fill="transparent"></path>
                <text width="150" x="66.6%" text-anchor="middle" class="role-token__name">
                    <textPath xlink:href="#curve" style="fill: currentColor;">{{ role.name }}</textPath>
                </text>
            </svg>
        </div>

    </template>

</template>

<script lang="ts" setup>
import type { IRole } from "../scripts/types/data";
import { computed } from "vue";
import useRoleStore from "../scripts/store/role";

const props = defineProps<{
    id: IRole["id"],
    alignment?: 0 | 1 | 2,
}>();
const store = useRoleStore();
const role = computed(() => store.getById(props.id));
const image = computed(() => store.getImage(props.id, props.alignment));
</script>

<style lang="scss" scoped>
.role-token {
    // width: 60px;
    aspect-ratio: 1 / 1;
    border: none;
    // padding: 0;
    border-radius: 50%;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    // font-family: inherit;
    // font-size: inherit;
    // line-height: inherit;
    // transform-origin: 0 0;

    // &[data-token="character"] {
        width: clamp(70px, 100vw / 6, 150px);
        // transform: scale(var(--token-size, 1));
    // }

    // &[data-token="reminder"] {
    //     width: clamp(55px, 100vw / 9, 125px);
    //     transform: scale(var(--reminder-size, 1));
    // }

    // &[aria-disabled="true"],
    // &[disabled] {
    //     opacity: 0.7;

    //     > .character {
    //         --shadow-amount: 0;
    //     }
    // }

    // &.is-orphan {
    //     box-shadow: 0 0 15px red;

    //     @media (prefers-reduced-motion: no-preference) {
    //         animation: orphan 1s infinite alternate;
    //     }

    // }
}

.role-token {
    // border-radius: 50%;
    display: grid;
    // width: 100%;
    // aspect-ratio: 1 / 1;
}

.role-token {
    --no-leaf: url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    --top-leaf: var(--no-leaf);
    --left-leaf: var(--no-leaf);
    --right-leaf: var(--no-leaf);
    --setup-leaf: var(--no-leaf);
    // --reminder-offset: 2.5%;
    // --shadow-offset: 0.1em;
    // --shadow-rotation: 1;
    // --shadow-amount: calc(var(--shadow-offset) * var(--shadow-rotation));

    background-color: #fffef0;
    background-image:
        var(--left-leaf),
        var(--top-leaf),
        var(--right-leaf),
        var(--setup-leaf),
        url("/assets/token/role-background.svg"),
        url("/assets/token/role-noise.webp");
    background-position: 50% 50%;
    background-repeat:
        no-repeat, 
        no-repeat,
        no-repeat,
        no-repeat,
        no-repeat,
        repeat;
    background-size:
        contain,
        contain,
        contain,
        contain,
        100%,
        auto;
    // box-shadow:
    //     inset 0.1em 0.1em 0.2em rgb(255 255 255 / 0.2),
    //     inset 0 0 0.7em #8a4d0f,
    //     var(--shadow-amount) var(--shadow-amount) 0.2em rgb(0 0 0 / 0.8);
    box-shadow:
        inset 0.2em 0.2em 0.4em rgb(255 255 255 / 0.2),
        inset 0 0 1.5em #8a4d0f;

    // &.is-upside-down {
    //     --shadow-rotation: -1;
    //     transform: rotate(180deg);
    // }

    // &.is-dead {
    //     filter: grayscale(1) brightness(0.8);
    // }

    &[data-top="1"]      { --top-leaf: url("/assets/token/top-1.webp"); }
    &[data-top="2"]      { --top-leaf: url("/assets/token/top-2.webp"); }
    &[data-top="3"]      { --top-leaf: url("/assets/token/top-3.webp"); }
    &[data-top="4"]      { --top-leaf: url("/assets/token/top-4.webp"); }
    &[data-top="5"]      { --top-leaf: url("/assets/token/top-5.webp"); }
    &[data-top="6"]      { --top-leaf: url("/assets/token/top-6.webp"); }
    &[data-first="true"] { --left-leaf: url("/assets/token/left-1.webp"); }
    &[data-other="true"] { --right-leaf: url("/assets/token/right-1.webp"); }
    &[data-setup="true"] { --setup-leaf: url("/assets/token/setup.webp"); }

}

.role-token__image,
.role-token__text {
    grid-area: 1 / -1;
    z-index: 1;
}

.role-token__image {
    display: flex;
    align-items: center;
    justify-content: center;
    transform:
        scale(0.8)
        translateY(-5%);
}

.role-token__image--fabled {
    filter: drop-shadow(0 0 0.5em #8a4d0f);
}

.role-token__icon {
    width: 100%;
    height: 100%;
}
</style>
