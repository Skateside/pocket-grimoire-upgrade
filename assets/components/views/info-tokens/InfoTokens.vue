<template>
    <h2>Info Tokens</h2>

    <div v-if="infoTokensStore.official.length">
        <h3>Official Info Tokens</h3>

        <GridLayout>
            <div v-for="infoToken in infoTokensStore.official" :key="infoToken.id">
                <button
                    type="button"
                    class="info-token-trigger"
                    :data-id="infoToken.id"
                >
                    {{ infoToken.text }}
                </button>
            </div>
        </GridLayout>
    </div>

    <div v-if="infoTokensStore.official.length">
        <h3>Custom Info Tokens</h3>

        <GridLayout>
            <div v-for="infoToken in infoTokensStore.custom" :key="infoToken.id">
                <button
                    type="button"
                    class="info-token-trigger"
                    :data-id="infoToken.id"
                >
                    {{ infoToken.text }}
                </button>
            </div>
        </GridLayout>
    </div>
</template>

<script setup lang="ts">
import useInfoTokensStore from '~/scripts/stores/infoTokens';
import GridLayout from '~/components/layouts/GridLayout.vue';

const infoTokensStore = useInfoTokensStore();
</script>

<style lang="scss" scoped>
.info-token-trigger {
    &[data-id="isdemon"],
    &[data-id="minion"] {
        --info-token-colour: red;
    }
    
    &[data-id="notinplay"] {
        --info-token-colour: blue;
    }
    
    &[data-id="nominatetoday"] {
        --info-token-colour: green;
    }
    
    &[data-id="playeris"] {
        --info-token-colour: violet; // purple
    }
    
    &[data-id="votetoday"] {
        --info-token-colour: purple; // dark-purple
    }
    
    &[data-id="useability"],
    &[data-id="makechoice"],
    &[data-id="selectedyou"] {
        --info-token-colour: darkorange;
    }

    &[data-id="youare"] {
        --info-token-colour: orange;
    }

    &[data-id^="info-token-"] { // custom info tokens
        --info-token-colour: grey;
    }
}
</style>
