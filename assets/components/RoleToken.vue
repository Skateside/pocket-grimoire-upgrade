<template>

    <span
        role="img"
        :aria-label="role.name"
        class="role-token"
        :class="{
            'is-orphan': props.orphan,
        }"
    >
        <span class="role-token__leaves">
            <span v-if="top > 0" class="role-token__reminders">
                <span
                    v-for="index in top"
                    class="role-token__leaf role-token__leaf--reminder"
                    :class="`role-token__leaf--reminder-${index}`"
                ></span>
            </span>
            <span v-if="first" class="role-token__leaf role-token__leaf--first"></span>
            <span v-if="other" class="role-token__leaf role-token__leaf--other"></span>
            <span v-if="setup" class="role-token__leaf role-token__leaf--setup"></span>
        </span>
        <span class="role-token__image" :class="`role-token__image--${role.team ?? ''}`">
            <img :src="image" alt="" class="role-token__icon" width="150" height="150" loading="lazy">
        </span>
        <svg viewBox="0 0 150 150" class="role-token__text">
            <path d="M 13 75 C 13 160, 138 160, 138 75" id="curve" fill="transparent"></path>
            <text width="150" x="66.6%" text-anchor="middle" class="role-token__name">
                <textPath xlink:href="#curve" style="fill: currentColor;">{{ role.name }}</textPath>
            </text>
        </svg>
    </span>

</template>

<script lang="ts" setup>
import { type IRole, ERoleAlignment } from "../scripts/types/data";
import { computed } from "vue";
import useRoleStore from "../scripts/store/role";

const props = defineProps<{
    role?: IRole | IRole["id"] | null,
    alignment?: ERoleAlignment,
    orphan?: boolean,
}>();
const store = useRoleStore();
const role = computed(() => store.interpretRole(props.role));
const image = computed(() => store.getImage(role.value, props.alignment));
const top = computed(() => {
    if (!role.value?.reminders) {
        return 0;
    }
    return Math.min(role.value.reminders.length, 6);
});
const first = computed(() => (role.value?.firstNight ?? 0) > 0);
const other = computed(() => (role.value?.otherNight ?? 0) > 0);
const setup = computed(() => Boolean(role.value?.setup));
</script>
