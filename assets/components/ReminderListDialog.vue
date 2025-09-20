<template>
    <Dialog
        title="Reminders"
        v-on="bubbleEvents(emit)"
    >
        <div class="role-list">
            <button
                v-for="reminder in store.getReminders()"
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
import type { IRoleReminder } from "../scripts/types/data";
import useRoleStore from "../scripts/store/role";
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
</script>
