<template>
    <div ref="dialog" popover>
        <button
            v-for="role in roles"
            type="button"
            class="no-button"
        >
            <RoleToken :role="role" />
        </button>
    </div>
</template>

<script setup lang="ts">
import type { IRole } from "../scripts/types/data";
import useRoleStore from "../scripts/store/role";
import { computed, onMounted, ref } from "vue";
import RoleToken from "./RoleToken.vue";

const store = useRoleStore();
const dialog = ref<HTMLElement | null>(null);
const roles = computed(() => {
    return store.script.filter((role) => !store.getIsMeta(role)) as IRole[];
});

onMounted(() => {
    dialog.value?.showPopover();
});
</script>
