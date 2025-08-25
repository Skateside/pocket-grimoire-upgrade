<template>
    <article
        ref="dialog"
        class="dialog"
        :class="[{
            'dialog--hide': props.hide,
        }, props.class]"
        :popover="type"
    >
        <section class="dialog__header">
            <component
                :is="`h${props.heading}`"
                v-if="props.title"
                class="dialog__title"
            >
                {{ props.title }}
            </component>
            <div class="dialog__top-actions">
                <button
                    type="button"
                    class="dialog__close"
                    @click="dialog?.hidePopover()"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
        </section>
        <section class="dialog__body">
            <slot />
        </section>
    </article>
</template>

<script setup lang="ts">
import type { IDialogEvents } from './dialog';
import {
    type HTMLAttributes,
    computed,
    onMounted,
    ref,
} from "vue";

const props = withDefaults(defineProps<{
    title?: string,
    heading?: 1 | 2 | 3 | 4 | 5 | 6,
    open?: boolean,
    hide?: boolean,
    manual?: boolean,
    class?: HTMLAttributes["class"],
}>(), {
    heading: 3,
    open: true,
    hide: false,
    manual: false,
});

const emit = defineEmits<IDialogEvents>();

const dialog = ref<HTMLElement | null>(null);

const type = computed(() => (
    props.manual
    ? "manual"
    : "auto"
));

onMounted(() => {

    if (props.open) {
        dialog.value?.showPopover();
    }

    dialog.value?.addEventListener("toggle", ({ newState }) => {

        emit("toggle", newState === "open");

        if (newState === "open") {
            emit("show");
        } else if (newState === "closed") {
            emit("hide");
        }

    });

    // TODO: beforeToggle event.

});
</script>

<style lang="scss" scoped>
.dialog {
    width: min(80vw, 30em);
    max-width: 100%; // NOTE: why?
    max-height: 80vh;
    background-color: #666;

    &::backdrop {
        background-image: radial-gradient(
            circle at center,
            rgb(0 0 0 / 50%) 20%,
            rgb(0 0 0 / 70%) 100%
        );
        backdrop-filter: blur(0.5em);
    }
}

.dialog--hide::backdrop {
    background-color: #000;
}

.dialog__header {
    position: sticky;
    top: 0;
    display: flex;
    flex-flow: row nowrap;
    background-color: #666;
}

.dialog__title {
    margin: 0;
    flex-grow: 1;
}

.dialog__top-actions {
    margin-inline-start: auto;
}
</style>
