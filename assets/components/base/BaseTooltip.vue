<template>
    <div class="tooltip">
        <button type="button" :popovertarget="id" class="no-button tooltip__trigger">
            <slot v-if="slots.trigger" name="trigger"></slot>
            <template v-else>{{ props.trigger }}</template>
        </button>
        <div :id="id" class="tooltip__content" popover>
            <slot v-if="slots.content" name="content"></slot>
            <BoxLayout v-else class="tooltip__box">
                {{ content }}
            </BoxLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, useId, useSlots } from "vue";
import BoxLayout from "~/layouts/BoxLayout.vue";

const props = withDefaults(defineProps<{
    content?: string,
    trigger?: string,
}>(), {
    content: "(content property or slot missing)",
    trigger: "More info",
});

const id = ref(`tooltip-${useId()}`);
const slots = useSlots();
</script>

<style lang="scss" scoped>
.tooltip {
    anchor-scope: --tooltip;
}

.tooltip__trigger {
    anchor-name: --tooltip;
    cursor: help;
    width: fit-content;
}

.tooltip__content {
    border: none;
    background-color: transparent;
    padding: 0;
    margin: 0;
    position-anchor: --tooltip;
    // https://nerdy.dev/why-isnt-my-position-try-fallback-working-in-small-spaces
    position-area: inline-end;
    position-try-fallbacks: flip-block, flip-inline;
}

.tooltip__box {
    // TODO: get these from variables rather than magic properties.
    --l-box-border-colour: currentColor;
    --l-box-background-colour: #fff;
    --l-box-padding: 0.5rem;
    --l-box-border-width: 0.15rem;
    margin: 0.25rem;
    max-width: 50ch;
    min-width: 30ch;
}
</style>
