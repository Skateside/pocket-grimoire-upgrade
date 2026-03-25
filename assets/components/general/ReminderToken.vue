<template>

    <span
        role="img"
        :aria-label="[roleName, reminder.name].filter(Boolean).join(': ')"
        class="role-token role-token--reminder"
        :class="{ 'is-orphan': props.orphan }"
    >
        <span class="role-token__image" :class="`role-token__image--${role?.team || 'unknown'}`">
            <img :src="image" alt="" class="role-token__icon" width="150" height="150" loading="lazy">
        </span>
        <svg viewBox="0 0 150 150" class="role-token__text">
            <path d="M 13 75 C 13 -10, 138 -10, 138 75" id="curve-top" fill="transparent"></path>
            <text width="150" x="66.6%" text-anchor="middle" class="role-token__name" dominant-baseline="hanging">
                <textPath xlink:href="#curve-top" style="fill: currentColor;">{{ roleName }}</textPath>
            </text>
        </svg>
        <svg viewBox="0 0 150 150" class="role-token__text">
            <path d="M 13 75 C 13 160, 138 160, 138 75" id="curve-base" fill="transparent"></path>
            <text width="150" x="66.6%" text-anchor="middle" class="role-token__name">
                <textPath xlink:href="#curve-base" style="fill: currentColor;">{{ reminder.name }}</textPath>
            </text>
        </svg>
    </span>

</template>

<script setup lang="ts">
import type { IReminder } from "~/scripts/types/data";
import { computed } from "vue";
import { ETokenAlignment } from "~/scripts/enums/data";
import useRolesStore from "~/scripts/stores/roles";

const props = defineProps<{
    reminder: IReminder | IReminder["id"] | null,
    alignment?: ETokenAlignment,
    orphan?: boolean,
}>();

const rolesStore = useRolesStore();
const reminder = computed(() => rolesStore.interpretReminder(props.reminder));
const image = computed(() => {
    return rolesStore.getReminderImage(reminder.value, props.alignment);
});
const role = computed(() => rolesStore.getRoleById(reminder.value.roleId));
const roleName = computed(() => (
    (!role.value || rolesStore.getIsUniversal(role.value))
    ? ""
    : role.value.name
));
</script>
