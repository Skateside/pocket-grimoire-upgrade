<template>

    <TabsUI ref="layout" identifier="layout">
        <TabUI title="Grimoire">
            <GrimoirePad
                ref="grimoirePad"
                @seat-click="(id) => uiStore.showPopover('seat-menu', id)"
            />
            <DemonBluffs />
        </TabUI>
        <TabUI title="Setup">
            <TabsUI identifier="setup">
                <TabUI title="Set players">
                    <PlayerCount />
                    <PlayerCountSet
                        @count-confirm="handleCountConfirm"
                    />
                </TabUI>
                <TabUI title="Select edition">
                    <SelectEdition />
                </TabUI>
                <TabUI title="Cache">
                    <ClearCache />
                </TabUI>
            </TabsUI>
        </TabUI>
        <TabUI title="Info Tokens">
            <p>Todo: Info tokens.</p>
        </TabUI>
        <TabUI title="Night Order" :disabled="!roleStore.hasScript">
            <NightOrder />
        </TabUI>
        <TabUI title="Jinxes" :disabled="true">
            <p>Todo: Jinxes (enabled if necessary)</p>
        </TabUI>
    </TabsUI>

    <!-- <details>
        <summary>Acknowledgements</summary>
        <div>
            <p><a href="https://bloodontheclocktower.com/">Blood on the Clocktower</a> is a trademark of Steven Medway and <a href="https://www.thepandemoniuminstitute.com/">The Pandemonium Institute</a>.</p>
            <p>Role icons from <a href="https://github.com/tomozbot/botc-icons">bots-icons</a>.</p>
            <p>Additional from <a href="https://game-icons.net/">Game-icons.net</a>.</p>
            <p>Version 2</p>
        </div>
    </details> -->

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
import type {
    IRole,
    IRoleReminder,
    ITokenRole,
} from "../scripts/types/data";
import {
    nextTick,
    ref,
} from "vue";
import useGameStore from "../scripts/store/game";
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
import useUiStore from "../scripts/store/ui";
import {
    type ITabsUIInterface,
    TabsUI,
    TabUI,
} from "./ui/tabs";
import SelectEdition from "./SelectEdition.vue";
import GrimoirePad from "./GrimoirePad.vue";
import SeatMenuDialog from "./SeatMenuDialog.vue";
import RoleListDialog from "./RoleListDialog.vue";
import ReminderListDialog from "./ReminderListDialog.vue";
import RoleDialog from "./RoleDialog.vue";
import NightOrder from "./NightOrder.vue";
import PlayerCount from "./PlayerCount.vue";
import PlayerCountSet from "./PlayerCountSet.vue";
import DemonBluffs from "./DemonBluffs.vue";
import ClearCache from "./ClearCache.vue";
import {
    times,
} from "../scripts/utilities/numbers";

const gameStore = useGameStore();
const roleStore = useRoleStore();
const tokenStore = useTokenStore();
const uiStore = useUiStore();
const layout = ref<typeof TabsUI | null>(null);
const grimoirePad = ref<typeof GrimoirePad | null>(null);

const handleCountConfirm = () => {

    (layout.value as any as ITabsUIInterface)?.setTab("Grimoire");

    times(
        gameStore.count - tokenStore.tokens.length,
        () => tokenStore.create(),
    );

    nextTick(() => grimoirePad.value?.setPositions());

};

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
