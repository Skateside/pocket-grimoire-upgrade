<template>
    <BaseForm memory="set-players" @submit.prevent="handleSubmit">
        <StackLayout>
            <ol>
                <li>
                    <details :name="`set-players-${suffix}`" open>
                        <summary>Set player count</summary>
                        <SetPlayerCount v-model="playerCount" />
                    </details>
                </li>
                <li>
                    <details :name="`set-players-${suffix}`">
                        <summary>Name players (optional)</summary>
                        <NamePlayers v-model="playerNames" :count="Number(playerCount)" />
                    </details>
                </li>
                <li>
                    <details :name="`set-players-${suffix}`">
                        <summary>Choose roles</summary>
                        <SelectRoles v-model="roleCounts" :count="Number(playerCount)" />
                    </details>
                </li>
                <!-- <li>
                    <details :name="`set-players-${suffix}`">
                        <summary>Assign roles (optional)</summary>
                        <AssignRoles
                            :player-count="Number(playerCount)"
                            :player-names="playerNames"
                            :roles-selected="rolesSelected"
                        />
                    </details>
                </li> -->
            </ol>
            <ClusterLayout>
                <BaseButton type="submit" data-action="draw-characters">Draw Characters</BaseButton>
                <BaseButton type="submit" data-action="add-all">Add All</BaseButton>
            </ClusterLayout>
        </StackLayout>
    </BaseForm>

    <DrawRolesModal
        ref="draw-roles-modal"
        :roles="rolesSelectedShuffled"
        @role-click="handleRoleClick"
    />

    <RoleModal ref="role-modal" :role="roleToShow" @hide="handleRoleModalHide">
        <BaseButton @click="handleReturnClick">Return to character select</BaseButton>
    </RoleModal>

    <BasePopup ref="popup" />
</template>

<script setup lang="ts">
import type { IRole, IRoleCounts } from "~/types/data";
import { EGameValues } from "~/enums/data";
import { computed, onMounted, ref, useId, useTemplateRef } from "vue";
import { type RouteLocationRaw, useRouter } from "vue-router";
import useGameStore from "~/stores/game";
import useRolesStore from "~/stores/roles";
import useTokensStore from "~/stores/tokens";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import SetPlayerCount from "./SetPlayerCount.vue";
import NamePlayers from "./NamePlayers.vue";
import SelectRoles from "./SelectRoles.vue";
// import AssignRoles from "./AssignRoles.vue";
import DrawRolesModal from "./DrawRolesModal.vue";
import RoleModal from "~/components/modal/RoleModal.vue";
import { shuffle } from "~/utilities/arrays";
import { times } from "~/utilities/numbers";

const router = useRouter();
const gameStore = useGameStore();
const rolesStore = useRolesStore();
const tokensStore = useTokensStore();

const suffix = useId();
const playerCount = defineModel<string>("player-count", {
    default: String(EGameValues.DEFAULT_NEW_GAME),
});
const roleCounts = defineModel<IRoleCounts>("role-counts", {
    default: {},
});
const playerNames = defineModel<string[]>("player-names", {
    default: [],
});
const rolesSelected = computed(() => {

    const roles: IRole[] = [];

    Object.entries(roleCounts.value).forEach(([roleId, count]) => {

        const role = rolesStore.getRoleById(roleId);

        if (!role) {
            return console.warn("Can't find role with ID %o", roleId);
        }

        times(count, () => roles.push(role));

    });

    return roles;

});
const rolesSelectedShuffled = computed(() => shuffle(rolesSelected.value));
const rolesSelectedInOrder = ref<IRole[]>([]);

onMounted(() => {

    const numberOfPlayers = tokensStore.seats.length;

    if (!numberOfPlayers) {
        return;
    }

    playerCount.value = String(numberOfPlayers);

    tokensStore.seats.forEach((seat, index) => {

        if (seat.roleId) {
            if (!roleCounts.value[seat.roleId]) {
                roleCounts.value[seat.roleId] = 0;
            }
            roleCounts.value[seat.roleId] += 1;
        }

        if (seat.name) {
            playerNames.value[index] = seat.name;
        }

    });

});

const popup = useTemplateRef("popup");

const validateNumbers = async () => {

    if (!popup.value) {
        return console.warn("Popup hasn't been found");
    }

    const selected = rolesSelected.value.length;
    const players = Number(playerCount.value);

    if (selected > players) {

        const message = `Too many roles - ${selected} roles for ${players} players - can't draw characters.`; // TODO: i18n
        popup.value.showAlert(message);

        return; // Validation error.

    } else if (selected < players) {

        const message = `You selected ${selected} role(s) for ${players} players - was that correct?`; // TODO: i18n

        if (!(await popup.value.showConfirm(message))) {
            return; // User-cancelled
        }

    }

    return {
        selected,
        players,
    };

};

const clearDownGrimoire = (players: number) => {

    [
        ...tokensStore.reminders,
        ...tokensStore.roles,
        ...tokensStore.seats.slice(players),
    ].forEach((token) => tokensStore.destroy(token));

    times(players - tokensStore.seats.length, () => {
        tokensStore.createSeat();
    });
    tokensStore.seats.forEach((seat) => {
        tokensStore.setSeatRoleId(seat, undefined);
    });

};

const setPlayerNames = () => {

    playerNames.value.forEach((name, index) => {

        const seat = tokensStore.seats[index];
        const playerName = name.trim() || undefined; // Coerce `""` into `undefined`.

        if (seat) {
            tokensStore.setSeatName(seat, playerName);
        }

    });

};

const assignRolesSelected = () => {

    rolesSelectedInOrder.value.forEach((role, index) => {

        const seat = tokensStore.seats[index];

        if (seat) {
            tokensStore.setSeatRoleId(seat, role.id);
        }

    });

};

const drawRolesModal = useTemplateRef("draw-roles-modal");
const roleModal = useTemplateRef("role-modal");
const roleToShow = ref<IRole | null>(null);
const shouldAutoPlace = ref(false);

const drawCharacters = () => {
    drawRolesModal.value?.show();
};

const assignRandomRoles = () => {

    rolesSelectedInOrder.value = rolesSelectedShuffled.value;
    assignRolesSelected();

};

const handleRoleClick = (role: IRole) => {

    rolesSelectedInOrder.value.push(role);
    roleToShow.value = role;
    roleModal.value?.show();

};

const handleReturnClick = () => {
    roleModal.value?.hide();
};

const handleRoleModalHide = () => {

    roleToShow.value = null;

    if (rolesSelectedInOrder.value.length === rolesSelected.value.length) {
        assignRolesSelected();
        redirect();
    }

};

const handleSubmit = async ({ submitter }: SubmitEvent) => {

    const numbers = await validateNumbers();

    if (!numbers) {
        return; // Validation fail.
    }

    const { players } = numbers;

    gameStore.setPlayerCount(players);
    shouldAutoPlace.value = tokensStore.tokens.length === 0;
    clearDownGrimoire(players);
    setPlayerNames();

    switch (submitter?.dataset.action) {

        case "draw-characters": {
            drawCharacters();
            break;
        }

        case "add-all": {

            assignRandomRoles();
            redirect();
            break;

        }

        default: {

            console.warn(
                "Unrecognised action or missing submitter",
                { submitter, action: submitter?.dataset.action },
            );

        }

    }

};

const redirect = (autoPlace?: boolean) => {

    const destination: RouteLocationRaw = { name: "grimoire" };

    if (
        (typeof autoPlace === "boolean" && autoPlace === true)
        || (autoPlace === undefined && shouldAutoPlace.value)
    ) {
        destination.query = { place: "auto" };
    }

    router
        .push(destination)
        .then((failure) => failure && console.error(failure));

};
</script>
