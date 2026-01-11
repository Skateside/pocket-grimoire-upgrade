<template>
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
                v-for="jinx in jinxes"
                :key="`${jinx.target}-${jinx.trick}`"
                :class="{
                    'is-in-play': jinxStore.getIsActive(jinx),
                }"
            >
                <td>
                    <figure>
                        <img :src="roleStore.getImage(jinx.target)" alt="" width="50" height="50" loading="lazy">
                        <figcaption>{{ jinx.target.name }}</figcaption>
                    </figure>
                </td>
                <td>
                    <figure>
                        <img :src="roleStore.getImage(jinx.trick)" alt="" width="50" height="50" loading="lazy">
                        <figcaption>{{ jinx.trick.name }}</figcaption>
                    </figure>
                </td>
                <td>{{ jinx.reason }}</td>
            </tr>
        </tbody>
    </table>

    <form>
        <ul>
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
    </form>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import useJinxStore from "../scripts/store/jinx";
import useRoleStore from "../scripts/store/role";

const suffix = useId();
const showNotInPlay = defineModel<boolean>({ default: true });
const jinxStore = useJinxStore();
const roleStore = useRoleStore();
const jinxes = computed(() => (
    showNotInPlay.value
    ? jinxStore.jinxes
    : jinxStore.active
));
</script>
