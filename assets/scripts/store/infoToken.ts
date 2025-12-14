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
    removeAtIndex,
    removeItem,
} from "../utilities/arrays";
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

    const innerSetAsCustom = (infoToken: IInfoToken) => {
        infoToken.isCustom = true;
        return infoToken;
    };

    const infoTokens = ref<IInfoToken[]>([
        ...structuredClone(window.PG.infoTokens).map(innerConvertFromRaw),
        ...storage
            .get<IInfoToken[]>(STORAGE_KEY, [])
            .map(innerConvertFromRaw)
            .map(innerSetAsCustom),
    ]);
    const activeId = ref<IInfoToken["id"] | null>(null);
    const active = computed<IInfoToken | null>(() => {
        if (activeId.value) {
            return innerGetById(activeId.value) ?? null;
        }
        return null;
    });
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
        removeAtIndex(infoTokens.value, getCustomIndex(id));
    };

    const setActive = (id: IInfoToken["id"]) => {

        activeId.value = id;

        return Boolean(innerGetById(id));

    };

    const clearActive = () => {

        clearRoles();
        activeId.value = null;

    };

    const addRole = (id: IRole["id"]) => {

        const { roleIds } = innerGetById(activeId.value || "") || {};

        if (!roleIds) {
            return;
        }

        if (!roleIds.includes(id)) {
            roleIds.push(id);
        }

    };

    const removeRole = (id: IRole["id"]) => {

        const { roleIds } = innerGetById(activeId.value || "") || {};

        if (!roleIds) {
            return;
        }

        removeItem(roleIds, id);

    };

    const clearRoles = () => {

        const infoToken = innerGetById(activeId.value || "");

        if (infoToken) {
            infoToken.roleIds.length = 0;
        }

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
        addRole,
        removeRole,
        clearRoles,
    };

});

export default useInfoTokenStore;
