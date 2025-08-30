<template>
    <Dialog
        title="Roles"
        v-on="bubbleEvents(emit)"
    >
        <div class="role-list">
            <button
                v-for="role in roles"
                type="button"
                class="no-button"
                @click="() => emit('role-click', role.id)"
            >
                <RoleToken :role="role" />
            </button>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import type { IRole } from "../scripts/types/data";
import useRoleStore from "../scripts/store/role";
import { computed } from "vue";
import RoleToken from "./RoleToken.vue";
import {
    type IDialogEvents,
    Dialog,
    bubbleEvents,
} from "./ui/dialog";

const emit = defineEmits<IDialogEvents & {
    (e: "role-click", id: IRole["id"]): void,
}>();

const store = useRoleStore();
const roles = computed(() => {
    return store.script.filter((role) => !store.getIsMeta(role)) as IRole[];
});
</script>
