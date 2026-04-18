<template>
    <BaseModal ref="modal" title="Select Your Character" :cover="true">
        <GridLayout>
            <div v-for="(role, index) in props.roles" :key="role.id">
                <button
                    type="button"
                    @click="() => emit('role-click', role.id)"
                >
                    {{ index + 1 }}
                </button>
            </div>
        </GridLayout>
    </BaseModal>
</template>

<script setup lang="ts">
import type { IRole } from "~/types/data";
import { useTemplateRef } from "vue";
import BaseModal from "~/components/base/BaseModal.vue";
import GridLayout from "~/components/layouts/GridLayout.vue";

const props = defineProps<{
    roles: IRole[],
}>();
const emit = defineEmits<{
    (e: "role-click", roleId: IRole["id"]): void,
}>();

const modal = useTemplateRef("modal");

defineExpose({
    show() {
        modal.value?.show();
    },
    hide() {
        modal.value?.hide();
    },
});
</script>
