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
    <BasePopup ref="popup" />
</template>

<script setup lang="ts">
import type { IRole, IRoleCounts } from "~/types/data";
import { EGameValues } from "~/enums/data";
import { computed, onMounted, useId, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import useGameStore from "~/stores/game";
import useRolesStore from "~/stores/roles";
import useTokensStore from "~/stores/tokens";
import ClusterLayout from "~/layouts/ClusterLayout.vue";
import StackLayout from "~/layouts/StackLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import SetPlayerCount from "./SetPlayerCount.vue";
import NamePlayers from "./NamePlayers.vue";
import SelectRoles from "./SelectRoles.vue";
// import AssignRoles from "./AssignRoles.vue";
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

const handleSubmit = async ({ submitter }: SubmitEvent) => {
    
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
    
    gameStore.setPlayerCount(players);

    // NOTE: if `existingTokens` > 0 then don't reposition automatically.
    // const existingTokens = tokensStore.tokens.length;

    [
        ...tokensStore.reminders,
        ...tokensStore.roles,
        ...tokensStore.seats.slice(players),
    ].forEach((token) => {

        if (!tokensStore.destroy(token)) {
            console.warn("Unable to destroy %s token %o", token.type, token);
        }
    
    });

    times(players - tokensStore.seats.length, () => {
        tokensStore.createSeat();
    });
    tokensStore.seats.forEach((seat) => {

        if (seat.roleId && !tokensStore.setSeatRoleId(seat, undefined)) {
            console.warn("Unable to remove roleId from seat %o", seat);
        }

    });

    playerNames.value.forEach((name, index) => {

        const seat = tokensStore.seats[index];
        const playerName = name.trim() || undefined; // Coerce `""` into `undefined`.

        if (seat && !tokensStore.setSeatName(seat, playerName)) {

            console.warn(
                "Unable to set name of seat %o (index %o) to %o",
                seat,
                index,
                playerName,
            );

        }

    });

    shuffle(rolesSelected.value).forEach((role, index) => {

        const seat = tokensStore.seats[index];

        if (seat && !tokensStore.setSeatRoleId(seat, role.id)) {

            console.warn(
                "Unable to set role ID of seat %o (index %o) to %o (role %o)",
                seat,
                index,
                role.id,
                role,
            );

        }

    });

    router
        .push({ name: "grimoire", query: { place: "auto" } })
        .then((failure) => failure && console.error(failure));

    // TODO: use the `data-action` attribute of the submitted to work out the next step.
    console.log({ submitter });
    // if "draw characters" then show character selection popup
    // -> rolesStore.chosenIds = [...]
    // else add roles to tokens
    // -> shuffle roleIds, assign them to the tokens.

};
</script>
