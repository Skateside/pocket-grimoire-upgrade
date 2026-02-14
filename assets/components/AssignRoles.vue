<template>
    <form>
        <p>
            <label :for="`abilities-${suffix}`">
                Show character abilities
                <input
                    v-model="showAbilities"
                    type="checkbox"
                    name="abilities"
                    :id="`abilities-${suffix}`"
                >
            </label>
        </p>
        <p>
            <label :for="`duplicates-${suffix}`">
                Allow duplicate characters
                <input
                    v-model="allowDuplicates"
                    type="checkbox"
                    name="duplicates"
                    :id="`duplicates-${suffix}`"
                >
            </label>
        </p>

        <template v-for="team in ORDER">
            <fieldset v-if="roleStore.scriptByType[team]?.length">
                <legend>{{ team }}</legend>
                <GridLayout min-width="10ch">
                    <div v-for="role in roleStore.scriptByType[team]" :key="role.id">
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
                                :disabled="Boolean(roleStore.getSpecial(role, 'selection', 'bag-disabled'))"
                                @change="() => handleSelection(role)"
                            >
                            <StackLayout node="span">
                                <img :src="roleStore.getImage(role)" alt="" width="50" height="50">
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
import {
    ERoleTeam,
    ETokenDirection,
    type IRole,
    type ITokenSeat,
} from "../scripts/types/data";
import { computed, reactive, ref, useId, watch } from "vue";
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
import GridLayout from "./layouts/GridLayout.vue";
import StackLayout from "./layouts/StackLayout.vue";
import BaseInputSpinner from "./BaseInputSpinner.vue";

const ORDER = ref<ReadonlyArray<ERoleTeam>>(Object.freeze([
    ERoleTeam.TOWNSFOLK,
    ERoleTeam.OUTSIDER,
    ERoleTeam.MINION,
    ERoleTeam.DEMON,
    ERoleTeam.TRAVELLER,
]));

const suffix = useId();
const roleStore = useRoleStore();
const tokenStore = useTokenStore();
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
    Object.fromEntries(roleStore.script.map(({ id }) => [id, false]))
);
const counts = reactive<Record<IRole["id"], number>>(
    Object.fromEntries(roleStore.script.map(({ id }) => [id, 0]))
);

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
            roleStore.getSpecial(role, "selection", "bag-duplicate")
            || roleStore.getSpecial(role, "selection", "good-duplicate")
        )
    ) {
        allowDuplicates.value = true;
    }

};

const sorted = computed(() => {
    return tokenStore
        .getSortedSeats()
        .map((id) => tokenStore.getById(id))
        .filter(Boolean) as ITokenSeat[];
});
</script>
