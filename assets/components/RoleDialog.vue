<template>
    <Dialog
        :title="props.role.name"
        :manual="true"
        :hide="true"
        v-on="bubbleEvents(emit)"
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
import {
    type IDialogEvents,
    Dialog,
    bubbleEvents,
} from "./ui/dialog";
import RoleToken from "./RoleToken.vue";

const props = defineProps<{
    role: IRole,
    alignment?: IRoleAlignment,
}>();
const emit = defineEmits<IDialogEvents>();
</script>
