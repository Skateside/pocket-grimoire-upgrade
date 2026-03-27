<template>
    <!--
    TODO: work out what this should look like.

    Two possibilities for this feature:
        1. Gardener: The Storyteller wants to assign some/all roles.
            - This interface should be quick and easy because there might be
              many roles.
        2. Revolutionary: One player wants to pick a role at random.
            - This interface should allow the user to pick a role without seeing
              all of them.

    -->

    <StackLayout>
        <BaseChoice label="Choose a player" name="chosen-player" v-model="chosenPlayer" :choices="players" empty-text="Please select" />

        <ClusterLayout>
            <BaseChoice label="Choose a role" name="chosen-role" v-model="chosenRole" :choices="roles" empty-text="Please select" />
            <BaseButton>Show role</BaseButton>
        </ClusterLayout>

        <div>
            <BaseButton @click="selectRandomRole">Draw random role</BaseButton>
        </div>
    </StackLayout>

    <BasePopup ref="popup" />

</template>

<script setup lang="ts">
import type { IRole } from "~/scripts/types/data";
import { computed } from "vue";
import type { IBaseChoice } from "~/scripts/types/base";
import { times } from "~/scripts/utilities/numbers";
import BaseChoice from "~/components/base/BaseChoice.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import { shuffle } from "~/scripts/utilities/arrays";

const props = defineProps<{
    playerCount: number,
    playerNames: string[],
    rolesSelected: IRole[],
}>();
const chosenPlayer = defineModel<string>("player", { default: "" });
const chosenRole = defineModel<string>("role", { default: "" });

const players = computed(() => {

    const choices: IBaseChoice[] = [];

    times(props.playerCount, (index) => {

        choices.push({
            text: props.playerNames[index] ?? `Player ${index + 1}`,
            value: String(index),
        });

    });

    return choices;
    
});

const roles = computed(() => {

    const roles: IBaseChoice[] = [];
    const roleIds: IRole["id"][] = [];

    props.rolesSelected.forEach((role) => {

        if (roleIds.includes(role.id)) {
            return;
        }

        roleIds.push(role.id);
        roles.push({ text: role.name, value: role.id });

    });

    return roles;

});

const selectRandomRole = () => {
    const role = shuffle(props.rolesSelected)[0];

    if (role) {
        chosenRole.value = role.id;
    }
};
</script>
