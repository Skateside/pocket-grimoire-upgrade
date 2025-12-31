<template>
    <table class="count-table">
        <thead>
            <tr>
                <th scope="row">Players</th>
                <th
                    v-for="[count, text] in table.players"
                    :key="count"
                    scope="col"
                    :class="{ 'is-count': count === store.count }"
                >
                    {{ text }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="{ team, data } in table.teams"
                :key="team"
                :class="[`count-row--${team}`, {
                    'count-row--good': team === 'townsfolk' || team === 'outsider',
                    'count-row--evil': team === 'minion' || team === 'demon',
                }]"
            >
                <th scope="row">{{ labels[team] || team }}</th>
                <td
                    v-for="{ count, number } in data"
                    :class="{ 'is-count': store.getIsCount(count) }"
                >
                    {{ number }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import useGameStore from "../scripts/store/game";
import { computed } from "vue";

const store = useGameStore();
const table = computed(() => store.getTable());
const labels = { // TODO: i18n
    townsfolk: "Townsfolk",
    outsider: "Outsiders",
    minion: "Minions",
    demon: "Demons",
};
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
