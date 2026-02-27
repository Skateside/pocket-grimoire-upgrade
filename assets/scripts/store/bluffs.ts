import type {
    IDemonBluffId,
    IDemonBluffGroup,
    IDemonBluffs,
} from "../types/data";
import type { IStorage } from "../classes/Storage";
import { defineStore } from "pinia";
import { computed, inject, ref, watch } from "vue";
import { isValidBluffGroup, makeNewGroup } from "../helpers/bluffs";
import { removeAtIndex } from "../utilities/arrays";
import { UnrecognisedBluffGroupError } from "../../errors";

const useBluffsStore = defineStore("bluffs", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "bluffs";

    const bluffs = ref<IDemonBluffs>([
        ...storage.get<IDemonBluffs>(
            STORAGE_KEY,
            (raw) => Array.isArray(raw) && raw.every(isValidBluffGroup),
            [makeNewGroup()]
        ),
    ]);

    watch(bluffs, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

    const clear = () => {

        bluffs.value.length = 0;
        bluffs.value.push(makeNewGroup());

    };

    const innerGetGroup = (groupId: IDemonBluffGroup["id"]) => {

        const group = bluffs.value.find(({ id }) => id === groupId);

        if (!group) {
            throw new UnrecognisedBluffGroupError(String(groupId));
        }

        return group;

    };

    const getGroup = computed(() => innerGetGroup);

    const addGroup = (name = "") => {
        bluffs.value.push(makeNewGroup(name));
    };

    const removeGroup = (groupId: IDemonBluffGroup["id"]) => removeAtIndex(
        bluffs.value,
        bluffs.value.findIndex(({ id }) => id === groupId),
    );

    const renameGroup = (groupId: IDemonBluffGroup["id"], name: string) => {
        innerGetGroup(groupId).name = name;
    };

    const setBluff = (
        groupId: IDemonBluffGroup["id"],
        index: 0 | 1 | 2,
        role: IDemonBluffId,
    ) => {
        innerGetGroup(groupId).roles[index] = role;
    };

    return {
        // State.
        bluffs,
        // Getters.
        getGroup,
        // Actions.
        clear,
        setBluff,
        addGroup,
        removeGroup,
        renameGroup,
    };

});

export default useBluffsStore;
