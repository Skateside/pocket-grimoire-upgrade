<template>
    <DialogUI
        :manual="true"
        :hide="true"
        v-on="bubbleEvents(emit)"
        class="info-token"
        :style="{
            '--colour': `var(--colour-${infoToken.colour})`,
        }"
    >
        <div class="info-token__text" v-html="infoToken.markup"></div>
        <div v-if="infoToken?.isCustom">
            <button type="button" @click="handleUpdate">Update</button>
            <button type="button" @click="() => emit('delete')">Delete</button>
        </div>
        <ClusterLayout
            v-if="roles.length"
        >
            <RoleToken v-for="role in roles" :key="role.id" :role="role" />
        </ClusterLayout>
        <button type="button" @click="() => emit('add-role')">Add role(s)</button>
    </DialogUI>
</template>

<script setup lang="ts">
import type { IInfoToken } from "../scripts/types/data";
import { computed } from "vue";
import {
    type IDialogUIEvents,
    DialogUI,
    bubbleEvents,
} from "./ui/dialog";
import useInfoTokenStore from "../scripts/store/infoToken";
import useRoleStore from "../scripts/store/role";
import ClusterLayout from "./layouts/ClusterLayout.vue";
import RoleToken from "./RoleToken.vue";

const emit = defineEmits<IDialogUIEvents & {
    (e: "update"): void,
    (e: "delete"): void,
    (e: "add-role"): void,
}>();
const infoTokenStore = useInfoTokenStore();
const roleStore = useRoleStore();
const infoToken = computed<IInfoToken>(() => infoTokenStore.active!);
const roles = computed(() => infoToken.value.roleIds.map(roleStore.getById));

const handleUpdate = () => {

    if (!infoToken.value) {
        return;
    }

    emit("update");

};
</script>

<style lang="scss" scoped>
@property --info-token-text-min { syntax: "<length>"; initial-value: 16px; inherits: true; }
@property --info-token-text-size { syntax: "<length>"; initial-value: 32px; inherits: true; }
@property --info-token-text-max { syntax: "<length>"; initial-value: 48px; inherits: true; }

.info-token {
    background-color: var(--colour);
    background-color: color-mix(in oklab, var(--colour) 40%, #000);
    width: min(80vw, 40rem);
    text-align: center;
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
    --info-token-text-min: 1rem;
    --info-token-text-size: 10vw;
    --info-token-text-max: 3rem;

    font-size: clamp(
        var(--info-token-text-min),
        var(--info-token-text-size),
        var(--info-token-text-max)
    );
    margin: 0;
    color: #fff;

    &:lang(de),
    &:lang(id),
    &:lang(ru) {
        --info-token-text-size: 8vw;
    }

    &:lang(kv),
    &:lang(pl),
    &:lang(tr) {
        --info-token-text-size: 7vw;
        --info-token-text-max: 2.5rem;
    }

    :deep(> strong) {
        font-family: var(--font-family-serif);
        font-size: 1.3em;
        letter-spacing: 0.1em;
        display: inline-block;
    }
}
</style>
