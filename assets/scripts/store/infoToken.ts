import type {
    IInfoToken,
    IInfoTokenRaw,
    IRole,
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
    strip,
    toHTML,
} from "../utilities/markdown";
import {
    randomId,
    removeMarkup,
} from "../utilities/strings";
import {
    CannotChangeOfficialIntoTokenError,
    UnrecognisedInfoTokenError,
} from "../../errors";

const useInfoTokenStore = defineStore("info-token", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "info-tokens";

    const innerConvertFromRaw = (raw: IInfoToken | IInfoTokenRaw) => {

        const infoToken = Object.assign({}, raw) as IInfoToken;

        infoToken.text = strip(raw.markdown);
        infoToken.markup = toHTML(removeMarkup(raw.markdown));
        infoToken.isCustom = Boolean(raw.isCustom);
        infoToken.roleIds = (raw as IInfoToken).roleIds ?? [];

        return infoToken;

    };

    const innerReduceToRaw = (infoToken: IInfoToken) => {

        const raw: IInfoTokenRaw = {
            id: infoToken.id,
            markdown: infoToken.markdown,
            colour: infoToken.colour,
        };

        return raw;

    };

    const infoTokens = ref<IInfoToken[]>([
        ...structuredClone(window.PG.infoTokens).map(innerConvertFromRaw),
        ...storage
            .get<IInfoToken[]>(STORAGE_KEY, [])
            .map(innerConvertFromRaw),
    ]);
    const active = ref<IInfoToken | null>(null);
    const official = computed(() => {
        return infoTokens.value.filter(({ isCustom }) => !isCustom);
    });
    const custom = computed(() => {
        return infoTokens.value.filter(({ isCustom }) => isCustom);
    });

    watch(infoTokens, (value) => {

        storage.set(
            STORAGE_KEY,
            value
                .filter(({ isCustom }) => isCustom)
                .map(innerReduceToRaw),
        );

    }, { deep: true });

    const clear = () => {
        infoTokens.value = infoTokens.value.filter(({ isCustom }) => !isCustom);
    };

    const innerGetById = (id: IInfoToken["id"]) => {
        return infoTokens.value.find(({ id: infoTokenId }) => infoTokenId === id);
    };

    const getById = computed(() => innerGetById);

    const byType = computed(() => {
        return Object.groupBy(infoTokens.value, ({ isCustom }) => (
            isCustom
            ? "custom"
            : "official"
        ));
    });

    const getIndexOrDie = (id: IInfoToken["id"]) => {

        const index = infoTokens.value.findIndex(({ id: infoTokenId }) => {
            return infoTokenId === id;
        });

        if (index < 0) {
            throw new UnrecognisedInfoTokenError(id);
        }

        return index;

    }

    const getCustomIndex = (id: IInfoToken["id"]) => {

        const index = getIndexOrDie(id);
        const infoToken = infoTokens.value[index];

        if (!infoToken.isCustom) {
            throw new CannotChangeOfficialIntoTokenError(id);
        }

        return index;

    };

    const addInfoToken = (markdown: IInfoTokenRaw["markdown"]) => {

        const infoToken: IInfoToken = innerConvertFromRaw({
            id: randomId("info-token-"),
            markdown,
            colour: "grey",
            isCustom: true,
        });

        infoTokens.value.push(infoToken);

    };

    const updateInfoToken = (
        id: IInfoToken["id"],
        markdown: IInfoTokenRaw["markdown"],
    ) => {

        const index = getCustomIndex(id);

        infoTokens.value[index] = innerConvertFromRaw({
            ...infoTokens.value[index],
            markdown,
        });

    };

    const removeInfoToken = (id: IInfoToken["id"]) => {

        const index = getCustomIndex(id);

        infoTokens.value.splice(index, 1);

    };

    const setActive = (id: IInfoToken["id"]) => {

        active.value = innerGetById(id) ?? null;

        return active.value !== null;

    };

    const clearActive = () => {

        clearRoles();
        active.value = null;

    };

    const deleteActive = () => {

        if (!active.value) {
            return;
        }

        removeInfoToken(active.value.id);
        clearActive();

    };

    const updateActive = (markdown: IInfoToken["markdown"]) => {

        if (!active.value) {
            return;
        }

        updateInfoToken(active.value.id, markdown);

    };

    const addRole = (id: IRole["id"]) => {

        const { roleIds } = active.value || {};

        if (!roleIds) {
            return;
        }

        if (!roleIds.includes(id)) {
            roleIds.push(id);
        }

    };

    const removeRole = (id: IRole["id"]) => {

        const { roleIds } = active.value || {};

        if (!roleIds) {
            return;
        }

        const index = roleIds.indexOf(id);

        if (index > -1) {
            roleIds.splice(index, 1);
        }

    };

    const clearRoles = () => {

        if (!active.value) {
            return;
        }

        active.value.roleIds.length = 0;

    };

    return {
        // State.
        active,
        custom,
        infoTokens,
        official,
        // Getters.
        getById,
        byType,
        // Actions.
        clear,
        addInfoToken,
        updateInfoToken,
        removeInfoToken,
        setActive,
        clearActive,
        deleteActive,
        updateActive,
        addRole,
        removeRole,
        clearRoles,
    };

});

export default useInfoTokenStore;
