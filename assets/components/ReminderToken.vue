<template>

    <template v-if="!role || !reminder">
        <p><strong>Warning:</strong> Either no role or no reminder at index {{ props.index }}.</p>
    </template>
    <template v-else>
        
        <span class="reminder-token">
            <span class="reminder-token__image" :class="`reminder-token__image--${role.team}`">
                <img :src="image" alt="" class="reminder-token__icon" width="150" height="150" loading="lazy">
            </span>
            <svg viewBox="0 0 150 150" class="reminder-token__text">
                <path d="M 13 75 C 13 -10, 138 -10, 138 75" id="curve-top" fill="transparent"></path>
                <text width="150" x="66.6%" text-anchor="middle" class="reminder-token__name" dominant-baseline="hanging">
                    <textPath xlink:href="#curve-top" style="fill: currentColor;">{{ store.getIsUniversal(props.id) ? "" : role.name }}</textPath>
                </text>
            </svg>
            <svg viewBox="0 0 150 150" class="reminder-token__text">
                <path d="M 13 75 C 13 160, 138 160, 138 75" id="curve-base" fill="transparent"></path>
                <text width="150" x="66.6%" text-anchor="middle" class="reminder-token__name">
                    <textPath xlink:href="#curve-base" style="fill: currentColor;">{{ reminder }}</textPath>
                </text>
            </svg>
        </span>

    </template>

</template>

<script setup lang="ts">
import type { IRole } from "../scripts/types/data";
import { computed } from "vue";
import useRoleStore from "../scripts/store/role";

const props = defineProps<{
    id: IRole["id"],
    index: number,
    alignment?: 0 | 1 | 2,
    isGlobal?: boolean,
}>();

const store = useRoleStore();
const role = computed(() => store.getById(props.id));
const image = computed(() => {

    // The special "Universal Info" role handles images in a unique way:
    // - The 1st image is a transparent gif and should be used in all situations
    //   except the next 2:
    // - The 2nd image is a generic good image to be used for global reminder 1.
    // - The 3rd image is a generic evil image to be used for global reminder 2.
    if (store.getIsUniversal(props.id) && props.isGlobal) {

        const images = role.value!.image as string[];

        if (props.index < 2) {
            return images[props.index + 1];
        }

        return images[0];

    }

    return store.getImage(props.id, props.alignment);

});
const reminder = computed(() => {
    return store.getReminders(props.id)[
        props.isGlobal
        ? "global"
        : "local"    
    ][props.index];
});
</script>

<style lang="scss" scoped>
.reminder-token {
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
        // width: clamp(70px, 100vw / 6, 150px);
        // transform: scale(var(--token-size, 1));
    // }

    // &[data-token="reminder"] {
        width: clamp(55px, 100vw / 9, 125px);
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

.reminder-token {
    // border-radius: 50%;
    display: grid;
    // width: 100%;
    // aspect-ratio: 1 / 1;
}

.reminder-token {
    background-color: #7e84ff;
    background-image: url("/assets/token/reminder-background.svg");
    background-size: 100%;
    box-shadow:
        inset 0.1em 0.1em 0.2em rgb(255 255 255 / 0.1),
        inset 0 0 1em #454a99,
        inset 0 0 0.5em #454a99;
}

.reminder-token__image,
.reminder-token__text {
    grid-area: 1 / -1;
    z-index: 1;
}

// .reminder-token__text {
//     color: #fff;
// }

.reminder-token__image {
    display: flex;
    align-items: center;
    justify-content: center;
    transform:
        scale(0.7)
        translateY(-5%);
    // filter: drop-shadow(0 0 0.05em #fff);
}

// .reminder-token__image--fabled {
//     filter: drop-shadow(0 0 0.5em #8a4d0f);
// }

.reminder-token__icon {
    width: 100%;
    height: 100%;
}
</style>
