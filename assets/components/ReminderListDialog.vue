<template>
    <Dialog
        title="Roles"
        v-on="bubbleEvents(emit)"
    >
        <div class="role-list">
            <button
                v-for="reminder in reminders"
                type="button"
                class="no-button"
                @click="() => emit('reminder-click', reminder.id)"
            >
                <ReminderToken :reminder="reminder" />
            </button>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import type {
    IRole,
    IRoleReminder,
} from "../scripts/types/data";
import useRoleStore from "../scripts/store/role";
import { computed } from "vue";
import ReminderToken from "./ReminderToken.vue";
import {
    type IDialogEvents,
    Dialog,
    bubbleEvents,
} from "./ui/dialog";

const emit = defineEmits<IDialogEvents & {
    (e: "reminder-click", id: IRoleReminder["id"]): void,
}>();

const store = useRoleStore();
// NOTE: This doesn't include the universal reminders but it should.
const reminders = computed(() => store
    .script
    .filter((role) => !store.getIsMeta(role))
    .reduce((reminders, role) => {

        const theRole = role as IRole;

        if (theRole.reminders) {
            reminders.push(...theRole.reminders);
        }

        return reminders;

    }, [] as IRoleReminder[]));
</script>
