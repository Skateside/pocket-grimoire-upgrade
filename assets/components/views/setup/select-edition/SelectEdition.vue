<template>

    <ReelLayout node="menu" class="no-list">
        <li><RouterLink :to="{ name: 'select-edition-official' }">Official scripts</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-upload' }">Upload a custom script</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-url' }">Enter a URL</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-clipboard' }">Paste from clipboard</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-botc-scripts' }">Search BotC Scripts</RouterLink></li>
    </ReelLayout>

    <RouterView
        @success="handleSuccess"
        @invalid="handleInvalid"
        @error="handleError"
    />

    <p v-if="isSuccess" style="color: green">Success</p>
    <BasePopup ref="invalid-popup" @hidden="handleInvalidPopupClose">
        <p>The valid roles have been imported, but some roles couldn't be.</p>
        
        <dl>
            <div v-for="{ role, reasons } in rolesStore.importReport.invalid">
                <dt>{{ role.id || "(unknown role)" }}</dt>
                <dd v-for="reason in reasons">{{ reason }}</dd>
            </div>
        </dl>
    </BasePopup>
    <BasePopup ref="error-popup" />
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { RouterLink, RouterView } from "vue-router";
import ReelLayout from "~/components/layouts/ReelLayout.vue";
// import InvalidRolesDialog from "./InvalidRolesDialog.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import useRolesStore from "~/scripts/stores/roles";

const rolesStore = useRolesStore();
const isSuccess = ref(false);
const invalidPopup = useTemplateRef("invalid-popup");
const errorPopup = useTemplateRef("error-popup");

const handleSuccess = () => {
    isSuccess.value = true;
    window.setTimeout(() => isSuccess.value = false, 3500);
};

const handleInvalid = () => {
    invalidPopup.value?.showAlert(); // TODO: showConfirm: Do you want to load in the other roles?
};

const handleError = (message: string) => {
    errorPopup.value?.showAlert(message);
};

const handleInvalidPopupClose = () => {
    rolesStore.clearImportReport();
};
</script>