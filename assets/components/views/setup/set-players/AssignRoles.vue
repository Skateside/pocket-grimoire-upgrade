<template>
    <StackLayout>
        <BaseLabel label="Show character abilities" :nested="true">
            <BaseCheckbox
                v-model="showAbilities"
                name="abilities"
            />
        </BaseLabel>
        <BaseLabel label="Allow duplicate characters" :nested="true">
            <BaseCheckbox
                v-model="allowDuplicates"
                name="duplicates"
            />
        </BaseLabel>
    </StackLayout>

    <template v-for="team in ORDER">
        <fieldset v-if="rolesStore.scriptByType[team]?.length">
            <legend>{{ team }} ({{ teamCounts[team] }}/{{ gameStore.getTeamCount(team, props.count) }})</legend>
            <GridLayout min-width="10ch">
                <div v-for="role in rolesStore.scriptByType[team]" :key="role.id">
                    <BaseInputSpinner
                        v-if="allowDuplicates && included[role.id]"
                        v-model="counts[role.id]"
                        readonly
                        :aria-label="`Number of ${role.name} to add`"
                        :min="0"
                    />
                    <label :for="`role-${role.id}-${suffix}`">
                        <input
                            v-model="included[role.id]"
                            type="checkbox"
                            :name="`role[${role.id}]`"
                            :id="`role-${role.id}-${suffix}`"
                            :disabled="Boolean(rolesStore.getSpecial(role, ERoleSpecialType.SELECTION, ERoleSpecialName.BAG_DISABLED))"
                            @change="() => handleSelection(role)"
                        >
                        <StackLayout node="span">
                            <img :src="rolesStore.getImage(role)" alt="" width="50" height="50">
                            <strong>{{ role.name }}</strong>
                            <span v-if="showAbilities">{{ role.ability }}</span>
                        </StackLayout>
                    </label>
                </div>
            </GridLayout>
        </fieldset>
    </template>
</template>

<script setup lang="ts">
import type { IRole } from "~/scripts/types/data";
import {
    ERoleSpecialType,
    ERoleSpecialName,
    ERoleTeam,
} from "~/scripts/enums/data";
import { computed, reactive, useId, watch } from "vue";
import { ORDER } from "~/scripts/helpers/roles";
import useGameStore from "~/scripts/store/game";
import useRolesStore from "~/scripts/store/roles";
import GridLayout from "~/components/layouts/GridLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseCheckbox from "~/components/base/BaseCheckbox.vue";
import BaseInputSpinner from "~/components/base/BaseInputSpinner.vue"

const props = defineProps<{
    count: number,
}>();

const suffix = useId();
const gameStore = useGameStore();
const rolesStore = useRolesStore();
const showAbilities = defineModel<boolean>("abilities", { default: true });
const allowDuplicates = defineModel<boolean>("duplicates", { default: false });
const included = reactive<Record<IRole["id"], boolean>>(
    Object.fromEntries(rolesStore.script.map(({ id }) => [id, false]))
);
const counts = reactive<Record<IRole["id"], number>>(
    Object.fromEntries(rolesStore.script.map(({ id }) => [id, 0]))
);
const teams = computed<Record<IRole["id"], ERoleTeam>>(() => Object.fromEntries(
    rolesStore.script
        .filter((role) => !rolesStore.getIsMeta(role))
        .map((role) => [role.id, (role as IRole).team])
));
const teamCounts = computed(() => {

    const teamCounts = Object.fromEntries(ORDER.map((team) => [team, 0]));

    Object.entries(counts).forEach(([id, count]) => {

        const team = teams.value[id];

        if (!team) {
            return;
        }

        teamCounts[team] += Number(count);

    });

    return teamCounts;

});

watch(counts, (value) => {

    Object.entries(value).forEach(([id, count]) => {

        if (count < 1) {
            included[id] = false;
        }

    });

});

const handleSelection = (role: IRole) => {

    const { id } = role;

    counts[id] = Number(included[id]);

    if (
        included[id]
        && (
            rolesStore.getSpecial(
                role,
                ERoleSpecialType.SELECTION,
                ERoleSpecialName.BAG_DUPLICATE,
            )
            || rolesStore.getSpecial(
                role,
                ERoleSpecialType.SELECTION,
                ERoleSpecialName.GOOD_DUPLICATE,
            )
        )
    ) {
        allowDuplicates.value = true;
    }

};
</script>
