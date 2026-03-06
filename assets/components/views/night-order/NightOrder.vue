<template>
    <ReelLayout class="night-order" node="dl" :carousel="true" :shadows="true">
        <div v-for="(title, key) in nights" class="night-order__night">
            <dt class="night-order__heading">{{ title }}</dt>
            <template v-for="{ role } in rolesStore.nightOrder[key]" :key="role.id">
                <dd
                    v-if="showRole(role.id)"
                    class="night-order__entry"
                    :class="{
                        'is-in-play': isInPlay(role.id),
                        'is-dead': isDead(role.id),
                    }"
                >
                    <p class="night-order__name"><strong>{{ role.name }}</strong></p>
                    <img :src="rolesStore.getImage(role)" alt="" width="50" height="50" class="night-order__icon">
                    <p class="night-order__ability">{{ role[`${key}NightReminder`] }}</p>
                </dd>
            </template>
        </div>
    </ReelLayout>

    <form>
        <ul>
            <li>
                <BaseLabel label="Show dead characters" :nested="true">
                    <BaseCheckbox v-model="showDead" name="show-dead" />
                </BaseLabel>
            </li>
            <li>
                <BaseLabel label="Show characters not in play" :nested="true">
                    <BaseCheckbox v-model="showNotInPlay" name="show-nip" />
                </BaseLabel>
            </li>
        </ul>
    </form>
</template>

<script setup lang="ts">
import type { IRole } from "~/scripts/types/data";
import ReelLayout from "~/components/layouts/ReelLayout.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseCheckbox from "~/components/base/BaseCheckbox.vue";
import useRolesStore from "~/scripts/store/roles";
import useTokensStore from "~/scripts/store/tokens";

const showDead = defineModel<boolean>("dead", { default: true });
const showNotInPlay = defineModel<boolean>("not-in-play", { default: true });
const rolesStore = useRolesStore();
const tokensStore = useTokensStore();
const nights = {
    first: "First Night",
    other: "Other Nights",
};

const isDead = (id: IRole["id"]) => (
    !rolesStore.getIsSpecialById(id)
    && tokensStore.dead.includes(id)
);
const isInPlay = (id: IRole["id"]) => (
    rolesStore.getIsSpecialById(id)
    || Object.hasOwn(tokensStore.inPlay, id)
);
const showRole = (id: IRole["id"]) => (
    (!isDead(id) || showDead.value)
    && (isInPlay(id) || showNotInPlay.value)
);
</script>
