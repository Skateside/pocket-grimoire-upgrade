<template>
    <form>
        <template v-for="team in ORDER">
            <fieldset v-if="roleStore.scriptByType[team]?.length">
                <legend>{{ team }}</legend>
                <GridLayout>
                    <div v-for="role in roleStore.scriptByType[team]" :key="role.id">
                        <button type="button">
                            <RoleToken :role="role" />
                        </button>
                        <BaseInputSpinner
                            v-model="counts[role.id]"
                            :label="`Number of ${role.name} added`"
                        />
                    </div>
                </GridLayout>
            </fieldset>
        </template>

        <p>
            <label :for="`duplicates-${suffix}`">
                Allow duplicates?
                <input
                    v-model="duplicates"
                    type="checkbox"
                    name="duplicates"
                    :id="`duplicates-${suffix}`"
                >
            </label>
        </p>

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
                            :value="ETokenDirection.Clockwise"
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
                            :value="ETokenDirection.Anticlockwise"
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
import { computed, onMounted, reactive, ref, useId } from "vue";
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
import GridLayout from "./layouts/GridLayout.vue";
import RoleToken from "./RoleToken.vue";
import BaseInputSpinner from "./BaseInputSpinner.vue";

const ORDER = ref<ReadonlyArray<ERoleTeam>>(Object.freeze([
    ERoleTeam.Townsfolk,
    ERoleTeam.Outsider,
    ERoleTeam.Minion,
    ERoleTeam.Demon,
    ERoleTeam.Traveller,
]));

const suffix = useId();
const roleStore = useRoleStore();
const tokenStore = useTokenStore();
const direction = defineModel<ETokenDirection>("direction", {
    default: ETokenDirection.Clockwise,
});
const duplicates = defineModel<boolean>("duplicates", {
    default: false,
});
const counts = reactive<Record<IRole["id"], number>>({});

const sorted = computed(() => {
    return tokenStore
        .getSortedSeats()
        .map((id) => tokenStore.getById(id))
        .filter(Boolean) as ITokenSeat[];
});

onMounted(() => {
    roleStore.script.forEach(({ id }) => counts[id] = 0);
});
</script>
