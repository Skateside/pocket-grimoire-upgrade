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

        <p v-if="!isEdit">{{ props.infoToken?.text }}</p>

        <InfoTokenForm
            v-if="isEdit"
            button="Update"
            :value="props.infoToken?.text"
            @text-change="(text) => updateText(text)"
        />
    </BaseModal>
</template>

<script setup lang="ts">
import type { IInfoToken } from "~/scripts/types/data";
import { ref, useTemplateRef } from "vue";
import BaseModal from "~/components/base/BaseModal.vue";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import InfoTokenForm from "./InfoTokenForm.vue";

const emit = defineEmits<{
    (e: "delete", id: IInfoToken["id"]): void,
    (e: "hide"): void,
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

defineExpose({
    show() {
        return modal.value?.show();
    },
    hide() {
        return modal.value?.hide();
    },
})
</script>
