import { EGameValues } from "~/enums/data";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import {
    clampPlayerCount,
    getBreakdown as helperGetBreakdown,
    getTableData,
    getTeamCount as helperGetTeamCount,
} from "~/helpers/game";
import { isNumber } from "~/utilities/objects";
import useStorage from "~/composables/useStorage";

const useGameStore = defineStore("game", () => {

    const storage = useStorage<number>("game", EGameValues.DEFAULT_NEW_GAME);
    const playerCount = ref(storage.getIfValid(isNumber));
    const breakdown = computed(() => helperGetBreakdown(playerCount.value));

    watch(playerCount, (value) => {
        storage.set(value);
    });

    const clear = () => {
        playerCount.value = EGameValues.DEFAULT_NEW_GAME;
    };

    const getIsPlayerCount = computed(() => (number: number) => {
        return number === playerCount.value;
    });

    const getTable = computed(() => getTableData);
    const getBreakdown = computed(() => helperGetBreakdown);
    const getTeamCount = computed(() => helperGetTeamCount);

    const setPlayerCount = (number: number) => {
        playerCount.value = clampPlayerCount(number);
    };

    return {
        // State.
        playerCount,
        // Getters.
        breakdown,
        getBreakdown,
        getIsPlayerCount,
        getTable,
        getTeamCount,
        // Actions.
        clear,
        setPlayerCount,
    };

});

export default useGameStore;
