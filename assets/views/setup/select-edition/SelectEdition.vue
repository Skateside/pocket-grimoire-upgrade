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
    <BasePopup
        ref="invalid-popup"
        yes-text="Import valid"
        no-text="Don't import"
        @hidden="handleInvalidPopupClose"
    >
        <StackLayout>

            <template v-if="rolesStore.importReport.errors.length">
                <p>There were some problems with the import.</p>

                <ul>
                    <li v-for="error in rolesStore.importReport.errors">
                        {{ error }}
                    </li>
                </ul>
            </template>

            <template v-if="rolesStore.importReport.invalid.length">
                <p>There were some errors with {{ rolesStore.importReport.invalid.length }} of the roles.</p>
    
                <dl>
                    <div v-for="{ role, reasons } in rolesStore.importReport.invalid">
                        <dt>{{ role.id || "(unknown role)" }}</dt>
                        <dd v-for="reason in reasons">{{ reason }}</dd>
                    </div>
                </dl>
            </template>

            <p>Would you like to import the valid {{ rolesStore.importReport.validCount }} role(s)?</p>

        </StackLayout>
    </BasePopup>
    <BasePopup ref="error-popup" />
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { RouterLink, RouterView } from "vue-router";
import ReelLayout from "~/layouts/ReelLayout.vue";
import StackLayout from "~/layouts/StackLayout.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import useRolesStore from "~/stores/roles";

const rolesStore = useRolesStore();
const isSuccess = ref(false);
const invalidPopup = useTemplateRef("invalid-popup");
const errorPopup = useTemplateRef("error-popup");

const handleSuccess = () => {
    rolesStore.setScriptFromImport();
    isSuccess.value = true;
    window.setTimeout(() => isSuccess.value = false, 3500);
};

const handleInvalid = async () => {

    if (await invalidPopup.value?.showConfirm()) {
        rolesStore.setScriptFromImport();
    }

};

const handleError = (message: string) => {
    errorPopup.value?.showAlert(message);
};

const handleInvalidPopupClose = () => {
    rolesStore.clearImportReport();
};
</script>