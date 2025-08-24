<template>
    <Dialog
        :title="props.tokenId"
        @toggle="handleToggle"
    >
        <p>{{ props.tokenId }}</p>
        <dl>
            <dt>Role</dt>
            <dd>{{ roleToken ? roleToken.name : "(unset)" }}</dd>
            <dt>Dead?</dt>
            <dd>{{ seatToken.dead ? "yes" : "no" }}</dd>
            <dt>Ghost Vote?</dt>
            <dd>{{ seatToken.ghostVote === false ? "no" : "yes" }}</dd>
            <dt>Rotated?</dt>
            <dd>{{ seatToken.rotate ? "yes" : "no" }}</dd>
        </dl>

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
                    <li><button type="button" @click="toggleDead">Shroud</button></li>
                    <li v-if="seatToken.dead"><button type="button" @click="toggleGhostVote">Ghost vote</button></li>
                    <li><button type="button" @click="toggleRotate">Rotate</button></li>
                </menu>
                <fieldset v-if="roleToken && showAlignment">
                    <legend>Set alignment</legend>
                    <ul v-if="roleToken.team === 'townsfolk' || roleToken.team === 'outsider'">
                        <li>
                            <label :for="`alignment-0-${idSuffix}`">
                                <input type="radio" name="alignment" value="0" :id="`alignment-0-${idSuffix}`">
                                Good
                            </label>
                        </li>
                        <li>
                            <label :for="`alignment-1-${idSuffix}`">
                                <input type="radio" name="alignment" value="1" :id="`alignment-1-${idSuffix}`">
                                Evil
                            </label>
                        </li>
                    </ul>
                    <ul v-else-if="roleToken.team === 'minion' || roleToken.team === 'demon'">
                        <li>
                            <label :for="`alignment-0-${idSuffix}`">
                                <input type="radio" name="alignment" value="0" :id="`alignment-0-${idSuffix}`">
                                Evil
                            </label>
                        </li>
                        <li>
                            <label :for="`alignment-1-${idSuffix}`">
                                <input type="radio" name="alignment" value="1" :id="`alignment-1-${idSuffix}`">
                                Good
                            </label>
                        </li>
                    </ul>
                    <ul v-if="roleToken.team === 'traveller'">
                        <li>
                            <label :for="`alignment-0-${idSuffix}`">
                                <input type="radio" name="alignment" value="0" :id="`alignment-0-${idSuffix}`">
                                Default
                            </label>
                        </li>
                        <li>
                            <label :for="`alignment-1-${idSuffix}`">
                                <input type="radio" name="alignment" value="1" :id="`alignment-1-${idSuffix}`">
                                Good
                            </label>
                        </li>
                        <li>
                            <label :for="`alignment-2-${idSuffix}`">
                                <input type="radio" name="alignment" value="2" :id="`alignment-2-${idSuffix}`">
                                Evil
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

    </Dialog>
</template>

<script setup lang="ts">
import type {
    // IRole,
    ITokenSeat,
} from "../scripts/types/data";
import {
    computed,
    onMounted,
    // ref,
    useId,
} from 'vue';
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
// import useUiStore from "../scripts/store/ui";
import {
    Tabs,
    Tab,
} from "./ui/tabs";
import Dialog from "./Dialog.vue";

const props = defineProps<{
    tokenId: string,
}>();
const emit = defineEmits<{
    (e: "toggle", newState: "showing" | "hidden"): void,
    (e: "remove"): void,
    (e: "set-role"): void,
}>();
const seatName = defineModel<string>({ default: "" });

const idSuffix = useId();
// const uiStore = useUiStore();
const roleStore = useRoleStore();
const tokenStore = useTokenStore();

const seatToken = computed(() => tokenStore.getById(props.tokenId) as ITokenSeat);
const roleToken = computed(() => {

    const role = seatToken.value?.role;

    if (role) {
        return roleStore.getById(role);
    }

    return null;

});
const showAlignment = computed(() => {

    const { image, team } = (roleToken.value || {});

    return (
        image
        && typeof image !== "string"
        && image.length > 1
        && team !== "fabled"
    );

});

const setSeatName = () => {
    
    if (!props.tokenId) {
        return;
    }
        
    tokenStore.update<ITokenSeat>(props.tokenId, {
        name: seatName.value,
    });

};

const handleToggle = (newState: "showing" | "hidden") => {
    emit("toggle", newState);
};

const removePlayer = () => {
    emit("remove");
};

const setRole = () => {
    emit("set-role");
};

const toggleDead = () => {

    const settings: Partial<ITokenSeat> = {};

    if (seatToken.value.dead) {
        settings.dead = false;
    } else {
        settings.dead = true;
        settings.ghostVote = true;
    }

    tokenStore.update<ITokenSeat>(seatToken.value.id, settings);

};

const toggleGhostVote = () => {

    tokenStore.update<ITokenSeat>(seatToken.value.id, {
        ghostVote: !seatToken.value.ghostVote,
    });

};

const toggleRotate = () => {

    tokenStore.update<ITokenSeat>(seatToken.value.id, {
        rotate: !seatToken.value.rotate,
    });

};

onMounted(() => {
    seatName.value = seatToken.value?.name || "";
});
</script>
