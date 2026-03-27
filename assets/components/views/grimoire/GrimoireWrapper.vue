<template>
    <GrimoirePad
        @seat-click="handleSeatClick"
    />
    <BaseModal ref="seat-modal" :title="role?.name ?? seatTitle">
        <p v-if="role">{{ role.ability }}</p>
        <GridLayout>
            <div><BaseButton>Set role</BaseButton></div>
            <div><BaseButton>Show role</BaseButton></div>
            <div><BaseButton>Toggle shroud</BaseButton></div>
            <div><BaseButton>Toggle ghost vote</BaseButton></div>
            <div><BaseButton>Rotate</BaseButton></div>
            <div><BaseButton>Remove</BaseButton></div>
        </GridLayout>
        <!-- set role | unset role | show role | toggle shroud/dead | toggle ghost vote | rotate -->
        <!-- add reminder -->
    </BaseModal>
    <BasePopup ref="popup" />
</template>

<script setup lang="ts">
import type { IRole, ITokenSeat } from "~/scripts/types/data";
import { ref, useTemplateRef } from "vue";
import useRolesStore from "~/scripts/stores/roles";
import useTokensStore from "~/scripts/stores/tokens";
import GrimoirePad from "./GrimoirePad.vue";
import BaseModal from "~/components/base/BaseModal.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import GridLayout from "~/components/layouts/GridLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";

const rolesStore = useRolesStore();
const tokensStore = useTokensStore();
const seatModal = useTemplateRef("seat-modal");
const popup = useTemplateRef("popup");
const role = ref<IRole | undefined>(undefined);
const seatTitle = ref("");

const handleSeatClick = (tokenId: ITokenSeat["id"]) => {

    const token = tokensStore.getById(tokenId) as ITokenSeat;

    if (!token) {

        const message = `Unrecognised token ID "${tokenId}" - please refresh and try again.`;

        return (
            popup.value
            ? popup.value.showAlert(message)
            : console.warn(message)
        );

    }

    seatTitle.value = token.name ?? `Player ${token.index + 1}`
    role.value = rolesStore.getRoleById(token.roleId);

    seatModal.value?.show();

};
</script>
