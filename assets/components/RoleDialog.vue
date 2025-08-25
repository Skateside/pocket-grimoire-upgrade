<template>
    <Dialog
        :title="props.role.name"
        :manual="true"
        :hide="true"
        @hide="() => emit('hide')"
    >
        <RoleToken :role="props.role" :alignment="props.alignment" />
        <p>{{ props.role.ability }}</p>
    </Dialog>
</template>

<script setup lang="ts">
import type {
    IRole,
    IRoleAlignment,
} from "../scripts/types/data";
import Dialog from "./Dialog.vue";
import RoleToken from "./RoleToken.vue";

const props = defineProps<{
    role: IRole,
    alignment?: IRoleAlignment,
}>();
const emit = defineEmits<{
    (e: "hide"): void,
}>();
</script>
