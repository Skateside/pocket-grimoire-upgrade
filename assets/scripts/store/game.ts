import type {
    IGameCounts,
    IRoleCoreTeam,
} from "../types/data";
import type {
    IStorage,
} from "../classes/Storage";
import { ERoleTeam } from "../types/data";
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
        5: {
            [ERoleTeam.Townsfolk]: 3,
            [ERoleTeam.Outsider]: 0,
            [ERoleTeam.Minion]: 1,
            [ERoleTeam.Demon]: 1,
        },
        6: {
            [ERoleTeam.Townsfolk]: 3,
            [ERoleTeam.Outsider]: 1,
            [ERoleTeam.Minion]: 1,
            [ERoleTeam.Demon]: 1,
        },
        7: {
            [ERoleTeam.Townsfolk]: 5,
            [ERoleTeam.Outsider]: 0,
            [ERoleTeam.Minion]: 1,
            [ERoleTeam.Demon]: 1,
        },
        8: {
            [ERoleTeam.Townsfolk]: 5,
            [ERoleTeam.Outsider]: 1,
            [ERoleTeam.Minion]: 1,
            [ERoleTeam.Demon]: 1,
        },
        9: {
            [ERoleTeam.Townsfolk]: 5,
            [ERoleTeam.Outsider]: 2,
            [ERoleTeam.Minion]: 1,
            [ERoleTeam.Demon]: 1,
        },
        10: {
            [ERoleTeam.Townsfolk]: 7,
            [ERoleTeam.Outsider]: 0,
            [ERoleTeam.Minion]: 2,
            [ERoleTeam.Demon]: 1,
        },
        11: {
            [ERoleTeam.Townsfolk]: 7,
            [ERoleTeam.Outsider]: 1,
            [ERoleTeam.Minion]: 2,
            [ERoleTeam.Demon]: 1,
        },
        12: {
            [ERoleTeam.Townsfolk]: 7,
            [ERoleTeam.Outsider]: 2,
            [ERoleTeam.Minion]: 2,
            [ERoleTeam.Demon]: 1,
        },
        13: {
            [ERoleTeam.Townsfolk]: 9,
            [ERoleTeam.Outsider]: 0,
            [ERoleTeam.Minion]: 3,
            [ERoleTeam.Demon]: 1,
        },
        14: {
            [ERoleTeam.Townsfolk]: 9,
            [ERoleTeam.Outsider]: 1,
            [ERoleTeam.Minion]: 3,
            [ERoleTeam.Demon]: 1,
        },
        15: {
            [ERoleTeam.Townsfolk]: 9,
            [ERoleTeam.Outsider]: 2,
            [ERoleTeam.Minion]: 3,
            [ERoleTeam.Demon]: 1,
        },
    });
    const TEAM_ORDER: ReadonlyArray<IRoleCoreTeam> = Object.freeze([
        ERoleTeam.Townsfolk,
        ERoleTeam.Outsider,
        ERoleTeam.Minion,
        ERoleTeam.Demon,
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
