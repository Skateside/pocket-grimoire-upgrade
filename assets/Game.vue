<template>

    <!-- <div v-for="(roles, group) in roleGroups">
        <p>{{ group }}</p>
        <div class="list">
            <button
                v-for="role in roles"
                :key="role.id"
                type="button"
                @click="() => roleId = role.id"
            >{{ role.name }}</button>
        </div>
    </div>
    <p><button type="button" @click="() => roleId = ''"><em>- clear -</em></button></p>

    <div v-if="roleId" class="list">
        <div>
            <RoleToken :id="roleId" />
        </div>
        <div
            v-for="(_reminder, index) in reminders.local"
            :key="`reminder-${roleId}-${index}`"
        >
            <ReminderToken :id="roleId" :index="index" />
        </div>
        <div
            v-for="(_reminder, index) in reminders.global"
            :key="`reminder-global-${roleId}-${index}`"
        >
            <ReminderToken :id="roleId" :index="index" :is-global="true" />
        </div>
    </div>

    <hr> -->

    <Grimoire />

    <div class="list">
        <button
            v-for="infoToken in infoTokenStore.infoTokens"
            :key="infoToken.id"
            type="button"
            @click="() => infoTokenId = infoToken.id"
        >{{ infoToken.text }}</button>
    </div>

    <Dialog
        ref="infoTokenDialog"
        :hide="true"
        @close="infoTokenId = ''"
    >
        <InfoToken
            :id="infoTokenId"
            @update="(id, text) => {
                infoTokenFormId = id;
                infoTokenFormText = text;
            }"
            @delete="deleteInfoToken"
        />
    </Dialog>

    <InfoTokenForm
        :id="infoTokenFormId"
        :text="infoTokenFormText"
        @create="addInfoToken"
        @update="updateInfoToken"
        @reset="{
            infoTokenFormId = '';
            infoTokenFormText = '';
        }"
    />

</template>

<script lang="ts" setup>
import type {
    IInfoToken,
    // IRole,
} from "./scripts/types/data";
import {
    // computed,
    ref,
    watch,
} from 'vue';
import useInfoTokenStore from "./scripts/store/infoToken";
// import useRoleStore from "./scripts/store/role";
// import RoleToken from './components/RoleToken.vue';
// import ReminderToken from './components/ReminderToken.vue';
import Dialog from './components/Dialog.vue';
import InfoToken from './components/InfoToken.vue';
import InfoTokenForm from "./components/InfoTokenForm.vue";
import Grimoire from "./components/Grimoire.vue";

// const roleStore = useRoleStore();
// const roleGroups = computed(() => {

//     const groups: Record<string, IRole[]> = {
//         townsfolk: [],
//         outsider: [],
//         minion: [],
//         demon: [],
//         traveller: [],
//         fabled: [],
//         special: [],
//     };

//     roleStore.roles.forEach((role) => {

//         if (role.edition === "special") {
//             groups.special.push(role);
//         } else {
//             groups[role.team].push(role);
//         }

//     });

//     return groups;

// });
// const roleId = ref("");
// const reminders = computed(() => roleStore.getReminders(roleId.value));

const infoTokenDialog = ref<typeof Dialog | null>(null);
const infoTokenStore = useInfoTokenStore();
const infoTokenId = ref("");
const infoTokenFormId = ref("");
const infoTokenFormText = ref("");

watch(infoTokenId, (value) => {
    if (value) {
        infoTokenDialog.value?.show();
    }
});

const addInfoToken = (text: IInfoToken["text"]) => {
    infoTokenStore.add(text);
};

const updateInfoToken = (id: IInfoToken["id"], text: IInfoToken["text"]) => {
    infoTokenStore.update(id, text);
};

const deleteInfoToken = (id: IInfoToken["id"]) => {
    infoTokenStore.remove(id);
};
</script>

<style lang="scss" scoped>
.list {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25em;
}
</style>
