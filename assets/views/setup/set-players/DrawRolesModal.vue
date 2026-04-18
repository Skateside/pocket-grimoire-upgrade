<template>
    <BaseModal ref="modal" title="Select Your Character" :cover="true">
        <GridLayout>
            <div v-for="(role, index) in props.roles" :key="index">
                <button
                    type="button"
                    @click="() => handleChoice(role, index)"
                    :disabled="chosen[index]"
                >
                    {{ index + 1 }}
                </button>
            </div>
        </GridLayout>
    </BaseModal>
</template>

<script setup lang="ts">
import type { IRole } from "~/types/data";
import { ref, useTemplateRef } from "vue";
import BaseModal from "~/components/modal/BaseModal.vue";
import GridLayout from "~/components/layouts/GridLayout.vue";

const props = defineProps<{
    roles: IRole[],
}>();
const emit = defineEmits<{
    (e: "role-click", role: IRole): void,
}>();
const modal = useTemplateRef("modal");
const chosen = ref<boolean[]>((new Array(props.roles.length)).fill(false));

const handleChoice = (role: IRole, index: number) => {
    chosen.value[index] = true;
    emit("role-click", role);
};

defineExpose({
    show() {
        modal.value?.show();
    },
    hide() {
        modal.value?.hide();
    },
});
</script>
