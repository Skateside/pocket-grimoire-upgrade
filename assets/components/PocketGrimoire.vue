<template>

    <!-- <RoleList /> -->
    <SelectEdition />
    <GrimoirePad
        @seat-click="(id) => uiStore.showPopover('seat-menu', id)"
    />
    <NightOrder />
    <PlayerCount />
    <PlayerCountSet />

    <SeatMenuDialog
        v-if="uiStore.isPopoverOpen('seat-menu')"
        :token-id="uiStore.seatMenuToken"
        @toggle="(visible) => uiStore.togglePopover('seat-menu', visible)"
        @remove="() => uiStore.hidePopover('seat-menu', true)"
        @set-role="() => uiStore.nextPopover('role-list-dialog')"
        @show-role="handleShowRole"
        @add-reminder="handleShowReminderDialog"
    />

    <RoleListDialog
        v-if="uiStore.isPopoverOpen('role-list-dialog')"
        @hide="handleRoleListHide"
        @role-click="handleRoleListClick"
    />

    <RoleDialog
        v-if="uiStore.isPopoverOpen('role-dialog')"
        :role="uiStore.roleDialog.role!"
        :alignment="uiStore.roleDialog.alignment"
        @hide="handleRoleDialogHide"
    />

    <ReminderListDialog
        v-if="uiStore.isPopoverOpen('reminder-list-dialog')"
        @reminder-click="handleReminderListClick"
    />

    <!-- <div class="list">
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
// import RoleList from "./RoleList.vue";
import type {
    IRole,
    IRoleReminder,
    ITokenRole,
    // ITokenReminder,
} from "../scripts/types/data";
import useUiStore from "../scripts/store/ui";
import useTokenStore from "../scripts/store/token";
import SelectEdition from "./SelectEdition.vue";
import GrimoirePad from "./GrimoirePad.vue";
import SeatMenuDialog from "./SeatMenuDialog.vue";
import RoleListDialog from "./RoleListDialog.vue";
import ReminderListDialog from "./ReminderListDialog.vue";
import RoleDialog from "./RoleDialog.vue";
import NightOrder from "./NightOrder.vue";
import PlayerCount from "./PlayerCount.vue";
import PlayerCountSet from "./PlayerCountSet.vue";

const uiStore = useUiStore();
const tokenStore = useTokenStore();

const handleRoleListClick = (id: IRole["id"]) => {

    if (!uiStore.seatMenuToken) {
        return;
    }

    tokenStore.update<ITokenRole>(uiStore.seatMenuToken, {
        role: id,
    });
    uiStore.hideAllPopovers();

};

const handleRoleListHide = () => {

    uiStore.hidePopover("role-list-dialog");
    uiStore.clearPopoverList();

};

const handleShowRole = (role: IRole) => {

    uiStore.roleDialog.role = role;
    uiStore.nextPopover("role-dialog");

};

const handleRoleDialogHide = () => {

    uiStore.hidePopover("role-dialog");
    uiStore.roleDialog.role = undefined;
    uiStore.roleDialog.alignment = undefined;
    uiStore.clearPopoverList();

};

const handleShowReminderDialog = () => {

    uiStore.nextPopover("reminder-list-dialog");

};

const handleReminderListClick = (id: IRoleReminder["id"]) => {

    tokenStore.createReminder({
        reminder: id,
    });
    uiStore.previousPopover();

};

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
