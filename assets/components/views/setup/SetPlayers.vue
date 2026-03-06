<template>
    <BaseForm @submit.prevent="handleSubmit">
        <StackLayout>
            <PlayerCount :count="playerCount" />
            <ClusterLayout side="end">
                <BaseLabel label="Player count">
                    <BaseInput
                        v-model="model"
                        name="player-count"
                        type="range"
                        :min="EGameValues.MIN_PLAYERS"
                        :max="EGameValues.MAX_PLAYERS"
                        step="1"
                    />
                </BaseLabel>
                <output :value="model" aria-hidden="true"></output>
            </ClusterLayout>
            <div>
                <button type="submit">Add seats</button>
            </div>
        </StackLayout>
    </BaseForm>
</template>

<script setup lang="ts">
import { EGameValues } from "~/scripts/enums/data";
import {
    computed,
} from "vue";
import useGameStore from "~/scripts/store/game";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import PlayerCount from "./PlayerCount.vue";
import { clamp } from "~/scripts/utilities/numbers";

const model = defineModel<string>({
    default: String(EGameValues.DEFAULT_NEW_GAME),
});
const playerCount = computed(() => {
    return clamp(
        EGameValues.MIN_PLAYERS,
        Number(model.value),
        EGameValues.MAX_NON_TRAVELLER_PLAYERS,
    );
});
const store = useGameStore();

const handleSubmit = () => {
    store.setPlayerCount(Number(model.value));
};
</script>
