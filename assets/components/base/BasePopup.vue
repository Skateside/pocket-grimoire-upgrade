<template>
    <dialog
        popover
        ref="popup"
        @toggle="handleToggle"
    >
        <BoxLayout>
            <StackLayout>
                <div v-if="slots.default">
                    <slot />
                </div>
                <p v-else>{{ messageText }}</p>
                <ClusterLayout>
                    <BaseButton
                        v-if="popupType === 'confirm'"
                        variant="secondary"
                        @click="() => handleChoice(false)"
                    >
                        {{ props.noText }}
                    </BaseButton>
                    <BaseButton
                        @click="() => handleChoice(true)"
                    >
                        {{ props[popupType === 'alert' ? 'okText' : 'yesText']  }}
                    </BaseButton>
                </ClusterLayout>
            </StackLayout>
        </BoxLayout>
    </dialog>
</template>

<script setup lang="ts">
import { ref, useSlots, useTemplateRef } from "vue";
import BoxLayout from "~/layouts/BoxLayout.vue";
import ClusterLayout from "~/layouts/ClusterLayout.vue";
import StackLayout from "~/layouts/StackLayout.vue";
import BaseButton from "./BaseButton.vue";

const props = withDefaults(defineProps<{
    type?: "alert" | "confirm",
    okText?: string,
    yesText?: string,
    noText?: string,
}>(), {
    type: "alert",
    okText: "OK",
    yesText: "Yes",
    noText: "No",
});
const emit = defineEmits<{
    (e: "toggle", state: string): void,
    (e: "shown"): void,
    (e: "hidden"): void,
}>();
const slots = useSlots();
const popup = useTemplateRef("popup");
const popupType = ref(props.type);
const messageText = ref("");
const resolvePromise = ref<(value: boolean) => void>(() => {});

const showPopup = (
    message?: string,
    type: "alert" | "confirm" = "alert",
): Promise<boolean> => {

    messageText.value = message ?? "";
    popupType.value = type;

    popup.value?.showPopover();

    return new Promise((resolve) => {
        resolvePromise.value = resolve;
    });

};

const showAlert = (message?: string) => showPopup(message, "alert");
const showConfirm = (message?: string) => showPopup(message, "confirm");

const handleChoice = (value: boolean) => {
    resolvePromise.value(value);
    popup.value?.hidePopover();
};

const handleToggle = ({ newState }: ToggleEvent) => {

    if (newState === "closed") {
        handleChoice(popupType.value === "alert");
    }

    emit("toggle", newState);

    if (newState === "open") {
        emit("shown");
    } else if (newState === "closed") {
        emit("hidden");
    }

};

defineExpose({
    showAlert,
    showConfirm,
    showPopup,
});
</script>
