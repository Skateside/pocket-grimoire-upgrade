import type {
    IRole,
    IToken,
    ITokenReminder,
    ITokenRole,
    ITokenSeat,
} from "../types/data";
import type { IStorage } from "../classes/Storage";
import { ETokenType } from "../enums/data";
import { defineStore } from "pinia";
import { computed, inject, ref, watch } from "vue";
import {
    createToken,
    filterUpdateData,
    getAngle,
    getCentre,
    getDistance,
    isReminder as helperIsReminder,
    isRole as helperIsRole,
    isSeat as helperIsSeat,
    isValidToken,
} from "../helpers/tokens";
import { removeAtIndex, unique } from "../utilities/arrays";
import { isNumber } from "../utilities/objects";
import { StorageNotFoundError, UnrecognisedTokenError } from "../../errors";

const useTokensStore = defineStore("tokens", () => {

    const storage = inject<IStorage>("storage");

    if (!storage) {
        throw new StorageNotFoundError("tokens store");
    }

    const STORAGE_KEY = "tokens";
    const tokens = ref<IToken[]>([
        ...storage
            .get<IToken[]>(STORAGE_KEY, Array.isArray, [])
            .filter(isValidToken)
    ]);

    watch(tokens, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

    const clear = () => {
        tokens.value.length = 0;
    };

    const byType = computed(() => {
        return Object.groupBy(tokens.value, ({ type }) => type) as {
            [ETokenType.SEAT]?: ITokenSeat[],
            [ETokenType.ROLE]?: ITokenRole[],
            [ETokenType.REMINDER]?: ITokenReminder[],
        };
    });

    const seats = computed(() => byType.value[ETokenType.SEAT] || []);
    const roles = computed(() => byType.value[ETokenType.ROLE] || []);
    const reminders = computed(() => byType.value[ETokenType.REMINDER] || []);

    const nextZ = computed(() => (
        tokens.value.length
        ? Math.max(...tokens.value.map(({ z }) => z || 0))
        : 0
    ) + 1);

    const inPlay = computed(() => tokens.value
        .filter((token) => helperIsSeat(token) || helperIsRole(token))
        .reduce((inPlay, token) => {

            const { role } = token;

            if (!role) {
                return inPlay;
            }

            if (!Object.hasOwn(inPlay, role)) {
                inPlay[role] = 0;
            }

            inPlay[role] += 1;

            return inPlay;

        }, {} as Record<IRole["id"], number>)
    );

    const alive = computed(() => unique(tokens.value
        .filter(helperIsSeat)
        .filter(({ dead }) => !dead)
        .map((token) => token.role)
        .filter((id) => typeof id === "string"))
    );

    const dead = computed(() => Object.keys(inPlay.value)
        .filter((id) => !alive.value.includes(id))
    );

    const active = computed(() => Object.keys(inPlay.value)
        .filter((id) => alive.value.includes(id))
    );

    const innerGetIndexById = (id: IToken["id"]) => {
        return tokens.value.findIndex(({ id: tokenId }) => tokenId === id);
    };

    const innerGetById = (id: IToken["id"]): IToken | undefined => {
        return tokens.value[innerGetIndexById(id)];
    };

    const innerGetToken = (tokenOrId: IToken | IToken["id"]) => {

        const token = (
            typeof tokenOrId === "string"
            ? innerGetById(tokenOrId)
            : tokenOrId
        );

        if (!token) {

            const id = (
                typeof tokenOrId === "string"
                ? tokenOrId
                : `{ id: "${tokenOrId.id}" }`
            );

            throw new UnrecognisedTokenError(id);

        }

        return token;

    };

    const getById = computed(() => innerGetById);
    const isSeat = computed(() => (tokenOrId: IToken | IToken["id"]) => (
        helperIsSeat(innerGetToken(tokenOrId))
    ));
    const isReminder = computed(() => (tokenOrId: IToken | IToken["id"]) => (
        helperIsReminder(innerGetToken(tokenOrId))
    ));
    const isRole = computed(() => (tokenOrId: IToken | IToken["id"]) => (
        helperIsRole(innerGetToken(tokenOrId))
    ));

    const create = (
        settings: Partial<IToken> = {},
        type: IToken["type"] = ETokenType.SEAT,
    ) => {

        const token = createToken(settings, type);

        if (type === ETokenType.SEAT && isNumber(token.index)) {

            const index = Math.max(
                ...tokens.value
                    .filter(helperIsSeat)
                    .map((token) => token.index || 0)
            );

            token.index = (
                isNumber(index)
                ? index + 1
                : 1
            );

        }

        tokens.value.push(token);
        
        return token;

    };

    const createSeat = (settings: Partial<ITokenSeat> = {}) => (
        create(settings, ETokenType.SEAT)
    );
    const createReminder = (settings: Partial<ITokenReminder> = {}) => (
        create(settings, ETokenType.REMINDER)
    );

    const update = <TToken extends IToken = IToken>(
        id: IToken["id"],
        settings: Partial<TToken>,
    ) => {

        const index = innerGetIndexById(id);
        const token = tokens.value[index];

        if (!token) {
            return false;
        }

        const updatables = filterUpdateData(settings);

        if (Object.keys(updatables).length) {

            // Update and then re-assign to trigger Vue's reactivity updating.
            Object.assign(token, updatables);
            tokens.value[index] = token;

            // Only return true if we actually updated something.
            return true;

        }

        return false;

    };

    const destroy = (id: IToken["id"]) => {
        return removeAtIndex(tokens.value, innerGetIndexById(id));
    };

    const getSortedSeats = computed(() => () => {

        const centre = getCentre(seats.value);

        return seats.value.map((seat) => ({
            id: seat.id,
            angle: getAngle(seat, centre),
            distance: getDistance(seat, centre),
        })).sort((seatA, seatB) => (
            (seatA.angle - seatB.angle) || (seatA.distance - seatB.distance)
        )).map(({ id }) => id);

    });

    return {
        // State.
        tokens,
        // Getters.
        active,
        alive,
        byType,
        dead,
        getById,
        getSortedSeats,
        inPlay,
        isSeat,
        isReminder,
        isRole,
        nextZ,
        reminders,
        roles,
        seats,
        // Actions.
        clear,
        create,
        createSeat,
        createReminder,
        update,
        destroy,
    };

});

export default useTokensStore;
