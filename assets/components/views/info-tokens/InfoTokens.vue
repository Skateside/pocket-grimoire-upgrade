<template>
    <h2>Info Tokens</h2>

    <div v-if="infoTokensStore.official.length">
        <h3>Official Info Tokens</h3>

        <GridLayout>
            <div v-for="infoToken in infoTokensStore.official" :key="infoToken.id">
                <button
                    type="button"
                    class="info-token-trigger"
                    :data-id="infoToken.id"
                    @click="() => selectInfoToken(infoToken)"
                >
                    {{ infoToken.text }}
                </button>
            </div>
        </GridLayout>
    </div>

    <div v-if="infoTokensStore.official.length">
        <h3>Custom Info Tokens</h3>

        <GridLayout>
            <div v-for="infoToken in infoTokensStore.custom" :key="infoToken.id">
                <button
                    type="button"
                    class="info-token-trigger"
                    :data-id="infoToken.id"
                    @click="() => selectInfoToken(infoToken)"
                >
                    {{ infoToken.text }}
                </button>
            </div>
        </GridLayout>
    </div>

    <InfoTokenForm
        heading="Create Info Token"
        button="Create"
        @text-change="createInfoToken"
    />
    <InfoTokenModal
        ref="info-token-modal"
        :info-token="infoToken"
        @hide="infoToken = null"
        @update="updateInfoToken"
        @delete="deleteInfoToken"
    />

    <BasePopup ref="popup" />
</template>

<script setup lang="ts">
import type { IInfoToken } from "~/scripts/types/data";
import { ref, useTemplateRef } from "vue";
import useInfoTokensStore from "~/scripts/stores/infoTokens";
import GridLayout from "~/components/layouts/GridLayout.vue";
import InfoTokenForm from "./InfoTokenForm.vue";
import InfoTokenModal from "./InfoTokenModal.vue";
import BasePopup from "~/components/base/BasePopup.vue";

const infoTokensStore = useInfoTokensStore();

const createInfoToken = (text: IInfoToken["text"]) => {
    infoTokensStore.create(text);
};

const updateInfoToken = (id: IInfoToken["id"], text: IInfoToken["text"]) => {
    if (!infoTokensStore.updateText(id, text)) {
        popup.value?.showAlert("Unable to update info token, please try again."); // TODO: i18n
    }
};

const deleteInfoToken = (id: IInfoToken["id"]) => {
    if (!infoTokensStore.delete(id)) {
        popup.value?.showAlert("Unable to delete info token, please refresh or try again."); // TODO: i18n
    }
};

const infoToken = ref<IInfoToken | null>(null);
const infoTokenModal = useTemplateRef("info-token-modal");
const popup = useTemplateRef("popup");

const selectInfoToken = (token: IInfoToken) => {
    infoToken.value = token;
    infoTokenModal.value?.show();
};
</script>

<style lang="scss" scoped>
.info-token-trigger {
    &[data-id="isdemon"],
    &[data-id="minion"] {
        --info-token-colour: var(--colour-red);
    }
    
    &[data-id="notinplay"] {
        --info-token-colour: var(--colour-blue);
    }
    
    &[data-id="nominatetoday"] {
        --info-token-colour: var(--colour-green);
    }
    
    &[data-id="playeris"] {
        --info-token-colour: var(--colour-purple);
    }
    
    &[data-id="votetoday"] {
        --info-token-colour: var(--colour-dark-purple);
    }
    
    &[data-id="useability"],
    &[data-id="makechoice"],
    &[data-id="selectedyou"] {
        --info-token-colour: var(--colour-darkiorange);
    }

    &[data-id="youare"] {
        --info-token-colour: var(--colour-orange);
    }

    &[data-id^="info-token-"] { // custom info tokens
        --info-token-colour: var(--colour-grey);
    }
}
</style>
