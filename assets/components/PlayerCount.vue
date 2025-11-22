<template>
    <table class="count-table">
        <thead>
            <tr>
                <th scope="row">Player Count</th>
                <th
                    v-for="count in counts"
                    :key="count"
                    scope="col"
                    :class="{ 'is-count': count === store.count }"
                >
                    {{ count === 15 ? "15+" : count }}
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
                <td
                    v-for="(count, key) in breakdown"
                    :key="key"
                    :class="{ 'is-count': store.count === counts[key - 5] }"
                >
                    {{ count }}
                </td>
            </tr>
        </tbody>
    </table>

    <!-- TODO: move this into its own component -->
    <p>
        <label :for="`player-count-${suffix}`">Player count</label>
        <input
            type="range"
            :id="`player-count-${suffix}`"
            min="5"
            max="15"
            step="1"
            :value="store.count"
            @input="setPlayerCount"
            :list="`player-count-list-${suffix}`"
        >
        <datalist :id="`player-count-list-${suffix}`">
            <option value="5" label="5"></option>
            <option value="10" label="10"></option>
            <option value="15" label="15"></option>
        </datalist>
        <output :value="store.count" aria-hidden="true"></output>
    </p>
</template>

<script setup lang="ts">
import useGameStore from "../scripts/store/game";
import { useId } from "vue";

const store = useGameStore();
const labels = {
    townsfolk: "Townsfolk",
    outsider: "Outsiders",
    minion: "Minions",
    demon: "Demons",
};
const counts = Object.keys(store.numbers).map(Number);

const suffix = useId();
const setPlayerCount = (event: Event) => {
    store.setCount(Number((event.target as HTMLInputElement).value));
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
