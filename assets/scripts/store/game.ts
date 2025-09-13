import type {
    // IGameBreakdown,
    IGameCounts,
    IGameInPlay,
    IRole,
} from "../types/data";
import {
    defineStore,
} from "pinia"
import {
    computed,
    // inject,
    reactive,
    ref,
    // watch,
} from "vue";
import {
    clamp,
} from "../utilities/numbers";

const useGameStore = defineStore("gameStore", () => {

    const numbers = computed<IGameCounts>(() => ({
         5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
         6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
         7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
         8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
         9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
        10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
        11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
        12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
        13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
        14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
        15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
    }));
    const playerCount = ref<number>(10);
    const breakdown = computed(() => {
        return numbers.value[Math.min(15, playerCount.value) as keyof IGameCounts];
    });
    const inPlay = reactive<IGameInPlay>({});
    const totalInPlay = computed(() => Object.keys(inPlay).reduce((count, id) => {

        const number = Number(id);

        if (!Number.isNaN(number)) {
            count += number;
        }

        return count;

    }, 0));

    const setCount = (number: number) => {
        playerCount.value = clamp(5, Math.floor(number), 20);
    };

    const addInPlay = (id: IRole["id"]) => {

        if (!Object.hasOwn(inPlay, id)) { // TODO: test - reactive() might break this.
            inPlay[id] = 0;
        }

        inPlay[id] += 1;

    };

    const removeInPlay = (id: IRole["id"]) => {

        if (!Object.hasOwn(inPlay, id)) { // TODO: test - reactive() might break this.
            return;
        }

        inPlay[id] -= 1;

        if (inPlay[id] <= 0) {
            delete inPlay[id];
        }

    };

    return {
        // State.
        breakdown,
        numbers,
        inPlay,
        playerCount,
        totalInPlay,
        // Getters.
        // Actions.
        setCount,
        addInPlay,
        removeInPlay,
    };

});

export default useGameStore;
