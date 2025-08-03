<template>
    <div ref="grimoire" class="grimoire movable">

        <button
            v-for="seat in store.byType.seat"
            type="button"
            class="seat movable__item"
            :id="seat.id"
            :style='{
                "--x": seat.x,
                "--y": seat.y,
                "--z": seat.z,
            }'
            :title="seat.id"
            @movable-click="() => setTokenId(seat.id)"
        >
            {{ seat.id.slice(6, 12) }}
            <div v-if="seat.name">{{ seat.name }}</div>
        </button>

    </div>

    <SeatMenu
        v-if="tokenId"
        :token-id="tokenId"
        @toggle="handleMenuToggle"
    />

    <p><button type="button" @click="addSeat">Add seat</button></p>
    <p>
        <label for="remove-dropdown">Remove</label>
        <select id="remove-dropdown" ref="removeDropdown">
            <option value=""></option>
            <option v-for="seat in store.byType.seat">{{ seat.id }}</option>
        </select>
        <button type="button" @click="removeSeat">Remove seat</button>
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
import {
    debounce,
    noop,
} from "../scripts/utilities/functions";
import {
    clamp,
} from "../scripts/utilities/numbers";
import SeatMenu from "./SeatMenu.vue";

type IPad = {
    x: number,
    y: number,
    r: number,
    b: number,
};

const store = useTokenStore();
const grimoire = ref<HTMLElement | null>(null);
const isDragging = ref<boolean>(false);
const pad = ref<IPad>({
    x: 0,
    y: 0,
    r: 0,
    b: 0,
});
const removeDropdown = ref<HTMLSelectElement | null>(null);
const tokenId = ref<string>("");

const addSeat = () => {

    store.createSeat({
        x: 0.1,
        y: 0.1,
        z: store.nextZ,
    });

};

const removeSeat = () => {
    const id = removeDropdown.value?.value;
    if (!id) {
        return;
    }
    store.destroy(id);
};

const setTokenId = (id: string) => tokenId.value = id;

const handleMenuToggle = (state: string) => {

    if (state === "closed") {
        tokenId.value = "";
    }

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

    store.update(id, update);

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
    store.update(id, { z: store.nextZ });

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

<style lang="scss" scoped>
.grimoire {
    border: 2px solid #000;
    background-color: #222;
    height: 80vh;
    overflow: auto;
}

.seat {
    width: 4em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    background-color: #ddd;
    border: 2px solid #000;
    border-radius: 50%;
}

.movable {
    position: relative;
}

.movable__item {
    --x: 0;
    --y: 0;
    --z: 0;
    cursor: move;
    position: absolute;
    left: calc(var(--x) * 100%);
    top: calc(var(--y) * 100%);
    transform: translate(-50%, -50%);
    z-index: var(--z);
    touch-action: none;
    user-select: none;
}
</style>
