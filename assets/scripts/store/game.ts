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
            [ERoleTeam.TOWNSFOLK]: 3,
            [ERoleTeam.OUTSIDER]: 0,
            [ERoleTeam.MINION]: 1,
            [ERoleTeam.DEMON]: 1,
        },
        6: {
            [ERoleTeam.TOWNSFOLK]: 3,
            [ERoleTeam.OUTSIDER]: 1,
            [ERoleTeam.MINION]: 1,
            [ERoleTeam.DEMON]: 1,
        },
        7: {
            [ERoleTeam.TOWNSFOLK]: 5,
            [ERoleTeam.OUTSIDER]: 0,
            [ERoleTeam.MINION]: 1,
            [ERoleTeam.DEMON]: 1,
        },
        8: {
            [ERoleTeam.TOWNSFOLK]: 5,
            [ERoleTeam.OUTSIDER]: 1,
            [ERoleTeam.MINION]: 1,
            [ERoleTeam.DEMON]: 1,
        },
        9: {
            [ERoleTeam.TOWNSFOLK]: 5,
            [ERoleTeam.OUTSIDER]: 2,
            [ERoleTeam.MINION]: 1,
            [ERoleTeam.DEMON]: 1,
        },
        10: {
            [ERoleTeam.TOWNSFOLK]: 7,
            [ERoleTeam.OUTSIDER]: 0,
            [ERoleTeam.MINION]: 2,
            [ERoleTeam.DEMON]: 1,
        },
        11: {
            [ERoleTeam.TOWNSFOLK]: 7,
            [ERoleTeam.OUTSIDER]: 1,
            [ERoleTeam.MINION]: 2,
            [ERoleTeam.DEMON]: 1,
        },
        12: {
            [ERoleTeam.TOWNSFOLK]: 7,
            [ERoleTeam.OUTSIDER]: 2,
            [ERoleTeam.MINION]: 2,
            [ERoleTeam.DEMON]: 1,
        },
        13: {
            [ERoleTeam.TOWNSFOLK]: 9,
            [ERoleTeam.OUTSIDER]: 0,
            [ERoleTeam.MINION]: 3,
            [ERoleTeam.DEMON]: 1,
        },
        14: {
            [ERoleTeam.TOWNSFOLK]: 9,
            [ERoleTeam.OUTSIDER]: 1,
            [ERoleTeam.MINION]: 3,
            [ERoleTeam.DEMON]: 1,
        },
        15: {
            [ERoleTeam.TOWNSFOLK]: 9,
            [ERoleTeam.OUTSIDER]: 2,
            [ERoleTeam.MINION]: 3,
            [ERoleTeam.DEMON]: 1,
        },
    });
    const TEAM_ORDER: ReadonlyArray<IRoleCoreTeam> = Object.freeze([
        ERoleTeam.TOWNSFOLK,
        ERoleTeam.OUTSIDER,
        ERoleTeam.MINION,
        ERoleTeam.DEMON,
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
