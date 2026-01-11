<template>
    <div ref="grimoire" class="grimoire movable">

        <button
            v-for="seat in tokenStore.byType.seat"
            ref="seats"
            type="button"
            class="token token--seat movable__item"
            :class='{
                "is-dead": seat.dead,
                "is-rotated": seat.rotate,
            }'
            :id="seat.id"
            :style='{
                "--x": seat.x,
                "--y": seat.y,
                "--z": seat.z,
            }'
            @movable-click="() => emit('seat-click', seat.id)"
        >
            <span class="token__contents">
                <RoleToken
                    v-if="seat.role"
                    :role="roleStore.getById(seat.role)"
                    :alignment="seat.alignment"
                    :orphan="roleStore.getIsOrphan(seat.role)"
                />
                <template v-else>{{ seat.name || seat.index }}</template>
            </span>
            <CentreLayout
                node="span"
                type="contents"
                v-for="(number, key) in roleStore.getNightOrderById(seat.role, Object.keys(tokenStore.inPlay))"
                :key="key"
                class="token__night"
                :class="`token__night--${key}`"
            >
                {{ number }}
            </CentreLayout>
            <span class="token__name" v-if="seat.name">{{ seat.name }}</span>
        </button>

        <button
            v-for="reminder in tokenStore.byType.reminder"
            type="button"
            class="token token--reminder movable__item"
            :id="reminder.id"
            :style='{
                "--x": reminder.x,
                "--y": reminder.y,
                "--z": reminder.z,
            }'
        >
            <span class="token__contents">
                <ReminderToken
                    v-if="reminder.reminder"
                    :reminder="roleStore.getReminderById(reminder.reminder)"
                    :orphan="roleStore.getIsOrphanReminder(reminder.reminder)"
                />
                <!-- :alignment="seat.alignment" -->
                <!-- <template v-else>{{ seat.name || seat.index }}</template> -->
            </span>
        </button>

    </div>

    <!-- TODO: Remove this part from this component -->
    <p><button type="button" @click="addSeat">Add seat</button></p>
    <form>
        <label for="remove-dropdown">Remove</label>
        <select id="remove-dropdown" ref="remove-dropdown">
            <option disabled value="">Please select</option>
            <optgroup v-if="tokenStore.byType.seat?.length" label="Seats">
                <option
                    v-for="seat in tokenStore.byType.seat"
                    :value="seat.id"
                >
                    {{ seat.name || seat.role }} ({{ seat.id }})
                </option>
            </optgroup>
            <optgroup v-if="tokenStore.byType.reminder?.length" label="Reminders">
                <option
                    v-for="reminder in tokenStore.byType.reminder"
                    :value="reminder.id"
                >
                    {{ reminder.reminder }} ({{ reminder.id }})
                </option>
            </optgroup>
        </select>
        <button type="button" @click="removeByDropdown">Remove</button>
    </form>

    <!-- TODO: Remove this part: trigger from export -->
    <p><button type="button" @click="setPositions">Position</button></p>

</template>

<script lang="ts" setup>
import type {
    ICoordinates,
    IPad,
} from "../scripts/types/data";
import {
    nextTick,
    onMounted,
    onUnmounted,
    shallowReactive,
    ref,
    useTemplateRef,
} from "vue";
import useTokenStore from "../scripts/store/token";
import useRoleStore from "../scripts/store/role";
import {
    debounce,
    noop,
} from "../scripts/utilities/functions";
import {
    clamp,
} from "../scripts/utilities/numbers";
import {
    type IResizeObserverResponse,
    resizeObserver,
} from "../scripts/utilities/elements";
import CentreLayout from "./layouts/CentreLayout.vue";
import RoleToken from "./RoleToken.vue";
import ReminderToken from "./ReminderToken.vue";
import usePositioner from "../composables/usePositioner";

export type IGrimoirePadInterface = {
    setPositions: () => void,
};

const emit = defineEmits<{
    (e: "seat-click", id: string): void,
}>();

const tokenStore = useTokenStore();
const roleStore = useRoleStore();
const grimoire = useTemplateRef("grimoire");
const seats = useTemplateRef("seats");
const isDragging = ref<boolean>(false);
const pad = shallowReactive<IPad>({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
});
const positioner = usePositioner(pad, seats);
const observer = ref<IResizeObserverResponse | null>(null);

const setPositions: IGrimoirePadInterface["setPositions"] = () => {

    updatePadDimensions();

    nextTick(() => {

        seats.value?.forEach((seat, index) => {

            const position = positioner.coordinates.value[index];

            if (position) {
                moveTo(seat, position);
            }

        });

    });

};

const expose: IGrimoirePadInterface = {
    setPositions,
};

defineExpose(expose);

//*
const removeDropdown = useTemplateRef("remove-dropdown");

const addSeat = () => {

    tokenStore.createSeat({
        x: 0.1,
        y: 0.1,
        z: tokenStore.nextZ,
    });

};

const removeByDropdown = () => {

    const id = removeDropdown.value?.value;

    if (!id) {
        return;
    }

    remove(id);

};

const remove = (id: string) => {
    tokenStore.destroy(id);
};
//*/

const getMovableItem = (target: Element) => {
    return (target as HTMLElement).closest<HTMLElement>(".movable__item");
};

let dragHandler: (event: MouseEvent | TouchEvent) => void = noop;

const moveTo = (movableItem: HTMLElement, { x, y, z }: ICoordinates) => {

    const { id } = movableItem;

    if (!id) {
        return;
    }

    const update: ICoordinates = { x, y };

    if (typeof z === "number" && !Number.isNaN(z)) {
        update.z = z;
    }

    tokenStore.update(id, update);

};

const dragObject = (moveableItem: HTMLElement, event: MouseEvent | TouchEvent) => {

    event.preventDefault();

    let clientX = 0;
    let clientY = 0;

    if (event instanceof MouseEvent) {

        clientX = event.clientX;
        clientY = event.clientY;
        isDragging.value = true;

    } else if (event instanceof TouchEvent) {

        const touches = event.targetTouches[0];

        clientX = touches?.clientX || 0;
        clientY = touches?.clientY || 0;

    }

    const {
        left,
        top,
        right,
        bottom,
    } = pad;

    moveTo(moveableItem, {
        x: clamp(0, (clientX - left) / (right - left), 1),
        y: clamp(0, (clientY - top) / (bottom - top), 1),
    });

};

const startDrag = (event: MouseEvent | TouchEvent) => {

    const movableItem = getMovableItem(event.target as HTMLElement);
    const { id } = movableItem || {};

    if (!movableItem || !id) {
        return;
    }
    
    endDragging();
    dragHandler = (event) => dragObject(movableItem, event);
    tokenStore.update(id, { z: tokenStore.nextZ });

    window.addEventListener("mousemove", dragHandler);
    window.addEventListener("touchmove", dragHandler, {
        passive: false,
    });

};

const endDragging = () => {

    if (dragHandler === noop) {
        return;
    }

    window.removeEventListener("mousemove", dragHandler);
    window.removeEventListener("touchmove", dragHandler);
    dragHandler = noop;

    // The order of events is mousedown -> mouseup -> click. This means that we
    // need to delay the resetting of `isDragging` so that the handler attached
    // to the click event doesn't trigger after dragging. This only seems to be
    // an issue on desktop - mobile seems to be fine.
    window.requestAnimationFrame(() => isDragging.value = false);

};

const checkClick = (event: MouseEvent) => {

    const element = getMovableItem(event.target as HTMLElement);

    if (!element || isDragging.value) {
        return;
    }

    element.dispatchEvent(new CustomEvent("movable-click", {
        bubbles: true,
        cancelable: true,
    }));

};

const updatePadDimensions = () => {

    if (!grimoire.value) {
        return;
    }

    // Destructure and then pass to Object.assign() because Vue doesn't seem to
    // trigger watchEffect() if the function results are directly assigned.
    const {
        top,
        left,
        right,
        bottom,
    } = grimoire.value.getBoundingClientRect();

    Object.assign(pad, {
        top,
        left,
        right,
        bottom,
    });

};

onMounted(() => {

    document.addEventListener("mousedown", startDrag);
    document.addEventListener("touchstart", startDrag);
    document.addEventListener("mouseup", endDragging);
    document.addEventListener("touchend", endDragging);
    document.addEventListener("contextmenu", endDragging);
    document.addEventListener("click", checkClick);
    updatePadDimensions();

    if (grimoire.value) {

        observer.value = resizeObserver(
            grimoire.value,
            debounce(updatePadDimensions, 150),
        );

    }

});

onUnmounted(() => {

    document.removeEventListener("mousedown", startDrag);
    document.removeEventListener("touchstart", startDrag);
    document.removeEventListener("mouseup", endDragging);
    document.removeEventListener("touchend", endDragging);
    document.removeEventListener("click", endDragging);
    document.removeEventListener("contextmenu", checkClick);
    observer.value?.unobserve();

});
</script>
