<template>
    <dialog
        ref="dialog"
        class="dialog"
        :class="[
            {
                'dialog--hide': props.hide,
            },
            dialogClasses,
        ]"
        @close="handleClose"
        @click="({ target }) => checkClose(target)"
    >
        <form
            v-if="visible"
            method="dialog"
            class="dialog__content"
            :class="props.classes"
        >
            <slot />
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const visible = ref(false);
const dialog = ref<HTMLDialogElement | null>();

const props = defineProps<{
    classes?: any,
    dialogClasses?: any,
    closeOn?: {
        backdrop?: boolean,
        click?: boolean,
    },
    hide?: boolean,
}>();

const emit = defineEmits<{
    (e: "show"): void,
    (e: "hide"): void,
    (e: "toggle", visible: boolean): void,
}>();

const show = () => {
    dialog.value?.showModal();
    visible.value = true;
    emit("show");
};

const close = (returnValue?: string) => {
    dialog.value?.close(returnValue);
};

defineExpose({
    visible,
    show,
    close,
});

const handleClose = () => {

    visible.value = false;
    emit("hide");

};

const checkClose = (target: EventTarget | null) => {

    const { click, backdrop } = props.closeOn || {};

    if (click) {
        return close();
    }

    if (
        backdrop
        && !dialog.value?.firstElementChild?.contains(target as Node | null)
    ) {
        return close();
    }

    if ((target as HTMLElement | null)?.closest("[data-dialog=\"close\"]")) {
        return close();
    }

};

watch(visible, (value) => emit("toggle", value));
</script>

<style lang="scss">
.dialog {
    background-color: transparent;
    border: none;
    margin: auto;
    padding: 0;
}

.dialog::backdrop {
    background-image: radial-gradient(circle at center, rgb(0 0 0 / 50%) 20%, rgb(0 0 0 / 70%) 100%);
    backdrop-filter: blur(0.5em);
}

.dialog--hide::backdrop {
    background-color: #000;
    background-image: url("../../img/background-img3.webp");
    backdrop-filter: none;
}


// .dialog__content {
//     border: 0.2em solid #000;
//     background-color: #fff;
//     position: relative;
//     width: min(80vw, 30em);
//     max-width: 100%;
//     background-image: url("../../img/background-img.webp");
//     margin-left: auto;
//     margin-right: auto;

//     @at-root {
//         .dialog--polyfilled > #{&} {
//             max-height: 80vh;
//             overflow: auto;
//         }
//     }
// }
</style>
