<template>

    <!-- NOTE: This file is just temporary to test the role tokens. -->

    <div v-for="(roles, group) in roleGroups">
        <p>{{ group }}</p>
        <div class="list">
            <button
                v-for="role in roles"
                :key="role.id"
                type="button"
                @click="() => chosenRole = role"
            >{{ role.name }}</button>
        </div>
    </div>
    <p><button type="button" @click="() => chosenRole = null"><em>- clear -</em></button></p>

    <div v-if="chosenRole" class="list">
        <div>
            <RoleToken :role="chosenRole" />
        </div>
        <div
            v-for="(reminder, index) in (chosenRole.reminders || [])"
            :key="`reminder-${chosenRole.id}-${index}`"
        >
            <ReminderToken :role="chosenRole" :reminder="reminder" />
        </div>
    </div>

</template>

<script lang="ts" setup>
import type { IRole } from "../scripts/types/data";
import { computed, ref } from "vue";
import RoleToken from "./RoleToken.vue";
import ReminderToken from "./ReminderToken.vue";
import useRoleStore from "../scripts/store/role";

const roleStore = useRoleStore();
const roleGroups = computed(() => {

    const groups: Record<string, IRole[]> = {
        townsfolk: [],
        outsider: [],
        minion: [],
        demon: [],
        traveller: [],
        fabled: [],
        special: [],
    };

    roleStore.roles.forEach((role) => {

        if (role.edition === "special") {
            groups.special.push(role);
        } else {
            groups[role.team].push(role);
        }

    });

    return groups;

});
const chosenRole = ref<IRole | null>(null);
// const reminders = computed(() => roleStore.getReminders(roleId.value));
</script>

<style lang="scss" scoped>
.list {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25em;
}
</style>
