<template>

    <SelectEdition />
    <!-- <RoleList /> -->

    <!-- <Grimoire />

    <div class="list">
        <button
            v-for="infoToken in infoTokenStore.infoTokens"
            :key="infoToken.id"
            type="button"
            @click="() => infoTokenId = infoToken.id"
        >{{ infoToken.text }}</button>
    </div>

    <Dialog
        ref="infoTokenDialog"
        :hide="true"
        @close="infoTokenId = ''"
    >
        <InfoToken
            :id="infoTokenId"
            @update="(id, text) => {
                infoTokenFormId = id;
                infoTokenFormText = text;
            }"
            @delete="deleteInfoToken"
        />
    </Dialog>

    <InfoTokenForm
        :id="infoTokenFormId"
        :text="infoTokenFormText"
        @create="addInfoToken"
        @update="updateInfoToken"
        @reset="{
            infoTokenFormId = '';
            infoTokenFormText = '';
        }"
    /> -->

</template>

<script lang="ts" setup>
import SelectEdition from "./components/SelectEdition.vue";
// import RoleList from "./components/RoleList.vue";
/*
import type {
    IInfoToken,
} from "./scripts/types/data";
import {
    ref,
    watch,
} from 'vue';
import useInfoTokenStore from "./scripts/store/infoToken";
import Dialog from './components/Dialog.vue';
import InfoToken from './components/InfoToken.vue';
import InfoTokenForm from "./components/InfoTokenForm.vue";
import Grimoire from "./components/Grimoire.vue";

const infoTokenDialog = ref<typeof Dialog | null>(null);
const infoTokenStore = useInfoTokenStore();
const infoTokenId = ref("");
const infoTokenFormId = ref("");
const infoTokenFormText = ref("");

watch(infoTokenId, (value) => {
    if (value) {
        infoTokenDialog.value?.show();
    }
});

const addInfoToken = (text: IInfoToken["text"]) => {
    infoTokenStore.add(text);
};

const updateInfoToken = (id: IInfoToken["id"], text: IInfoToken["text"]) => {
    infoTokenStore.update(id, text);
};

const deleteInfoToken = (id: IInfoToken["id"]) => {
    infoTokenStore.remove(id);
};
*/
</script>

<style lang="scss" scoped>
/*
.list {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25em;
}
*/
</style>
