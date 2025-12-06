import type {
    IGameCounts,
    IRoleCoreTeam,
} from "../types/data";
import type {
    IStorage,
} from "../classes/Storage";
import {
    defineStore,
} from "pinia";
import {
    computed,
    inject,
    // reactive,
    ref,
    watch,
} from "vue";
import {
    clamp,
} from "../utilities/numbers";

const useGameStore = defineStore("game", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "game";

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
    const count = ref<number>(
        storage.get(STORAGE_KEY, 10)
    );

    watch(count, (value) => {
        storage.set(STORAGE_KEY, value);
    });

    const clear = () => {
        count.value = 10;
    };

    const breakdown = computed(() => {
        return numbers.value[Math.min(15, count.value) as keyof IGameCounts];
    });

    const table = computed(() => {

        const table = {} as Record<IRoleCoreTeam, Record<number, number>>;

        Object.entries(numbers.value).forEach(([count, breakdown]) => {

            Object.entries(breakdown).forEach(([team, number]) => {

                const coreTeam = team as IRoleCoreTeam;

                if (!table[coreTeam]) {
                    table[coreTeam] = {};
                }

                table[coreTeam][Number(count)] = number;

            });

        });

        return table;

    });

    const setCount = (number: number) => {
        count.value = clamp(5, Math.floor(number), 20);
    };

    return {
        // State.
        breakdown,
        count,
        numbers,
        table,
        // Getters.
        setCount,
        // Actions.
        clear,
    };

});

export default useGameStore;
