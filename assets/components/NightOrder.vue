<template>
    <dl class="night-order">
        <div v-for="(title, key) in nights" class="night-order__night">
            <dt class="night-order__heading">{{ title }}</dt>
            <dd
                v-for="{ role } in roleStore.nightOrder[key]"
                :key="role.id"
                class="night-order__entry"
                :class="{
                    'is-in-play': Object.hasOwn(tokenStore.inPlay, role.id),
                    'is-dead': tokenStore.dead.includes(role.id),
                }"
            >
                <p class="night-order__name"><strong>{{ role.name }}</strong></p>
                <img :src="roleStore.getImage(role)" alt="" width="50" height="50" class="night-order__icon">
                <p class="night-order__ability">{{ role[`${key}NightReminder`] }}</p>
            </dd>
        </div>
    </dl>
</template>

<script setup lang="ts">
import { computed } from "vue";
import useRoleStore from "../scripts/store/role";
import useTokenStore from "../scripts/store/token";

const roleStore = useRoleStore();
const tokenStore = useTokenStore();
const nights = computed(() => ({
    first: "First Night",
    other: "Other Nights",
}));
</script>
