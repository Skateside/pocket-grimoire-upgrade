<template>
    <DialogUI
        title="Roles"
        v-on="bubbleEvents(emit)"
    >
        <GridLayout gap="var(--sizing-sm)" max-width="10ch">
            <button
                v-for="role in roles"
                type="button"
                class="no-button"
                @click="() => emit('role-click', role.id)"
            >
                <RoleToken :role="role" />
            </button>
        </GridLayout>
    </DialogUI>
</template>

<script setup lang="ts">
import type { IRole } from "../scripts/types/data";
import { computed } from "vue";
import useRoleStore from "../scripts/store/role";
import {
    type IDialogUIEvents,
    DialogUI,
    bubbleEvents,
} from "./ui/dialog";
import GridLayout from "./layouts/GridLayout.vue";
import RoleToken from "./RoleToken.vue";

const emit = defineEmits<IDialogUIEvents & {
    (e: "role-click", id: IRole["id"]): void,
}>();

const store = useRoleStore();
const roles = computed(() => {
    return store.script.filter((role) => {
        return !store.getIsMeta(role) && !store.getIsSpecial(role);
    }) as IRole[];
});
</script>
