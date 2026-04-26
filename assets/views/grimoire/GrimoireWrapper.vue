<template>
    <GrimoirePad @seat-click="showSeatMenu" />

    <GridLayout>
        <div>
            <BaseButton @click="showRoles">Add token</BaseButton>
            <!-- should be able to add traveller/fabled/loric -->
        </div>
        <div>
            <BaseButton>Add reminders</BaseButton>
        </div>
        <div>
            <BaseButton>Show token</BaseButton>
        </div>
        <div>
            <BaseButton variant="danger">Clear Grimoire</BaseButton>
        </div>
        <!-- Auto position tokens - should keep related reminders with their seat -->
    </GridLayout>

    <SeatMenuModal
        ref="seat-menu-modal"
        :token-id="theTokenId"
        @set-role="() => roleSelectModal?.show()"
    />

    <RoleSelectModal ref="role-select-modal" @role-click="setSeatRole" />

    <BasePopup ref="popup" />
</template>

<script setup lang="ts">
import type { IRole, ITokenSeat } from "~/types/data";
import { ref, useTemplateRef } from "vue";
import useTokensStore from "~/stores/tokens";
import GrimoirePad from "./GrimoirePad.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import RoleSelectModal from "./RoleSelectModal.vue";
import SeatMenuModal from "./SeatMenuModal.vue";
import GridLayout from "~/components/layouts/GridLayout.vue";

const tokensStore = useTokensStore();
const seatMenuModal = useTemplateRef("seat-menu-modal");
const roleSelectModal = useTemplateRef("role-select-modal");
const popup = useTemplateRef("popup");
const theTokenId = ref<ITokenSeat["id"] | undefined>(undefined);

const warn = (message: string) => {

    return (
        popup.value
        ? popup.value.showAlert(message)
        : console.warn(message)
    );

};

const showSeatMenu = (tokenId: ITokenSeat["id"]) => {

    theTokenId.value = tokenId;
    seatMenuModal.value?.show();

};

const setSeatRole = (roleId: IRole["id"]) => {

    const token = (
        theTokenId.value?
        tokensStore.getById(theTokenId.value) as ITokenSeat
        : null
    );

    if (!token) {
        return warn("Can't assign seat, no role selected. Please refresh and re-select seat.");
    }

    tokensStore.setSeatRoleId(token, roleId);
    roleSelectModal.value?.hide();
    seatMenuModal.value?.hide();

};

const showRoles = () => {
    roleSelectModal.value?.show();
};
</script>
