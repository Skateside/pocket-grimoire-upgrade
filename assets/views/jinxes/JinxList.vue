<template>
    <template v-if="jinxesStore.active.length || jinxesStore.potential.length">
        <table>
            <caption>Jinxes</caption>
            <thead>
                <tr>
                    <th scope="row">Target</th>
                    <th scope="row">Trick</th>
                    <th scope="row">Reason</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="jinx in active"
                    :key="jinx.id"
                >
                    <td>
                        <figure>
                            <img :src="rolesStore.getImage(jinx.target!)" alt="" width="50" height="50" loading="lazy">
                            <figcaption>{{ jinx.target!.name }}</figcaption>
                        </figure>
                    </td>
                    <td>
                        <figure>
                            <img :src="rolesStore.getImage(jinx.trick!)" alt="" width="50" height="50" loading="lazy">
                            <figcaption>{{ jinx.trick!.name }}</figcaption>
                        </figure>
                    </td>
                    <td>{{ jinx.reason }}</td>
                </tr>
                <template v-if="showNotInPlay">
                    <tr
                        v-for="jinx in potential"
                        :key="jinx.id"
                        class="is-potential"
                    >
                        <td>
                            <figure>
                                <img :src="rolesStore.getImage(jinx.target!)" alt="" width="50" height="50" loading="lazy">
                                <figcaption>{{ jinx.target!?.name }}</figcaption>
                            </figure>
                        </td>
                        <td>
                            <figure>
                                <img :src="rolesStore.getImage(jinx.trick!)" alt="" width="50" height="50" loading="lazy">
                                <figcaption>{{ jinx.trick!?.name }}</figcaption>
                            </figure>
                        </td>
                        <td>{{ jinx.reason }}</td>
                    </tr>
                </template>
            </tbody>
        </table>

        <BaseLabel label="Show jinxes not in play" :nested="true">
            <BaseCheckbox v-model="showNotInPlay" />
        </BaseLabel>
    </template>
    <div v-else>
        <p>There are no jinxes on this script.</p>
    </div>
</template>

<script setup lang="ts">
import type { IJinx } from "~/types/data";
import { computed } from "vue";
import useJinxesStore from "~/stores/jinxes";
import useRolesStore from "~/stores/roles";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseCheckbox from "~/components/base/BaseCheckbox.vue";

const jinxesStore = useJinxesStore();
const rolesStore = useRolesStore();

const showNotInPlay = defineModel<boolean>({ default: false });

const convertJinx = (jinx: IJinx) => ({
    ...jinx,
    target: rolesStore.getRoleById(jinx.target),
    trick: rolesStore.getRoleById(jinx.trick),
});

const convertJinxes = (jinxes: IJinx[]) => {

    return jinxes
        .map(convertJinx)
        .filter(({ target, trick }) => target && trick);

};

const active = computed(() => convertJinxes(jinxesStore.active));
const potential = computed(() => convertJinxes(jinxesStore.potential));
</script>
