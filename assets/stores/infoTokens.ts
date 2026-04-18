import type { IInfoToken, IInfoTokenRaw } from "~/types/data";
import {
    convertFromRaw,
    create as helperCreate,
    isCustom,
    isNotCustom,
    reduceToRaw,
    setAsCustom,
} from "~/helpers/infoTokens";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { removeItem } from "~/utilities/arrays";
import useStorage from "~/composables/useStorage";

const useInfoTokensStore = defineStore("info-tokens", () => {

    const storage = useStorage<IInfoTokenRaw[]>("info-tokens", []);

    const infoTokens = ref<IInfoToken[]>([]);

    if (Array.isArray(window.PG?.infoTokens)) {

        window.PG.infoTokens
            .map(convertFromRaw)
            .filter((result) => result !== null)
            .forEach((infoToken) => infoTokens.value.push(infoToken));

    }

    storage
        .getIfValid(Array.isArray)
        .map(convertFromRaw)
        .filter((result) => result !== null)
        .map(setAsCustom)
        .forEach((infoToken) => infoTokens.value.push(infoToken));

    watch(infoTokens, (value) => {

        const raw = value
            .filter(({ isCustom }) => isCustom)
            .map(reduceToRaw);

        storage.set(raw);

    }, { deep: true });

    const clear = () => {
        infoTokens.value = infoTokens.value.filter(({ isCustom }) => !isCustom);
    };

    const official = computed(() => {
        return infoTokens.value.filter(isNotCustom);
    });
    const custom = computed(() => {
        return infoTokens.value.filter(isCustom);
    });

    const create = (text: IInfoTokenRaw["text"]) => {

        const token = helperCreate(text);

        infoTokens.value.push(token);

        return token;

    };

    const innerGetById = (infoTokenId: IInfoTokenRaw["id"]) => {

        return infoTokens.value.find(({ id }) => {
            return infoTokenId === id;
        });

    };

    const innerGetCustomById = (infoTokenId: IInfoTokenRaw["id"]) => {

        const infoToken = innerGetById(infoTokenId);

        if (!infoToken?.isCustom) {
            return undefined;
        }

        return infoToken;

    };

    const innerProcessById = (
        infoTokenId: IInfoToken["id"],
        process: (infoToken: IInfoToken) => any,
        isCustom = false,
    ) => {

        const infoToken = (
            isCustom
            ? innerGetCustomById(infoTokenId)
            : innerGetById(infoTokenId)
        );

        if (!infoToken) {
            return false;
        }

        return process(infoToken) !== false;

    };

    const updateText = (
        infoTokenId: IInfoTokenRaw["id"],
        text: IInfoTokenRaw["text"],
    ) => {

        return innerProcessById(
            infoTokenId,
            (infoToken) => infoToken.text = text,
            true,
        );

    };

    const deleteInfoToken = (infoTokenId: IInfoTokenRaw["id"]) => {

        return innerProcessById(
            infoTokenId,
            (infoToken) => removeItem(infoTokens.value, infoToken),
            true,
        );

    };

    const addRole = (
        infoTokenId: IInfoToken["id"],
        roleId: IInfoToken["roleIds"][number],
    ) => {

        return innerProcessById(
            infoTokenId,
            (infoToken) => {
                if (infoToken.roleIds.includes(roleId)) {
                    return false;
                }
                infoToken.roleIds.push(roleId);
            },
        );

    };

    const clearRoles = (infoTokenId: IInfoToken["id"]) => {

        return innerProcessById(
            infoTokenId,
            (infoToken) => infoToken.roleIds.length = 0,
        );

    };

    return {
        // State.
        infoTokens,
        // Getters.
        custom,
        official,
        // Actions.
        clear,
        create,
        updateText,
        delete: deleteInfoToken,
        addRole,
        clearRoles,
    };

});

export default useInfoTokensStore;
