<template>
    <DialogUI
        :title="name"
        v-on="bubbleEvents(emit)"
    >
        <!-- TEMP stats to make sure everything's correct -->
        <table>
            <tbody>
                <tr>
                    <th scope="row">Token ID</th>
                    <td>{{ props.tokenId }}</td>
                </tr>
                <tr>
                    <th scope="row">Role</th>
                    <td>{{ roleToken ? roleToken.name : "(unset)" }}</td>
                </tr>
                <tr>
                    <th scope="row">Dead?</th>
                    <td>{{ seatToken.dead ? "yes" : "no" }}</td>
                </tr>
                <tr>
                    <th scope="row">Ghost Vote?</th>
                    <td>{{ seatToken.ghostVote === false ? "no" : "yes" }}</td>
                </tr>
                <tr>
                    <th scope="row">Rotated?</th>
                    <td>{{ seatToken.rotate ? "yes" : "no" }}</td>
                </tr>
            </tbody>
        </table>

        <TabsUI>
            <TabUI title="Player">
                <menu>
                    <li><button type="button" @click="removePlayer">Remove</button></li>
                </menu>
                <form @submit.prevent="setSeatName">
                    <label :for="`name-${idSuffix}`">What is the name of this player?</label>
                    <input
                        type="text"
                        name="name"
                        :id="`name-${idSuffix}`"
                        v-model="seatName"
                        @focus="({ target }) => (target as HTMLInputElement)?.select()"
                    >
                    <button type="submit">Set player name</button>
                </form>
            </TabUI>
            <TabUI title="Role" :disabled="!roleStore.hasScript">
                <menu>
                    <li><button type="button" @click="setRole">Set</button></li>
                    <li v-if="roleToken"><button type="button" @click="unsetRole">Remove</button></li>
                    <li><button type="button" @click="showRole">Show</button></li>
                    <li><button type="button" @click="toggleDead">Shroud</button></li>
                    <li v-if="seatToken.dead"><button type="button" @click="toggleGhostVote">Ghost vote</button></li>
                    <li><button type="button" @click="toggleRotate">Rotate</button></li>
                </menu>
                <fieldset v-if="roleToken && showAlignment">
                    <legend>Set alignment</legend>
                    <ul>
                        <li v-for="(text, index) in alignmentOptions" :key="index">
                            <label :for="`alignment-${index}-${idSuffix}`">
                                <input type="radio" v-model="alignment" name="alignment" :value="index" :id="`alignment-${index}-${idSuffix}`">
                                {{ text }}
                            </label>
                        </li>
                    </ul>
                </fieldset>
            </TabUI>
            <TabUI title="Reminder" :disabled="!roleStore.hasScript">
                <menu>
                    <li><button type="button" @click="addReminder">Add</button></li>
                </menu>
                <p>TODO: Recent reminders</p>
            </TabUI>
        </TabsUI>

    </DialogUI>
</template>

<script setup lang="ts">
import type {
    IRole,
    IRoleAlignment,
    ITokenSeat,
} from "../scripts/types/data";
import {
    computed,
    onMounted,
    // ref,
    useId,
    watch,
} from 'vue';
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";
// import useUiStore from "../scripts/store/ui";
import {
    TabsUI,
    TabUI,
} from "./ui/tabs";
import {
    type IDialogUIEvents,
    DialogUI,
    bubbleEvents,
} from "./ui/dialog";
import {
    supplant,
} from "../scripts/utilities/strings";

const props = defineProps<{
    tokenId: string,
}>();
const emit = defineEmits<IDialogUIEvents & {
    (e: "remove"): void,
    (e: "set-role"): void,
    (e: "show-role", id: IRole): void,
    (e: "add-reminder"): void,
}>();
const seatName = defineModel<string>('seat-name', { default: "" });
const alignment = defineModel<IRoleAlignment>('alignment', { default: 0 });

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
const alignmentOptions = computed<string[]>(() => {

    const { team } = roleToken.value || {};

    switch (team) {

    case "townsfolk":
    case "outsider":
        return ["Good", "Evil"]; // TODO i18n

    case "minion":
    case "demon":
        return ["Evil", "Good"]; // TODO i18n

    case "traveller":
        return ["Default", "Good", "Evil"]; // TODO i18n

    }

    return [];

});
const name = computed(() => {
    const token = seatToken.value;
    return token.name || supplant("Player {0}", [token.index ?? 1]); // TODO i18n
});

const setSeatName = () => {

    if (!props.tokenId) {
        return;
    }

    tokenStore.update<ITokenSeat>(props.tokenId, {
        name: seatName.value,
    });

};

const removePlayer = () => {
    emit("remove");
};

const setRole = () => {
    emit("set-role");
};

const addReminder = () => {
    emit("add-reminder");
};

const unsetRole = () => {

    tokenStore.update<ITokenSeat>(props.tokenId, {
        role: undefined,
    });

};

const showRole = () => {

    if (roleToken.value) {
        emit("show-role", roleToken.value);
    }

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

    seatName.value = seatToken.value?.name || name.value;
    alignment.value = seatToken.value?.alignment || 0;

});

watch(alignment, (value) => {

    tokenStore.update<ITokenSeat>(seatToken.value.id, {
        alignment: value,
    });

});
</script>
