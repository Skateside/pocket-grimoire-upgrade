<template>
    <div
        ref="menu"
        @toggle="handleMenuToggle"
        popover
    >
        <p>{{ props.tokenId }}</p>

        <Tabs>
            <Tab title="Player">
                <menu>
                    <li><button type="button" @click="removePlayer">Remove</button></li>
                </menu>
                <form @submit.prevent="setSeatName">
                    <label :for="`name-${idSuffix}`">What is the name of this player?</label>
                    <input type="text" name="name" :id="`name-${idSuffix}`" v-model="seatName">
                    <button type="submit">Set player name</button>
                </form>
            </Tab>
            <Tab title="Role" :disabled="!roleStore.hasScript">
                <menu>
                    <li><button type="button" @click="setRole">Set</button></li>
                    <li><button type="button">Show</button></li>
                    <li><button type="button">Shroud</button></li>
                    <li><button type="button">Ghost vote</button></li>
                    <li><button type="button">Rotate</button></li>
                </menu>
                <fieldset>
                    <legend>Set alignment</legend>
                    <!--
                    NOTE: This means different things for different role types:
                        Townsfolk & Outsiders = good, evil
                        Minions & Demon = evil, good
                        Travellers = unknown, good, evil
                        Fabled = unknown
                    Also: hide this is there's only 1 image.
                    -->
                    <ul>
                        <li>
                            <label :for="`alignment-0-${idSuffix}`">
                                <input type="radio" name="alignment" value="0" :id="`alignment-0-${idSuffix}`">
                                Default
                            </label>
                        </li>
                        <li>
                            <label :for="`alignment-1-${idSuffix}`">
                                <input type="radio" name="alignment" value="1" :id="`alignment-1-${idSuffix}`">
                                Alternative
                            </label>
                        </li>
                    </ul>
                </fieldset>
            </Tab>
            <Tab title="Reminder" :disabled="!roleStore.hasScript">
                <menu>
                    <li><button type="button">Add</button></li>
                </menu>
                <p>TODO: Recent reminders</p>
            </Tab>
        </Tabs>
        
    </div>
    <!-- <RoleDialog v-if="isShowRoleDialog"/> -->
</template>

<script setup lang="ts">
import type { ITokenSeat } from "../scripts/types/data";
import {
    computed,
    onMounted,
    ref,
    useId,
} from 'vue';
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
import {
    Tabs,
    Tab,
} from "./ui/tabs";

const idSuffix = useId();
const props = defineProps<{
    tokenId: string,
}>();
const roleStore = useRoleStore();
const tokenStore = useTokenStore();
const seatName = defineModel<string>({ default: "" });
const emit = defineEmits<{
    (e: "toggle", newState: string): void,
    (e: "remove"): void,
}>();
const menu = ref<HTMLElement | null>(null);
const seatToken = computed(() => tokenStore.getById(props.tokenId) as ITokenSeat);

const setSeatName = () => {
    
    if (!props.tokenId) {
        return;
    }
        
    tokenStore.update<ITokenSeat>(props.tokenId, {
        name: seatName.value,
    });

};

const handleMenuToggle = (event: ToggleEvent) => {
    emit("toggle", event.newState);
};

const removePlayer = () => {
    emit("remove");
};

// const isShowRoleDialog = ref<boolean>(false);
const setRole = () => {
    // isShowRoleDialog.value = true;
    // TODO: trigger a new event so that the grimoire can show the RoleDialog
};

onMounted(() => {

    seatName.value = seatToken.value?.name || "";
    menu.value?.showPopover();

});
</script>
