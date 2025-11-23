<template>
    <div>
        <p>{{ bluffGroup.name || "Demon Bluffs" }}</p>
        <ClusterLayout gap="0" class="bluffs">
            <button
                v-for="(bluff, index) in bluffGroup.roles"
                type="button"
                class="no-button"
                @click="showDialog = index"
            >
                <RoleToken :role="bluff" />
            </button>
        </ClusterLayout>
        <StackLayout>
            <div>
                <button
                    type="button"
                    @click="console.log('TODO: show bluffs dialog')"
                >
                    Show bluffs
                </button>
            </div>
            <div v-if="store.bluffs.length > 1">
                <button
                    type="button"
                    @click="store.removeGroup(props.id)"
                >
                    Remove bluff group
                </button>
            </div>
        </StackLayout>

        <RoleListDialog
            v-if="showDialog !== false"
            title="Demon Bluff"
            type="demon-bluffs"
            :demon-bluffs="bluffGroup.roles"
            @hide="showDialog = false"
            @role-click="handleRoleClick"
        />
    </div>
</template>

<script setup lang="ts">
import type { IDemonBluffGroup, IRole } from "../scripts/types/data";
import { ref } from "vue";
import useBluffsStore from "../scripts/store/bluffs";
import ClusterLayout from "./layouts/ClusterLayout.vue";
import StackLayout from "./layouts/StackLayout.vue";
import RoleToken from "./RoleToken.vue";
import RoleListDialog from "./RoleListDialog.vue";

const props = defineProps<{
    id: IDemonBluffGroup["id"],
}>();
const store = useBluffsStore();
const bluffGroup = store.getGroup(props.id);
const showDialog = ref<number|false>(false);

const handleRoleClick = (id: IRole["id"]) => {

    store.setBluff(props.id, showDialog.value as 0 | 1 | 2, id);
    showDialog.value = false;

};
</script>

<style lang="scss" scoped>
.bluffs {
    justify-content: space-between;
}
</style>
