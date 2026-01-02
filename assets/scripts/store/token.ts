import type {
    IRole,
    IToken,
    ITokenSeat,
    ITokenRole,
    ITokenReminder,
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
    removeAtIndex,
    unique,
} from "../utilities/arrays";
import {
    randomId,
} from "../utilities/strings";
import {
    UnrecognisedTokenError,
} from "../../errors";

const useTokenStore = defineStore("token", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "tokens";
    const tokens = ref<IToken[]>([
        ...storage.get<IToken[]>(STORAGE_KEY, [])
    ]);

    watch(tokens, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

    const clear = () => {
        tokens.value.length = 0;
    };

    const byType = computed(() => {
        return Object.groupBy(tokens.value, ({ type }) => type) as {
            seat?: ITokenSeat[],
            role?: ITokenRole[],
            reminder?: ITokenReminder[],
        };
    });

    const nextZ = computed(() => (
        tokens.value.length
        ? Math.max(...tokens.value.map(({ z }) => z || 0))
        : 0
    ) + 1);

    const inPlay = computed(() => tokens.value
        .filter((token) => innerIsSeat(token) || innerIsRole(token))
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
        .filter(innerIsSeat)
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
    const innerIsSeat = (token: IToken): token is ITokenSeat => (
        token.type === "seat"
    );
    const innerIsReminder = (token: IToken): token is ITokenReminder => (
        token.type === "reminder"
    );
    const innerIsRole = (token: IToken): token is ITokenRole => (
        token.type === "role"
    );

    const getById = computed(() => innerGetById);
    const isSeat = computed(() => (tokenOrId: IToken | IToken["id"]) => (
        innerIsSeat(innerGetToken(tokenOrId))
    ));
    const isReminder = computed(() => (tokenOrId: IToken | IToken["id"]) => (
        innerIsReminder(innerGetToken(tokenOrId))
    ));
    const isRole = computed(() => (tokenOrId: IToken | IToken["id"]) => (
        innerIsRole(innerGetToken(tokenOrId))
    ));

    const create = (settings: Partial<IToken> = {}, type: IToken["type"] = "seat") => {

        const token: IToken = Object.assign({
            type,
            x: 0,
            y: 0,
            z: 0,
            id: "",
        }, settings);

        if (!token.id) {
            token.id = randomId("token-");
        }

        if (innerIsSeat(token) && !token.index) {

            const index = Math.max(
                ...tokens.value
                    .filter(innerIsSeat)
                    .map((token) => token.index || 0)
            );

            token.index = (
                Number.isFinite(index)
                ? index + 1
                : 1
            );

        }

        tokens.value.push(token);
        
        return token;

    };

    const createSeat = (settings: Partial<ITokenSeat> = {}) => (
        create(settings, "seat")
    );
    const createReminder = (settings: Partial<ITokenReminder> = {}) => (
        create(settings, "reminder")
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

        const updatables = window.structuredClone(settings);
        // Don't let the ID be changed - we rely on it.
        delete updatables.id;
        // Don't let the type be changed - things might get weird.
        delete updatables.type;

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

    return {
        // State.
        // * = Getter, not State. TODO: make sure this hasn't created any bugs.
        tokens,
        byType, // *
        inPlay, // *
        alive, // *
        dead, // *
        active, // *
        // Getters.
        getById,
        isSeat,
        isReminder,
        isRole,
        nextZ,
        // Actions.
        clear,
        create,
        createSeat,
        createReminder,
        update,
        destroy,
    };

});

export default useTokenStore;
