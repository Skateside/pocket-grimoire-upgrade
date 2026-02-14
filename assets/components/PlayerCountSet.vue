<template>
    <form @submit.prevent="handleSubmit">
        <StackLayout>
            <ClusterLayout>
                <label :for="`player-count-${suffix}`">Player count</label>
                <input
                    type="range"
                    :id="`player-count-${suffix}`"
                    :min="range.min"
                    :max="range.max"
                    step="1"
                    :value="store.playerCount"
                    @input="setPlayerCount"
                >
                <output :value="store.playerCount" aria-hidden="true"></output>
            </ClusterLayout>
            <div>
                <button type="submit">Add seats</button>
            </div>
        </StackLayout>
    </form>
</template>

<script setup lang="ts">
import {
    computed,
    useId,
} from "vue";
import useGameStore from "../scripts/store/game";
import ClusterLayout from "./layouts/ClusterLayout.vue";
import StackLayout from "./layouts/StackLayout.vue";

const store = useGameStore();
const suffix = useId();
const range = computed(() => store.getRange());
const setPlayerCount = (event: Event) => {
    store.setPlayerCount(Number((event.target as HTMLInputElement).value));
};

const emit = defineEmits<{
    (e: "count-confirm"): void,
}>();

const handleSubmit = () => {
    emit("count-confirm");
};
</script>
