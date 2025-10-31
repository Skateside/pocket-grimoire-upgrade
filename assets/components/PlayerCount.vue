<template>
    <table class="count-table">
        <thead>
            <tr>
                <th scope="row">Player Count</th>
                <th
                    v-for="count in Object.keys(store.numbers)"
                    :key="count"
                    scope="col"
                >
                    {{ count === "15" ? "15+" : count }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="(breakdown, team) in store.table"
                :class="[`count-row--${team}`, {
                    'count-row--good': team === 'townsfolk' || team === 'outsider',
                    'count-row--evil': team === 'minion' || team === 'demon',
                }]"
            >
                <th scope="row">{{ labels[team] || team }}</th>
                <td v-for="count in breakdown">{{ count }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import useGameStore from "../scripts/store/game";

const store = useGameStore();
const labels = {
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
</style>
