<template>
    <StackLayout>
        <PlayerCount :count="playerCount" />
        <BaseLabel label="Player count">
            <BaseInput
                v-model="model"
                name="player-count"
                type="range"
                :min="EGameValues.MIN_PLAYERS"
                :max="EGameValues.MAX_PLAYERS"
                step="1"
                @input="handleInput"
            />
            <BaseOutput :value="model" />
        </BaseLabel>
    </StackLayout>
</template>

<script setup lang="ts">
import { EGameValues } from "~/enums/data";
import { computed, ref } from "vue";
import StackLayout from "~/layouts/StackLayout.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseOutput from "~/components/base/BaseOutput.vue";
import PlayerCount from "./PlayerCount.vue";
import { clamp } from "~/utilities/numbers";

const props = defineProps<{
    modelValue: string,
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const model = ref(props.modelValue);
const playerCount = computed(() => {
    return clamp(
        EGameValues.MIN_PLAYERS,
        Number(model.value),
        EGameValues.MAX_NON_TRAVELLER_PLAYERS,
    );
});

const handleInput = ({ target }: Event) => {
    emit("update:modelValue", (target as HTMLInputElement).value);
};
</script>
