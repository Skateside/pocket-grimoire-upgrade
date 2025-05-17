import type {
    ISeat,
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

const useSeatStore = defineStore("seat", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "seats";
    const seats = ref<ISeat[]>([
        ...storage.get<ISeat[]>(STORAGE_KEY, [])
    ]);

    watch(seats, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

    const getById = computed(() => (id: ISeat["id"]) => {
        return seats.value.find(({ id: sId }) => sId === id);
    });

    const create = () => {

        const seat: ISeat = {
            x: 0,
            y: 0,
            z: 0,
            id: randomId("seat-"),
        };

        seats.value.push(seat);
        
        return seat;

    };

    return {
        // State.
        seats,
        // Getters.
        getById,
        // Actions.
        create,
    };

});

export default useSeatStore;
