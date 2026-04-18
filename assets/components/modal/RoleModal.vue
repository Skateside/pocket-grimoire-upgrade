<template>
    <BaseModal
        :title="role.name"
        :cover="true"
        @show="() => emit('show')"
        @hide="() => emit('hide')"
        @toggle="(state) => emit('toggle', state)"
    >
        <StackLayout>
            <div>
                <RoleToken :role="role" />
            </div>
            <div v-if="slots.default">
                <slot />
            </div>
        </StackLayout>
    </BaseModal>
</template>

<script setup lang="ts">
import type { IRole } from "~/types/data";
import { ref, useSlots } from "vue";
import useRolesStore from "~/stores/roles";
import BaseModal from './BaseModal.vue';
import RoleToken from "~/views/grimoire/RoleToken.vue";
import StackLayout from "../layouts/StackLayout.vue";

const props = defineProps<{
    role: IRole | null,
}>();
const emit = defineEmits<{
    (e: "hide"): void,
    (e: "show"): void,
    (e: "toggle", state: string): void,
}>();
const slots = useSlots();
const rolesStore = useRolesStore();
const role = ref(rolesStore.interpret(props.role));
</script>
