<template>
    <table class="count-table">
        <caption>Number of roles per team for the number of players (under normal circumstances)</caption>
        <colgroup v-if="props.count">
            <col />
            <col
                v-for="[count] in table.players"
                :key="count"
                :class="{ 'is-count': count === props.count }"
            />
        </colgroup>
        <thead>
            <tr>
                <th scope="row">Players</th>
                <th
                    v-for="[count, text] in table.players"
                    :key="count"
                    scope="col"
                >
                    {{ text }}
                    <span v-if="count === props.count" class="sr-only">(selected)</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="{ team, data } in table.teams"
                :key="team"
                :class="[`count-row--${team}`, {
                    'count-row--good': (
                        team === ERoleTeam.TOWNSFOLK
                        || team === ERoleTeam.OUTSIDER
                    ),
                    'count-row--evil': (
                        team === ERoleTeam.MINION
                        || team === ERoleTeam.DEMON
                    ),
                }]"
            >
                <th scope="row">{{ get(labels, team) || team }}</th>
                <td
                    v-for="{ count, number } in data"
                    :key="count"
                >
                    {{ number }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { ERoleTeam } from "~/enums/data";
import useGameStore from "~/stores/game";
import { computed } from "vue";

const props = defineProps<{
    count?: number,
}>();

const gameStore = useGameStore();
const table = computed(() => gameStore.getTable());
const labels = { // TODO: i18n
    [ERoleTeam.TOWNSFOLK]: "Townsfolk",
    [ERoleTeam.OUTSIDER]: "Outsiders",
    [ERoleTeam.MINION]: "Minions",
    [ERoleTeam.DEMON]: "Demons",
};

// This just satisfies TypeScript.
const get = <TKey extends PropertyKey = string>(
    object: Record<TKey, any>,
    key: TKey,
) => object[key];
</script>

<style lang="scss" scoped>
.count-row--good {
    color: var(--colour-good-team);
}

.count-row--evil {
    color: var(--colour-evil-team);
}

.is-count {
    background-color: #ccc;
}
</style>
