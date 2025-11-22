import DialogUI from "./DialogUI.vue";

// TODO: beforeToggle events

const bubbleEvents = (emit: any) => ({
    show() {
        emit("show");
    },
    hide() {
        emit("hide");
    },
    toggle(visible: boolean) {
        emit("toggle", visible);
    },
});

export type IDialogUIEvents = {
    (e: "show"): void,
    (e: "hide"): void,
    (e: "toggle", visible: boolean): void,
};

export {
    DialogUI,
    bubbleEvents,
};
