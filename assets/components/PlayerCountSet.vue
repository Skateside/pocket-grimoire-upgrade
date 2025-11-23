<template>
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
const suffix = useId();
const setPlayerCount = (event: Event) => {
    store.setCount(Number((event.target as HTMLInputElement).value));
};
</script>
