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
import { isNumber, isString } from "../utilities/objects";
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

        const isTokenId = isString(tokenOrId);
        const token = (
            isTokenId
            ? innerGetById(tokenOrId)
            : tokenOrId
        );

        if (!token) {

            const id = (
                isTokenId
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

    const updateById = <TToken extends IToken = IToken>(
        tokenId: TToken["id"],
        settings: Partial<TToken>,
    ) => {

        const token = innerGetToken(tokenId);

        if (!token) {
            return false;
        }

        return update(token, settings);

    };

    const setSeatName = (seat: ITokenSeat, name?: ITokenSeat["name"]) => {

        return helperIsSeat(seat) && update(seat, {
            name,
        });

    };

    const setSeatRoleId = (seat: ITokenSeat, roleId?: IRole["id"]) => {

        return helperIsSeat(seat) && update(seat, {
            roleId,
        });

    };

    const destroy = (token: IToken) => {
        return removeAtIndex(tokens.value, innerGetIndex(token));
    };

    const destroyById = (tokenId: IToken["id"]) => {

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
