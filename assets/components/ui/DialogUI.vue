<template>
    <article
        ref="dialog"
        class="dialog"
        :class="{
            'dialog--hide': props.hide,
        }"
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
import type { IDialogUIEvents } from "./dialog";
import {
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
}>(), {
    heading: 3,
    open: true,
    hide: false,
    manual: false,
});

const emit = defineEmits<IDialogUIEvents>();

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
