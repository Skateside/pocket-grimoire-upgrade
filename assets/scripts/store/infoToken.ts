import type {
    IInfoToken,
} from "../types/data";
import type {
    IStorage,
} from "../classes/Storage";
import {
    defineStore,
} from "pinia"
import {
    computed,
    inject,
    ref,
    watch,
} from "vue";
import {
    randomId,
} from "../utilities/strings";
import {
    CannotChangeOfficialIntoTokenError,
    UnrecognisedInfoTokenError,
} from "../../errors";

const useInfoTokenStore = defineStore("info-token", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "info-tokens";
    const infoTokens = ref<IInfoToken[]>([
        ...structuredClone(window.PG.infoTokens),
        ...storage.get<IInfoToken[]>(STORAGE_KEY, []),
    ]);

    watch(infoTokens, (value) => {
        storage.set(STORAGE_KEY, value.filter(({ isCustom }) => isCustom));
    }, { deep: true });

    const getById = computed(() => (id: IInfoToken["id"]) => {
        return infoTokens.value.find(({ id: itId }) => itId === id);
    });

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

    const add = (text: IInfoToken["text"]) => {

        const infoToken: IInfoToken = {
            id: randomId("cit-"),
            text,
            colour: "grey",
            isCustom: true,
        };

        infoTokens.value.push(infoToken);

    };

    const update = (id: IInfoToken["id"], text: IInfoToken["text"]) => {

        const index = getCustomIndex(id);

        infoTokens.value[index] = {
            ...infoTokens.value[index],
            text,
        };

    };

    const remove = (id: IInfoToken["id"]) => {

        const index = getCustomIndex(id);

        infoTokens.value.splice(index, 1);

    };

    return {
        // State.
        infoTokens,
        // Getters.
        getById,
        byType,
        // Actions.
        add,
        update,
        remove,
    };

});

export default useInfoTokenStore;
