<template>
    <StackLayout>
        <h2>Info Tokens</h2>
        <GridLayout>
            <div v-for="infoToken in store.official" :key="infoToken.id">
                <button
                    type="button"
                    @click="() => emit('info-token-click', infoToken.id)"
                >{{ infoToken.text }}</button>
            </div>
        </GridLayout>
        <h3>Custom Info Tokens</h3>
        <GridLayout v-if="store.custom.length">
            <div v-for="infoToken in store.custom" :key="infoToken.id">
                <button
                    type="button"
                    @click="() => emit('info-token-click', infoToken.id)"
                >{{ infoToken.text }}</button>
            </div>
        </GridLayout>
        <div>
            <button
                type="button"
                @click="() => emit('add-info-token')"
            >Add info token</button>
        </div>
    </StackLayout>
</template>

<script setup lang="ts">
import type {
    IInfoToken,
} from "../scripts/types/data";
import useInfoTokenStore from "../scripts/store/infoToken";
import GridLayout from "./layouts/GridLayout.vue";
import StackLayout from "./layouts/StackLayout.vue";

const emit = defineEmits<{
    (e: "info-token-click", id: IInfoToken["id"]): void,
    (e: "add-info-token"): void,
}>();
const store = useInfoTokenStore();
</script>
