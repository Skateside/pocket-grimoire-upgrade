<template>

    <div
        class="role-token"
        :class="props.class"
        :data-top="top"
        :data-first="firstNight"
        :data-other="otherNight"
        :data-setup="setup"
    >
        <span class="role-token__image" :class="`role-token__image--${role.team ?? ''}`">
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

<script lang="ts" setup>
import type { IRole, IRoleAlignment } from "../scripts/types/data";
import type { RequireOnly } from "../scripts/types/lib";
import { type HTMLAttributes, computed } from "vue";
import useRoleStore from "../scripts/store/role";

const props = defineProps<{
    role?: IRole,
    alignment?: IRoleAlignment,
    class?: HTMLAttributes
}>();
const store = useRoleStore();
const role = computed<RequireOnly<IRole, 'name' | 'image'>>(() => {

    const role: RequireOnly<IRole, 'name' | 'image'> = {
        name: 'norole', // TODO: i18n
        image: '/icons/norole.svg',
    };

    if (!role) {
        return role;
    }

    if (role.id === "_meta") {

        role.name = "rolemeta"; // TODO: i18n
        role.image = '/icons/metarole.svg';

        return role;

    }

    return Object.assign(role, props.role || {});

});
const image = computed(() => store.getImage(role.value as IRole, props.alignment));
const top = computed(() => {
    if (!role.value?.reminders) {
        return;
    }
    return Math.min(role.value.reminders.length, 6);
});
const firstNight = computed(() => {
    // TODO: get the position of the role within the IN PLAY roles rather than
    // the global position. 
    // store.getNightOrder(role.id, "first");
    if ((role.value?.firstNight ?? 0) === 0) {
        return;
    }
    return role.value.firstNight;
});
const otherNight = computed(() => {
    // TODO: get the position of the role within the IN PLAY roles rather than
    // the global position. 
    // store.getNightOrder(role.id, "other");
    if ((role.value?.otherNight ?? 0) === 0) {
        return;
    }
    return role.value.otherNight;
});
const setup = computed(() => Boolean(role.value?.setup));
</script>
