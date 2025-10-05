<template>
    <div ref="grimoire" class="grimoire movable">

        <button
            v-for="seat in tokenStore.byType.seat"
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
                />
                <template v-else>{{ seat.name || seat.index }}</template>
            </span>
            <span
                v-for="(number, key) in roleStore.getNightOrderById(seat.role, Object.keys(tokenStore.inPlay))"
                :key="key"
                class="token__night"
                :class="`token__night--${key}`"
            >
                {{ number }}
            </span>
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
                />
                <!-- :alignment="seat.alignment" -->
                <!-- <template v-else>{{ seat.name || seat.index }}</template> -->
            </span>
        </button>

    </div>

    <!-- TODO: Remove this part from this component -->
    <p><button type="button" @click="addSeat">Add seat</button></p>
    <p>
        <label for="remove-dropdown">Remove</label>
        <select id="remove-dropdown" ref="removeDropdown">
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
    </p>

</template>

<script lang="ts" setup>
import type {
    ICoordinates,
} from "../scripts/types/data";
import {
    onMounted,
    onUnmounted,
    ref,
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
import RoleToken from "./RoleToken.vue";
import ReminderToken from "./ReminderToken.vue";

const emit = defineEmits<{
    (e: "seat-click", id: string): void,
}>();

type IPad = {
    x: number,
    y: number,
    r: number,
    b: number,
};

const tokenStore = useTokenStore();
const roleStore = useRoleStore();
const grimoire = ref<HTMLElement | null>(null);
const isDragging = ref<boolean>(false);
const pad = ref<IPad>({
    x: 0,
    y: 0,
    r: 0,
    b: 0,
});
const removeDropdown = ref<HTMLSelectElement | null>(null);

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
        x,
        y,
        r,
        b,
    } = pad.value;

    moveTo(moveableItem, {
        x: clamp(0, (clientX - x) / (r - x), 1),
        y: clamp(0, (clientY - y) / (b - y), 1),
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

const updatePadDimentions = debounce(() => {

    if (!grimoire.value) {
        return;
    }

    const {
        top,
        left,
        right,
        bottom,
    } = grimoire.value.getBoundingClientRect();

    Object.assign(pad.value, {
        y: top,
        x: left,
        r: right,
        b: bottom,
    });

}, 150);

onMounted(() => {

    document.addEventListener("mousedown", startDrag);
    document.addEventListener("touchstart", startDrag);
    document.addEventListener("mouseup", endDragging);
    document.addEventListener("touchend", endDragging);
    document.addEventListener("contextmenu", endDragging);
    document.addEventListener("click", checkClick);
    window.addEventListener("resize", updatePadDimentions);
    window.addEventListener("scroll", updatePadDimentions);
    updatePadDimentions();

});

onUnmounted(() => {

    document.removeEventListener("mousedown", startDrag);
    document.removeEventListener("touchstart", startDrag);
    document.removeEventListener("mouseup", endDragging);
    document.removeEventListener("touchend", endDragging);
    document.removeEventListener("click", endDragging);
    document.removeEventListener("contextmenu", checkClick);
    window.removeEventListener("resize", updatePadDimentions);
    window.removeEventListener("scroll", updatePadDimentions);

});
</script>
