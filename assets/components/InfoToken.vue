<template>
    <div class="info-token" :style="{ '--colour': `var(--${infoToken?.colour})` }">
        <button type="button" data-dialog="close" aria-label="Close">×</button>
        <div v-if="infoToken?.isCustom">
            <button type="button" data-dialog="close" @click="handleUpdate">Update</button>
            <button type="button" data-dialog="close" @click="handleDelete">Delete</button>
        </div>
        <div class="info-token__text" v-html="toHTML(infoToken?.text || '')"></div>
    </div>
</template>

<script setup lang="ts">
import type { IInfoToken } from "../scripts/types/data";
import { computed } from "vue";
import useInfoTokenStore from "../scripts/store/infoToken";
import { toHTML } from "../scripts/utilities/markdown";

const props = defineProps<{
    id: string,
}>();
const emit = defineEmits<{
    (e: "update", id: IInfoToken["id"], text: IInfoToken["text"]): void,
    (e: "delete", id: IInfoToken["id"]): void,
}>();
const infoTokenStore = useInfoTokenStore();
const infoToken = computed(() => infoTokenStore.getById(props.id));
const handleUpdate = () => {
    if (!infoToken.value) {
        return;
    }
    emit("update", infoToken.value.id, infoToken.value.text);
};
const handleDelete = () => emit("delete", props.id);
</script>

<style lang="scss" scoped>
.info-token {
    background-color: var(--colour);
    background-color: color-mix(in oklab, var(--colour) 40%, #000);
    width: min(80vw, 40rem);
    text-align: center;
    position: relative;
    padding: 1em;

    &::after {
        content: "";
        position: absolute;
        top: 0.5em;
        bottom: 0.5em;
        left: 0.5em;
        right: 0.5em;
        border: 0.1em solid #fff;
        pointer-events: none;
    }
}

.info-token__text {
    font-size: clamp(1rem, 10vw, 3rem);
    margin: 0;
    color: #fff;

    &:lang(de),
    &:lang(id),
    &:lang(ru) {
        font-size: clamp(1rem, 8vw, 3rem);
    }

    &:lang(kv),
    &:lang(pl),
    &:lang(tr) {
        font-size: clamp(1rem, 7vw, 2.5rem);
    }

    > strong {
        font-family: var(--serif-font);
        font-size: 1.3em;
        letter-spacing: 0.1em;
        display: inline-block;
    }
}
</style>
