<template>
    <form>
        <p>
            <label :for="`start-${suffix}`">Starting player</label>
            <select name="start" :id="`start-${suffix}`">
                <option v-for="seat in sorted" :key="seat.id" :value="seat.id">
                    {{ seat.name ?? seat.index ?? seat.id }}
                </option>
            </select>
        </p>

        <fieldset>
            <legend>Direction</legend>
            <ul>
                <li>
                    <label :for="`direction-clockwise-${suffix}`">
                        Clockwise
                        <input
                            v-model="direction"
                            type="radio"
                            name="direction"
                            :id="`direction-clockwise-${suffix}`"
                            :value="ETokenDirection.Clockwise"
                        >
                    </label>
                </li>
                <li>
                    <label :for="`direction-anticlockwise-${suffix}`">
                        Anti-clockwise
                        <input
                            v-model="direction"
                            type="radio"
                            name="direction"
                            :id="`direction-anticlockwise-${suffix}`"
                            :value="ETokenDirection.Anticlockwise"
                        >
                    </label>
                </li>
            </ul>
        </fieldset>
    </form>
</template>

<script setup lang="ts">
import { ETokenDirection, type ITokenSeat } from "../scripts/types/data";
import { onMounted, ref, useId } from "vue";
import useTokenStore from "../scripts/store/token";

const suffix = useId();
const store = useTokenStore();
const sorted = ref<ITokenSeat[]>([]);
const direction = defineModel<ETokenDirection>({ default: ETokenDirection.Clockwise })

onMounted(() => {

    sorted.value = store
        .getSortedSeats()
        .map((id) => store.getById(id))
        .filter(Boolean) as ITokenSeat[];

});
</script>
