import type { IStorage } from "../classes/Storage";
import { EGameValues } from "../enums/data";
import { defineStore } from "pinia";
import { computed, inject, ref, watch } from "vue";
import {
    clampPlayerCount,
    getBreakdown as helperGetBreakdown,
    getTableData,
    getTeamCount as helperGetTeamCount,
} from "../helpers/game";
import { isNumber } from "../utilities/objects";
import { StorageNotFoundError } from "~/errors";

const useGameStore = defineStore("game", () => {

    const storage = inject<IStorage>("storage");

    if (!storage) {
        throw new StorageNotFoundError("game store");
    }

    const STORAGE_KEY = "game";
    const playerCount = ref<number>(
        storage.get(STORAGE_KEY, isNumber, EGameValues.DEFAULT_NEW_GAME)
    );
    const breakdown = computed(() => helperGetBreakdown(playerCount.value));

    watch(playerCount, (value) => {
        storage.set(STORAGE_KEY, value);
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
