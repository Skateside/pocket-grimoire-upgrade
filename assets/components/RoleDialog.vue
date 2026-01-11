<template>
    <DialogUI
        :title="props.role.name"
        :manual="true"
        :hide="true"
        v-on="bubbleEvents(emit)"
    >
        <RoleToken :role="props.role" :alignment="props.alignment" />
        <p>{{ props.role.ability }}</p>
    </DialogUI>
</template>

<script setup lang="ts">
import {
    type IRole,
    ERoleAlignment,
} from "../scripts/types/data";
import {
    type IDialogUIEvents,
    DialogUI,
    bubbleEvents,
} from "./ui/dialog";
import RoleToken from "./RoleToken.vue";

const props = defineProps<{
    role: IRole,
    alignment?: ERoleAlignment,
}>();
const emit = defineEmits<IDialogUIEvents>();
</script>
