<template>
    <BaseModal
        ref="modal"
        :cover="true"
        :no-heading="true"
        @hide="hideModal"
    >
        <SidebarLayout side="end">
            <ClusterLayout>
                <button
                    v-if="props.infoToken?.isCustom"
                    type="button"
                    class="no-button"
                    @click="deleteInfoToken"
                >
                    Del
                </button>
                <button
                    v-if="props.infoToken?.isCustom"
                    type="button"
                    class="no-button"
                    @click="isEdit = true"
                >
                    Edit
                </button>
            </ClusterLayout>
            <div>
                <button
                    type="button"
                    class="no-button"
                    @click="modal?.hide()"
                >
                    &times;
                </button>
            </div>
        </SidebarLayout>
            
        <InfoTokenForm
            v-if="isEdit"
            button="Update"
            cancel="Cancel"
            :value="props.infoToken?.text"
            @text-change="(text) => updateText(text)"
            @cancel="isEdit = false"
        />
        <div v-else>
            <p>{{ props.infoToken?.text }}</p>
            <p><button type="button" @click="seeRoles">Add role</button></p>
            <ul v-if="props.infoToken?.roleIds.length">
                <li v-for="roleId in props.infoToken.roleIds" :key="roleId">
                    <RoleToken :role="roleId" />
                </li>
            </ul>
        </div>
    </BaseModal>
</template>

<script setup lang="ts">
import type { IInfoToken } from "~/types/data";
import { ref, useTemplateRef } from "vue";
import BaseModal from "~/components/base/BaseModal.vue";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import InfoTokenForm from "./InfoTokenForm.vue";
import RoleToken from "../grimoire/RoleToken.vue";

const emit = defineEmits<{
    (e: "delete", id: IInfoToken["id"]): void,
    (e: "hide"): void,
    (e: "see-roles"): void,
    (e: "update", id: IInfoToken["id"], text: IInfoToken["text"]): void,
}>();
const props = defineProps<{
    infoToken: IInfoToken | null,
}>();

const modal = useTemplateRef("modal");
const isEdit = ref(false);

const hideModal = () => {

    isEdit.value = false;
    emit("hide");

};

const updateText = (text: IInfoToken["text"]) => {

    if (!props.infoToken) {
        return;
    }

    isEdit.value = false;
    emit("update", props.infoToken.id, text);

};

const deleteInfoToken = () => {

    if (!props.infoToken) {
        return;
    }

    emit("delete", props.infoToken.id);
    modal.value?.hide();

};

const seeRoles = () => {
    emit("see-roles");
};

defineExpose({
    show() {
        return modal.value?.show();
    },
    hide() {
        return modal.value?.hide();
    },
})
</script>
