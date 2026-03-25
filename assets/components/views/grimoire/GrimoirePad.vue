<template>
    <div ref="grimoire" class="grimoire movable">

        <button
            v-for="seat in tokensStore.seats"
            :key="seat.id"
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
            @movable-click="() => console.log('seat-click', seat.id)"
        >
            <span class="token__contents">
                <RoleToken
                    v-if="seat.role"
                    :role="seat.role"
                    :alignment="seat.alignment"
                    :orphan="rolesStore.getIsOrphanById(seat.role)"
                />
                <template v-else>{{ seat.name || seat.index }}</template>
            </span>
            <CentreLayout
                v-for="(number, key) in rolesStore.getNightOrderById(seat.role, idsInPlay)"
                :key="key"
                node="span"
                type="contents"
                class="token__night"
                :class="`token__night--${key}`"
            >
                {{ number }}
            </CentreLayout>
            <span class="token__name" v-if="seat.name">{{ seat.name }}</span>
        </button>

    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import useRolesStore from "~/scripts/stores/roles";
import useTokensStore from "~/scripts/stores/tokens";
import CentreLayout from "~/components/layouts/CentreLayout.vue";
import RoleToken from "~/components/general/RoleToken.vue";

const rolesStore = useRolesStore();
const tokensStore = useTokensStore();

const idsInPlay = computed(() => Object.keys(tokensStore.inPlay));
</script>
