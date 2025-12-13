<template>
    <GridLayout>
        <div v-for="infoToken in store.infoTokens" :key="infoToken.id">
            <button
                type="button"
                @click="() => handleClick(infoToken.id)"
            >{{ infoToken.text }}</button>
        </div>
    </GridLayout>
    <!-- <InfoTokenForm /> -->
    <!--
    NOTE: This needs to be in the PocketGrimoire.vue file because we will need
    to be able to switch between this and the list of roles when we add a role
    to the info token.
    -->
    <InfoTokenDialog
        v-if="isShow"
        @hide="handleClose"
        :info-token="store.active!"
    />
</template>

<script setup lang="ts">
import type {
    IInfoToken,
} from "../scripts/types/data";
import { ref } from "vue";
import useInfoTokenStore from "../scripts/store/infoToken";
// import InfoTokenForm from "./InfoTokenForm.vue";
import GridLayout from "./layouts/GridLayout.vue";
import InfoTokenDialog from "./InfoTokenDialog.vue";

const store = useInfoTokenStore();
const isShow = ref(false);

const handleClick = (id: IInfoToken["id"]) => {
    isShow.value = store.setActive(id);
};

const handleClose = () => {
    isShow.value = false;
    store.clearActive();
};
</script>
