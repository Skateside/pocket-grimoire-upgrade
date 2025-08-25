<template>
    <Dialog
        title="Roles"
        v-on="bubbleEvents(emit)"
    >
        <div class="o-grid">
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

<style lang="scss" scoped>
%no-button,
.no-button {
    border: none;
    padding: 0;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    font-weight: inherit;
    color: inherit;
    background-color: transparent;
}

%o-grid,
.o-grid {
	--o-grid-gap: 1em;
	--o-grid-max-width: 10ch;

	display: grid;
	grid-gap: var(--o-grid-gap);
	grid-template-columns: repeat(auto-fit, minmax(min(var(--o-grid-max-width), 100%), 1fr));
}
</style>
