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
    ref,
    watch,
} from "vue";
import {
    clamp,
} from "../utilities/numbers";
import {
    deepFreeze,
} from "../utilities/objects";

const useGameStore = defineStore("game", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "game";
    const NUMBERS = deepFreeze<IGameCounts>({
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
    });
    const TEAM_ORDER: ReadonlyArray<IRoleCoreTeam> = Object.freeze([
        "townsfolk",
        "outsider",
        "minion",
        "demon",
        // "traveller",
        // "fabled",
        // "loric",
    ]);
    const count = ref<number>(
        storage.get(STORAGE_KEY, 10)
    );

    watch(count, (value) => {
        storage.set(STORAGE_KEY, value);
    });

    const clear = () => {
        count.value = 10;
    };

    const innerGetSortedCounts = () => {
        return Object.keys(NUMBERS).map(Number).sort((a, b) => a - b);
    };

    const innerGetPlayerCounts = () => {

        const playerCounts = new Map<number, string>();

        innerGetSortedCounts().forEach((count) => {

            playerCounts.set(
                count,
                (
                    count === 15
                    ? `${count}+`
                    : String(count)
                ),
            );

        });

        return playerCounts;

    };

    const innerGetTeamBreakdown = () => {

        const teams: {
            team: IRoleCoreTeam,
            data: { count: number, number: number }[]
        }[] = [];
        const counts = innerGetSortedCounts();

        TEAM_ORDER.forEach((team) => {

            teams.push({
                team,
                data: counts.map((count) => ({
                    count,
                    number: NUMBERS[count][team],
                }))
            });

        });

        return teams;

    };

    const getTable = computed(() => () => ({
        players: innerGetPlayerCounts(),
        teams: innerGetTeamBreakdown(),
    }));

    const getIsCount = computed(() => (number: number) => number === count.value);

    const getRange = computed(() => () => {
        const counts = innerGetSortedCounts();
        return {
            max: Math.max(...counts),
            min: Math.min(...counts),
        };
    });

    const setCount = (number: number) => {
        count.value = clamp(5, Math.floor(number), 20);
    };

    return {
        // State.
        count,
        // Getters.
        getIsCount,
        getRange,
        getTable,
        // Actions.
        clear,
        setCount,
    };

});

export default useGameStore;
