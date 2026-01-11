<template>
    <DialogUI
        :title="props.title"
        v-on="bubbleEvents(emit)"
    >
        <GridLayout gap="var(--sizing-sm)" max-width="10ch">
            <button
                v-for="role in roles"
                type="button"
                class="no-button"
                @click="() => emit('role-click', role.id)"
            >
                <RoleToken :role="role" />
            </button>
        </GridLayout>
        <StackLayout v-if="props.type === 'demon-bluffs'" node="form">
            <label :for="`show-existing-${suffix}`">
                <input
                    type="checkbox"
                    :id="`show-existing-${suffix}`"
                    @change="({ target }) => isShowExisting = (target as HTMLInputElement).checked"
                >
                Show existing characters
            </label>
            <label :for="`show-evil-${suffix}`">
                <input
                    type="checkbox"
                    :id="`show-evil-${suffix}`"
                    @change="({ target }) => isShowEvil = (target as HTMLInputElement).checked"
                >
                Show evil characters
            </label>
        </StackLayout>
    </DialogUI>
</template>

<script setup lang="ts">
import type {
    IDemonBluffGroup,
    IRole,
} from "../scripts/types/data";
import {
    computed,
    ref,
    useId,
} from "vue";
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
import {
    type IDialogUIEvents,
    DialogUI,
    bubbleEvents,
} from "./ui/dialog";
import GridLayout from "./layouts/GridLayout.vue";
import RoleToken from "./RoleToken.vue";
import StackLayout from "./layouts/StackLayout.vue";

const props = withDefaults(defineProps<{
    type?: "demon-bluffs",
    title?: string,
    demonBluffs?: IDemonBluffGroup["roles"],
}>(), {
    title: "Roles",
});
const emit = defineEmits<IDialogUIEvents & {
    (e: "role-click", id: IRole["id"]): void,
}>();

const roleStore = useRoleStore();
const tokenStore = useTokenStore();
const roles = computed(() => {

    let roles = roleStore.script.filter((role) => {
        return !roleStore.getIsMeta(role) && !roleStore.getIsSpecial(role);
    }) as IRole[];

    if (props.type === "demon-bluffs") {

        roles = roles.filter(({ id, team }) => (
            team !== "fabled"
            && team !== "loric"
            && (
                isShowExisting.value
                || (
                    !Object.hasOwn(tokenStore.inPlay, id)
                    && !props.demonBluffs?.includes(id)
                )
            )
            && (
                isShowEvil.value
                || (
                    team !== "demon"
                    && team !== "minion"
                )
            )
        ));

    }

    return roles;

});
const isShowExisting = ref<boolean>(false);
const isShowEvil = ref<boolean>(false);
const suffix = useId();
</script>
