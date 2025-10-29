<template>
    <dl class="night-order">
        <div v-for="(title, key) in nights" class="night-order__night">
            <dt class="night-order__heading">{{ title }}</dt>
            <template v-for="{ role } in roleStore.nightOrder[key]" :key="role.id">
                <dd
                    v-if="showRole(role.id)"
                    class="night-order__entry"
                    :class="{
                        'is-in-play': isInPlay(role.id),
                        'is-dead': isDead(role.id),
                    }"
                >
                    <p class="night-order__name"><strong>{{ role.name }}</strong></p>
                    <img :src="roleStore.getImage(role)" alt="" width="50" height="50" class="night-order__icon">
                    <p class="night-order__ability">{{ role[`${key}NightReminder`] }}</p>
                </dd>
            </template>
        </div>
    </dl>

    <ul>
        <li>
            <label :for="`show-dead-${suffix}`">
                <input
                    v-model="showDead"
                    type="checkbox"
                    :id="`show-dead-${suffix}`"
                    name="show-dead"
                >
                Show dead characters
            </label>
        </li>
        <li>
            <label :for="`show-nip-${suffix}`">
                <input
                    v-model="showNotInPlay"
                    type="checkbox"
                    :id="`show-nip-${suffix}`"
                    name="show-nip"
                >
                Show characters not in play
            </label>
        </li>
    </ul>
</template>

<script setup lang="ts">
import type { IRole } from "../scripts/types/data";
import { useId } from "vue";
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";

const suffix = useId();
const showDead = defineModel<boolean>("dead", { default: true });
const showNotInPlay = defineModel<boolean>("not-in-play", { default: true });
const roleStore = useRoleStore();
const tokenStore = useTokenStore();
const nights = {
    first: "First Night",
    other: "Other Nights",
};

const isDead = (id: IRole["id"]) => (
    !roleStore.getIsSpecial(id)
    && tokenStore.dead.includes(id)
);
const isInPlay = (id: IRole["id"]) => (
    roleStore.getIsSpecial(id)
    || Object.hasOwn(tokenStore.inPlay, id)
);
const showRole = (id: IRole["id"]) => (
    (!isDead(id) || showDead.value)
    && (isInPlay(id) || showNotInPlay.value)
);
</script>
