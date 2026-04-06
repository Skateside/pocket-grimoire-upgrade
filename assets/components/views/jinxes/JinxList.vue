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
                    v-for="jinx in jinxesStore.active"
                    :key="`${jinx.target}-${jinx.trick}`"
                >
                    <td>
                        <figure>
                            <img :src="rolesStore.getImageById(jinx.target)" alt="" width="50" height="50" loading="lazy">
                            <figcaption>{{ rolesStore.getRoleById(jinx.target)?.name }}</figcaption>
                        </figure>
                    </td>
                    <td>
                        <figure>
                            <img :src="rolesStore.getImageById(jinx.trick)" alt="" width="50" height="50" loading="lazy">
                            <figcaption>{{ rolesStore.getRoleById(jinx.trick)?.name }}</figcaption>
                        </figure>
                    </td>
                    <td>{{ jinx.reason }}</td>
                </tr>
                <template v-if="showNotInPlay">
                    <tr
                        v-for="jinx in jinxesStore.potential"
                        :key="`${jinx.target}-${jinx.trick}`"
                        class="is-potential"
                    >
                        <td>
                            <figure>
                                <img :src="rolesStore.getImageById(jinx.target)" alt="" width="50" height="50" loading="lazy">
                                <figcaption>{{ rolesStore.getRoleById(jinx.target)?.name }}</figcaption>
                            </figure>
                        </td>
                        <td>
                            <figure>
                                <img :src="rolesStore.getImageById(jinx.trick)" alt="" width="50" height="50" loading="lazy">
                                <figcaption>{{ rolesStore.getRoleById(jinx.trick)?.name }}</figcaption>
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
import useJinxesStore from "~/scripts/stores/jinxes";
import useRolesStore from "~/scripts/stores/roles";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseCheckbox from "~/components/base/BaseCheckbox.vue";

const jinxesStore = useJinxesStore();
const rolesStore = useRolesStore();

const showNotInPlay = defineModel<boolean>({ default: false });
</script>
