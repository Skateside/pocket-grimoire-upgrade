import type { IGameBreakdown, IGameCounts } from "~/types/data";
import { EGameValues, ERoleTeam } from "~/enums/data";
import { ORDER } from "./roles";
import { clamp } from "~/utilities/numbers";
import { deepFreeze } from "~/utilities/objects";

/**
 * The breakdown of the team numbers for each player count.
 */
export const BREAKDOWN = deepFreeze<IGameCounts>({
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

/**
 * Clamps the given player count such that it is a valid number of players.
 * 
 * @param playerCount Player count to clamp.
 * @param includeTravellers Whether or not to clamp the number of players to
 * include travellers - defaults to `false`.
 * @returns Clamped player count.
 */
export function clampPlayerCount(
    playerCount: number,
    includeTravellers = false,
) {
    return clamp(
        EGameValues.MIN_PLAYERS,
        Math.trunc(playerCount),
        (
            includeTravellers
            ? EGameValues.MAX_PLAYERS
            : EGameValues.MAX_NON_TRAVELLER_PLAYERS
        )
    );
}

/**
 * Gets the team breakdown for the given player count.
 *
 * @param playerCount Number of players.
 * @returns Team breakdown for the given number of players.
 */
export function getBreakdown(playerCount: number): IGameBreakdown {
    return BREAKDOWN[clampPlayerCount(playerCount)];
}

/**
 * Gets the count for the given team at the given player count. If the team is
 * not limited, `"X"` is returned.
 *
 * @param team Team whose count should be retrieved.
 * @param playerCount Player count.
 * @returns Either the count (as a string) or `"X"` for a non-limited team.
 */
export function getTeamCount(team: ERoleTeam, playerCount: number) {
    if (!isLimitedTeam(team)) {
        return "X";
    }

    return String(getBreakdown(playerCount)[team]);
}

/**
 * Checks to see if the given team is a team that would typically have a limited
 * number, i.e., Townsfolk, Outsiders, Minions, or Demons.
 *
 * @param team Team to check.
 * @returns Whether or not the team is typically limited.
 */
export function isLimitedTeam(
    team: ERoleTeam,
): team is keyof IGameCounts[number] {
    return [
        ERoleTeam.TOWNSFOLK,
        ERoleTeam.OUTSIDER,
        ERoleTeam.MINION,
        ERoleTeam.DEMON,
    ].includes(team);
};

/**
 * Gets {@link BREAKDOWN} but the order is guaranteed.
 *
 * @returns Sorted brackdown.
 * @private
 */
const getSortedCounts = () => {
    return Object.keys(BREAKDOWN).map(Number).sort((a, b) => a - b);
};

/**
 * Gets an map of the player counts to the text that gets displayed on the
 * table. This usually just means that it's the number itself, but for `15`, we
 * change it to `"15+"`.
 *
 * @returns Player counts for table headings.
 * @private
 */
const getPlayerCounts = () => {

    const playerCounts = new Map<number, string>();

    getSortedCounts().forEach((count) => {

        playerCounts.set(
            count,
            (
                count === EGameValues.MAX_NON_TRAVELLER_PLAYERS
                ? `${count}+`
                : String(count)
            ),
        );

    });

    return playerCounts;

};

/**
 * Gets the breakdowns for the teams for each player count.
 *
 * @returns Team and breakdown data for each player count.
 * @private
 */
const getTeamBreakdown = () => {

    const teams: {
        team: keyof IGameCounts[number],
        data: { count: number, number: number }[]
    }[] = [];
    const counts = getSortedCounts();

    ORDER.forEach((team) => {

        if (!isLimitedTeam(team)) {
            return; // We only care about teams with count limits.
        }

        teams.push({
            team,
            data: counts.map((count) => ({
                count,
                number: BREAKDOWN[count][team],
            }))
        });

    });

    return teams;

};

/**
 * Gets the data for the team breakdown table.
 *
 * @returns Table data.
 */
export function getTableData() {
    return {
        players: getPlayerCounts(),
        teams: getTeamBreakdown(),
    };
}
