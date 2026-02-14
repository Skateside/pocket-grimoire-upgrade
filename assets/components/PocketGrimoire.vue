<template>

    <h1>Pocket Grimoire</h1>
    <TabsUI ref="layout" memory="layout" :scroll="true">
        <TabUI name="setup" title="Setup">
            <TabsUI ref="setup" memory="setup">
                <TabUI name="edition" title="Select edition">
                    <SelectEdition />
                </TabUI>
                <TabUI name="players" title="Set players">
                    <PlayerCount />
                    <PlayerCountSet
                        @count-confirm="handleCountConfirm"
                    />
                </TabUI>
                <TabUI name="roles" title="Assign roles" :disabled="!roleStore.hasScript">
                    <AssignRoles />
                </TabUI>
                <TabUI name="cache" title="Cache">
                    <ClearCache />
                </TabUI>
            </TabsUI>
        </TabUI>
        <TabUI name="grimoire" title="Grimoire">
            <GrimoirePad
                ref="grimoire-pad"
                @seat-click="(id) => uiStore.showPopover('seat-menu', id)"
            />
            <DemonBluffs />
        </TabUI>
        <TabUI name="info" title="Info Tokens">
            <InfoTokens
                @info-token-click="handleInfoTokenClick"
                @add-info-token="handleAddInfoToken"
            />
        </TabUI>
        <TabUI name="night" title="Night Order" :disabled="!roleStore.hasScript">
            <NightOrder />
        </TabUI>
        <TabUI name="jinxes" title="Jinxes" :disabled="!jinxStore.hasJinxes">
            <JinxList />
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
        @set-role="handleSeatMenuSetRole"
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

    <InfoTokenDialog
        v-if="uiStore.isPopoverOpen('info-token-dialog')"
        @hide="handleInfoTokenDialogHide"
        @update="handleInfoTokenUpdateClick"
        @delete="handleInfoTokenDeleteClick"
        @add-role="handleInfoTokenAddRoleClick"
    />

    <InfoTokenFormDialog
        v-if="uiStore.isPopoverOpen('info-token-form-dialog')"
        @hide="handleInfoTokenFormDialogHide"
        @reset="handleInfoTokenFormDialogHide"
        @create="handleInfoTokenCreate"
        @update="handleInfoTokenUpdate"
    />

</template>

<script lang="ts" setup>
import type {
    IInfoToken,
    IRole,
    IRoleReminder,
    ITokenRole,
} from "../scripts/types/data";
import {
    nextTick,
    ref,
    useTemplateRef,
} from "vue";
import useGameStore from "../scripts/store/game";
import useInfoTokenStore from "../scripts/store/infoToken";
import useJinxStore from "../scripts/store/jinx";
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
import useUiStore from "../scripts/store/ui";
import {
    type ITabsUIInterface,
    TabsUI,
    TabUI,
} from "./ui/tabs";
import AssignRoles from "./AssignRoles.vue";
import ClearCache from "./ClearCache.vue";
import DemonBluffs from "./DemonBluffs.vue";
import GrimoirePad, { type IGrimoirePadInterface } from "./GrimoirePad.vue";
import InfoTokenDialog from "./InfoTokenDialog.vue";
import InfoTokenFormDialog from "./InfoTokenFormDialog.vue";
import InfoTokens from "./InfoTokens.vue";
import JinxList from "./JinxList.vue";
import NightOrder from "./NightOrder.vue";
import PlayerCount from "./PlayerCount.vue";
import PlayerCountSet from "./PlayerCountSet.vue";
import ReminderListDialog from "./ReminderListDialog.vue";
import RoleDialog from "./RoleDialog.vue";
import RoleListDialog from "./RoleListDialog.vue";
import SeatMenuDialog from "./SeatMenuDialog.vue";
import SelectEdition from "./SelectEdition.vue";
import {
    times,
} from "../scripts/utilities/numbers";

const gameStore = useGameStore();
const jinxStore = useJinxStore();
const infoTokenStore = useInfoTokenStore();
const roleStore = useRoleStore();
const tokenStore = useTokenStore();
const uiStore = useUiStore();
const layout = useTemplateRef<ITabsUIInterface>("layout");
// const setup = useTemplateRef<ITabsUIInterface>("setup");
const grimoirePad = useTemplateRef<IGrimoirePadInterface>("grimoire-pad");

// const handleEditionSelected = () => {
//     setup.value?.setTab("players");
// };

const handleCountConfirm = () => {

    layout.value?.setTab("grimoire");

    times(
        gameStore.playerCount - tokenStore.tokens.length,
        () => tokenStore.create(),
    );

    nextTick(() => grimoirePad.value?.setPositions());

};

const roleListClickActions: Record<string, (id: IRole["id"]) => void> = {

    setSeatTokenRole(id) {

        if (!uiStore.seatMenuToken) {
            return console.warn("uiStore doesn't have seat menu token set");
        }

        tokenStore.update<ITokenRole>(uiStore.seatMenuToken, {
            role: id,
        });
        uiStore.hideAllPopovers();

    },

    addInfoTokenRole(id) {

        if (!infoTokenStore.active) {
            return console.warn("infoTokenStore has no active info token");
        }

        infoTokenStore.addRole(id);
        uiStore.previousPopover();

    },

};

const roleListClickAction = ref("");

const handleRoleListClick = (id: IRole["id"]) => {

    const { value } = roleListClickAction;
    const action = roleListClickActions[value];

    if (!action) {
        return console.warn(`Unrecognised role list click action "${value}"`);
    }

    action(id);
    roleListClickAction.value = "";

};

const showRoleList = (action: string) => {

    roleListClickAction.value = action;
    uiStore.nextPopover("role-list-dialog");

};

const handleSeatMenuSetRole = () => {
    showRoleList("setSeatTokenRole");
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

const handleInfoTokenClick = (id: IInfoToken["id"]) => {

    infoTokenStore.setActive(id);
    uiStore.showPopover("info-token-dialog");

};

const handleInfoTokenDialogHide = () => {

    uiStore.hidePopover("info-token-dialog");
    infoTokenStore.clearActive();

};

const handleAddInfoToken = () => {
    uiStore.showPopover("info-token-form-dialog");
};

const handleInfoTokenFormDialogHide = () => {
    uiStore.previousPopover();
};

const handleInfoTokenCreate = (markdown: IInfoToken["markdown"]) => {
    infoTokenStore.addInfoToken(markdown);
};

const handleInfoTokenUpdateClick = () => {
    uiStore.nextPopover("info-token-form-dialog");
};

const handleInfoTokenDeleteClick = () => {

    infoTokenStore.removeInfoToken(infoTokenStore.active!.id);
    uiStore.previousPopover();

};

const handleInfoTokenUpdate = (
    id: IInfoToken["id"],
    markdown: IInfoToken["markdown"],
) => {

    infoTokenStore.updateInfoToken(id, markdown);
    uiStore.previousPopover();

};

const handleInfoTokenAddRoleClick = () => {
    showRoleList("addInfoTokenRole");
};
</script>
