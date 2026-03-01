<template>
    <BaseForm>
        <p style="color: fuchsia;">TODO: Change <code>BaseRadios</code> into <code>BaseChoice</code>.</p>
        <StackLayout>
            <BaseLabel text="Show character abilities">
                <BaseInput
                    v-model="showAbilities"
                    type="checkbox"
                    name="abilities"
                />
            </BaseLabel>
            <BaseLabel text="Allow duplicate characters">
                <BaseInput
                    v-model="allowDuplicates"
                    type="checkbox"
                    name="duplicates"
                />
            </BaseLabel>
            <BaseRadios
                v-model="direction"
                label="Direction"
                name="direction"
                :radios="{
                    [String(ETokenDirection.CLOCKWISE)]: 'Clockwise',
                    [String(ETokenDirection.ANTICLOCKWISE)]: 'Anti-clockwise',
                }"
            />
        </StackLayout>
    </BaseForm>
    <form>

        <template v-for="team in ORDER">
            <fieldset v-if="rolesStore.scriptByType[team]?.length">
                <legend>{{ team }} ({{ teamCounts[team] }}/{{ gameStore.breakdown[team] ?? "X" }})</legend>
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

        <p>
            <label :for="`start-${suffix}`">Starting player</label>
            <select name="start" :id="`start-${suffix}`">
                <option v-for="seat in sorted" :key="seat.id" :value="seat.id">
                    {{ seat.name ?? seat.index ?? seat.id }}
                </option>
            </select>
        </p>

        <fieldset>
            <legend>Direction</legend>
            <ul>
                <li>
                    <label :for="`direction-clockwise-${suffix}`">
                        Clockwise
                        <input
                            v-model="direction"
                            type="radio"
                            name="direction"
                            :id="`direction-clockwise-${suffix}`"
                            :value="ETokenDirection.CLOCKWISE"
                        >
                    </label>
                </li>
                <li>
                    <label :for="`direction-anticlockwise-${suffix}`">
                        Anti-clockwise
                        <input
                            v-model="direction"
                            type="radio"
                            name="direction"
                            :id="`direction-anticlockwise-${suffix}`"
                            :value="ETokenDirection.ANTICLOCKWISE"
                        >
                    </label>
                </li>
            </ul>
        </fieldset>
    </form>
</template>

<script setup lang="ts">
import type {
    IRole,
    // IRoleCoreTeam,
    ITokenSeat,
} from "~/scripts/types/data";
import {
    ERoleSpecialType,
    ERoleSpecialName,
    ERoleTeam,
    ETokenDirection,
} from "~/scripts/enums/data";
import { computed, reactive, useId, watch } from "vue";
import { ORDER } from "~/scripts/helpers/roles";
import useGameStore from "~/scripts/store/game";
import useRolesStore from "~/scripts/store/roles";
import useTokensStore from "~/scripts/store/tokens";
import GridLayout from "~/components/layouts/GridLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseRadios from "~/components/base/BaseRadios.vue";
import BaseInputSpinner from "~/components/base/BaseInputSpinner.vue"

const suffix = useId();
const gameStore = useGameStore();
const rolesStore = useRolesStore();
const tokensStore = useTokensStore();
const direction = defineModel<ETokenDirection>("direction", {
    default: ETokenDirection.CLOCKWISE,
});
const showAbilities = defineModel<boolean>("abilities", {
    default: true,
});
const allowDuplicates = defineModel<boolean>("duplicates", {
    default: false,
});
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

const sorted = computed(() => {
    return tokensStore
        .getSortedSeats()
        .map((id) => tokensStore.getById(id))
        .filter(Boolean) as ITokenSeat[];
});
</script>
