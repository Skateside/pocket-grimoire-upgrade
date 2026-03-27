<template>
    <dialog
        ref="modal"
        class="modal"
        :popover="props.cover ? 'manual' : 'auto'"
        @toggle="handleToggle"
        @click="handleClick"
        tabindex="-1"
    >
        <BoxLayout class="modal__contents">
            <slot v-if="!props.noHeading" name="header">
                <SidebarLayout side="end">
                    <h3>{{ props.title }}</h3>
                    <div>
                        <button
                            class="no-button"
                            type="button"
                            aria-label="close"
                            @click="hide"
                        >
                            &times;
                        </button>
                    </div>
                </SidebarLayout>
            </slot>
            <slot />
        </BoxLayout>
    </dialog>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import BoxLayout from "../layouts/BoxLayout.vue";
import SidebarLayout from "../layouts/SidebarLayout.vue";

const props = defineProps<{
    cover?: boolean,
    show?: boolean,
    title?: string,
    noHeading?: boolean,
}>();
const modal = useTemplateRef("modal");
const isShowing = ref(props.show ?? false);

const handleToggle = ({ newState }: ToggleEvent) => {

    isShowing.value = newState === "open";

    if (isShowing.value) {
        modal.value?.focus();
    }

};

const handleClick = ({ target }: MouseEvent) => {

    if (target === modal.value && !props.cover) {
        hide();
    }

};

const show = () => {

    if (isShowing.value || !modal.value) {
        return;
    }

    modal.value.showModal();

};

const hide = () => {

    if (!isShowing.value || !modal.value) {
        return;
    }

    modal.value.close();

};

defineExpose({ show, hide });
</script>

<style lang="scss" scoped>
.modal {
    border: none;
    padding: 0;

    &::backdrop {
        background-color: #0006;
    }

    &[popover="manual"]::backdrop {
        background-color: #000;
    }
}

.modal__contents {
    --l-box-border-width: 2px;
    --l-box-border-colour: #000;
    --l-box-padding: 1em;
}
</style>
