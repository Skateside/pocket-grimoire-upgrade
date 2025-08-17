import type {
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
    randomId,
} from "../utilities/strings";

const useTokenStore = defineStore("token", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "tokens";
    const tokens = ref<IToken[]>([
        ...storage.get<IToken[]>(STORAGE_KEY, [])
    ]);

    watch(tokens, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

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

    const innerGetIndexById = (id: IToken["id"]) => {
        return tokens.value.findIndex(({ id: tokenId }) => tokenId === id);
    };

    const innerGetById = (id: IToken["id"]) => {
        return tokens.value.find(({ id: tokenId }) => tokenId === id);
    };

    const getById = computed(() => innerGetById);

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

        tokens.value.push(token);
        
        return token;

    };

    const createSeat = (settings: Partial<IToken> = {}) => create(settings, "seat");
    const createReminder = (settings: Partial<IToken> = {}) => create(settings, "reminder");

    const update = <TToken extends IToken = IToken>(id: IToken["id"], settings: Partial<TToken>) => {

        const token = innerGetById(id);

        if (!token) {
            return false;
        }

        const updatables = window.structuredClone(settings);
        // Don't let the ID be changed - we rely on it.
        delete updatables.id;
        // Don't let the type be changed - things might get weird.
        delete updatables.type;

        Object.assign(token, updatables);

        return true;

    };

    const destroy = (id: IToken["id"]) => {

        const index = innerGetIndexById(id);

        if (index < 0) {
            return false;
        }

        tokens.value.splice(index, 1);

        return true;

    };

    return {
        // State.
        tokens,
        byType,
        getById,
        // Getters.
        nextZ,
        // Actions.
        create,
        createSeat,
        createReminder,
        update,
        destroy,
    };

});

export default useTokenStore;
