<template>
    <BaseModal ref="modal" title="Select Role">
        <GridLayout min-width="6ch">
            <button
                v-for="role in rolesStore.scriptRoles"
                :key="role.id"
                class="no-button"
                @click="() => emit('role-click', role.id)"
            >
                <RoleToken :role="role" />
            </button>
        </GridLayout>
    </BaseModal>
</template>

<script setup lang="ts">
import type { IRole } from "~/types/data";
import { useTemplateRef } from "vue";
import BaseModal from "~/components/base/BaseModal.vue";
import RoleToken from "./RoleToken.vue";
import GridLayout from "~/components/layouts/GridLayout.vue";
import useRolesStore from "~/stores/roles";

const emit = defineEmits<{
    (e: "role-click", roleId: IRole["id"]): void,
}>();
const rolesStore = useRolesStore();
const modal = useTemplateRef("modal");

defineExpose({
    show() {
        return modal.value?.show();
    },
    hide() {
        return modal.value?.hide();
    },
})
</script>
