<template>
    <div>
        <p>Demon bluff group {{ props.id }}</p>
        <p>
            <button
                type="button"
                @click="console.log('TODO: show bluffs dialog')"
            >
                Show bluffs
            </button>
        </p>
        <p v-if="bluffStore.bluffs.length > 1">
            <button
                type="button"
                @click="bluffStore.removeGroup(props.id)"
            >
                Remove bluff group
            </button>
        </p>
    </div>
</template>

<script setup lang="ts">
import type { IDemonBluffGroup } from "../scripts/types/data";
import useBluffsStore from "../scripts/store/bluffs";
// import useRoleStore from "../scripts/store/role";

const props = defineProps<{
    id: IDemonBluffGroup["id"],
}>();
const bluffStore = useBluffsStore();
// const roleStore = useRoleStore();
</script>
