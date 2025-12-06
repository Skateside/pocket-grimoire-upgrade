import type {
    IDemonBluffId,
    IDemonBluffGroup,
    IDemonBluffs,
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
import {
    UnrecognisedBluffGroupError,
} from "../../errors";

const useBluffsStore = defineStore("bluffs", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "bluffs";

    const innerMakeNewGroup = (name = "") => {

        const group: IDemonBluffGroup = {
            name,
            id: randomId("bluffs-"),
            roles: [null, null, null],
        };

        return group;

    };

    const bluffs = ref<IDemonBluffs>([
        ...storage.get<IDemonBluffs>(STORAGE_KEY, [innerMakeNewGroup()]),
    ]);

    watch(bluffs, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

    const innerGetGroup = (groupId: IDemonBluffGroup["id"]) => {

        const group = bluffs.value.find(({ id }) => id === groupId);

        if (!group) {
            throw new UnrecognisedBluffGroupError(String(groupId));
        }

        return group;

    };

    const getGroup = computed(() => innerGetGroup);

    const addGroup = (name = "") => {
        bluffs.value.push(innerMakeNewGroup(name));
    };

    const removeGroup = (groupId: IDemonBluffGroup["id"]) => {

        const index = bluffs.value.findIndex(({ id }) => id === groupId);

        if (index < 0) {
            return false;
        }

        bluffs.value.splice(index, 1);
        return true;

    };

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
        setBluff,
        addGroup,
        removeGroup,
        renameGroup,
    };

});

export default useBluffsStore;
