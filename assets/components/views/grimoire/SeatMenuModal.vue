<template>
    <BaseModal
        ref="seat-modal"
        :title="(
            role?.name
            ?? token?.name
            ?? (isNumber(token?.index) ? `Player ${token.index + 1}` : undefined)
            ?? 'Unknown token'
        )"
    >
        <p v-if="role">{{ role.ability }}</p>
        <GridLayout v-if="token" min-width="20ch">
            <div>
                <BaseButton @click="() => emit('set-role', token!.id)">Set role</BaseButton>
            </div>
            <div>
                <BaseButton
                    :disabled="!token!.roleId"
                    @click="emit('show-role', token.roleId!)"
                >
                    Show role
                </BaseButton>
            </div>
            <div>
                <BaseButton @click="() => toggleProperty(token!, 'dead')">Toggle shroud</BaseButton>
            </div>
            <div>
                <BaseButton
                    :disabled="!token.dead"
                    @click="() => toggleProperty(token!, 'ghostVote')"
                >
                    Toggle ghost vote
                </BaseButton>
            </div>
            <div>
                <BaseButton @click="() => toggleProperty(token!, 'rotate')">Rotate</BaseButton>
            </div>
            <div>
                <BaseButton variant="danger" @click="removeSeat">Remove</BaseButton>
            </div>
        </GridLayout>
        <p v-else>Token not recognised. Please refresh and/or try again.</p>
        <p style="color: fuchsia">TODO: add reminder(s)</p>
    </BaseModal>
    <BasePopup ref="confirm-popup" />
</template>

<script setup lang="ts">
import type { ITokenSeat } from "~/scripts/types/data";
import { computed, useTemplateRef } from "vue";
import useRolesStore from "~/scripts/stores/roles";
import useTokensStore from "~/scripts/stores/tokens";
import BaseModal from "~/components/base/BaseModal.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import GridLayout from "~/components/layouts/GridLayout.vue";
import { isNumber } from "~/scripts/utilities/objects";

const emit = defineEmits<{
    (e: "set-role", tokenId: ITokenSeat["id"]): void,
    (e: "show-role", roleId: NonNullable<ITokenSeat["roleId"]>): void,
}>();
const props = defineProps<{
    tokenId: ITokenSeat["id"] | undefined,
}>();
const rolesStore = useRolesStore();
const tokensStore = useTokensStore();
const seatModal = useTemplateRef("seat-modal");
const confirmPopup = useTemplateRef("confirm-popup");
const token = computed(() => (
    props.tokenId
    ? tokensStore.getById(props.tokenId) as ITokenSeat
    : undefined
));
const role = computed(() => (
    token.value
    ? rolesStore.getRoleById(token.value.roleId)
    : undefined
));

const toggleProperty = (
    seat: ITokenSeat,
    property: keyof ITokenSeat,
    forceValue?: any,
) => {

    const updates: Partial<ITokenSeat> = {};
    
    updates[property] = forceValue ?? !seat[property];

    if (property === "dead") {
        updates.ghostVote = !seat.dead;
    }

    if (!tokensStore.update(seat, updates)) {

        return confirmPopup.value?.showAlert(
            `Unable to update the "${property}" property. Please try again.`, // TODO: i18n
        );

    }

    seatModal.value?.hide();

};

const removeSeat = async () => {

    seatModal.value?.hide();

    if (!props.tokenId) {

        return confirmPopup.value?.showAlert(
            "Can't identify seat to remove. Please try again.", // TODO: i18n
        );

    }

    if (
        await confirmPopup.value?.showConfirm(
            "Are you sure you want to remove this seat?", // TODO: i18n
        )
    ) {

        if (!tokensStore.destroyById(props.tokenId)) {

            confirmPopup.value!.showAlert(
                "Unable to remove seat. Please refresh and try again.", // TODO: i18n
            );

        }

    } else {
        seatModal.value?.show();
    }

};

defineExpose({
    hide() {
        seatModal.value?.hide();
    },
    show() {
        seatModal.value?.show();
    },
});
</script>
