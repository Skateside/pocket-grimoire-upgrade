import type {
    IRole,
    IToken,
    ITokenReminder,
    ITokenRole,
    ITokenSeat,
} from "~/types/data";
import { ETokenType } from "~/enums/data";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import {
    createToken,
    filterUpdateData,
    getAngle,
    getCentre,
    getDistance,
    getTokenString,
    isReminder as helperIsReminder,
    isRole as helperIsRole,
    isSeat as helperIsSeat,
    isValidToken,
} from "~/helpers/tokens";
import { removeAtIndex, unique } from "~/utilities/arrays";
import { clone, isNumber, isString } from "~/utilities/objects";
import {
    TokenNotDestroyedError,
    TokenNotSeatError,
    UnrecognisedTokenError,
} from "~/errors";
import useStorage from "~/composables/useStorage";

const useTokensStore = defineStore("tokens", () => {

    const storage = useStorage<IToken[]>("tokens", []);

    const tokens = ref<IToken[]>([
        ...storage
            .getIfValid(Array.isArray)
            .filter(isValidToken)
    ]);

    watch(tokens, (value) => {
        storage.set(value);
    }, { deep: true });

    const clear = () => {
        tokens.value.length = 0;
        storage.reset();
    };

    const byType = computed(() => {
        return Object.groupBy(tokens.value, ({ type }) => type) as {
            [ETokenType.REMINDER]?: ITokenReminder[],
            [ETokenType.ROLE]?: ITokenRole[],
            [ETokenType.SEAT]?: ITokenSeat[],
        };
    });

    const reminders = computed(() => byType.value[ETokenType.REMINDER] || []);
    const roles = computed(() => byType.value[ETokenType.ROLE] || []);
    const seats = computed(() => byType.value[ETokenType.SEAT] || []);

    const nextZ = computed(() => (
        tokens.value.length
        ? Math.max(...tokens.value.map(({ z }) => z || 0))
        : 0
    ) + 1);

    const inPlay = computed(() => tokens.value
        .filter((token) => helperIsSeat(token) || helperIsRole(token))
        .reduce((inPlay, token) => {

            const { roleId } = token;

            if (!roleId) {
                return inPlay;
            }

            if (!Object.hasOwn(inPlay, roleId)) {
                inPlay[roleId] = 0;
            }

            inPlay[roleId] += 1;

            return inPlay;

        }, {} as Record<IRole["id"], number>)
    );

    const alive = computed(() => unique(tokens.value
        .filter(helperIsSeat)
        .filter(({ dead }) => !dead)
        .map(({ roleId }) => roleId)
        .filter((roleId) => typeof roleId === "string"))
    );

    const dead = computed(() => Object.keys(inPlay.value)
        .filter((tokenId) => !alive.value.includes(tokenId))
    );

    const active = computed(() => Object.keys(inPlay.value)
        .filter((tokenId) => alive.value.includes(tokenId))
    );

    const innerGetIndex = (token: IToken) => {
        return tokens.value.indexOf(token);
    };

    const innerGetIndexById = (tokenId: IToken["id"]) => {
        return tokens.value.findIndex(({ id }) => tokenId === id);
    };

    const innerGetById = (tokenId: IToken["id"]): IToken | undefined => {
        return tokens.value[innerGetIndexById(tokenId)];
    };

    const innerGetToken = (tokenOrId: IToken | IToken["id"]) => {

        const token = (
            isString(tokenOrId)
            ? innerGetById(tokenOrId)
            : tokenOrId
        );

        if (!token) {
            throw new UnrecognisedTokenError(getTokenString(tokenOrId));
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

        if (helperIsSeat(token) && isNumber(token.index)) {

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

    const createSeat = (settings: Partial<ITokenSeat> = {}) => {
        return create(settings, ETokenType.SEAT)
    };
    const createReminder = (settings: Partial<ITokenReminder> = {}) => {
        return create(settings, ETokenType.REMINDER)
    };

    const update = <TToken extends IToken = IToken>(
        token: TToken,
        settings: Partial<TToken>,
    ) => {

        const index = innerGetIndex(token);

        if (index < 0) {
            throw new UnrecognisedTokenError(getTokenString(token));
        }

        const updatables = filterUpdateData(settings);

        if (!Object.keys(updatables).length) {

            return console.warn(
                "All properties passed to update() filtered out",
                clone(settings),
            );

        }

        // Update and then re-assign to trigger Vue's reactivity updating.
        Object.assign(token, updatables);
        tokens.value[index] = token;

    };

    const updateById = <TToken extends IToken = IToken>(
        tokenId: TToken["id"],
        settings: Partial<TToken>,
    ) => {

        const token = innerGetToken(tokenId);

        if (!token) {
            throw new UnrecognisedTokenError(getTokenString(tokenId));
        }

        update(token, settings);

    };

    const innerUpdateSeat = (seat: ITokenSeat, settings: Partial<ITokenSeat>) => {

        if (!helperIsSeat(seat)) {
            throw new TokenNotSeatError(getTokenString(seat));
        }

        update(seat, settings);

    };

    const setSeatName = (seat: ITokenSeat, name?: ITokenSeat["name"]) => {
        innerUpdateSeat(seat, { name });
    };

    const setSeatRoleId = (seat: ITokenSeat, roleId?: IRole["id"]) => {
        innerUpdateSeat(seat, { roleId });
    };

    const destroy = (token: IToken) => {

        if (!removeAtIndex(tokens.value, innerGetIndex(token))) {
            throw new TokenNotDestroyedError(getTokenString(token));
        }

    };

    const destroyById = (tokenId: IToken["id"]) => {

        // TODO: maybe re-write this since `destroy()` no londer returns a boolean.

        const token = innerGetById(tokenId);

        return (
            token
            ? destroy(token)
            : false
        );

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
        updateById,
        destroy,
        destroyById,
        setSeatName,
        setSeatRoleId,
    };

});

export default useTokensStore;
