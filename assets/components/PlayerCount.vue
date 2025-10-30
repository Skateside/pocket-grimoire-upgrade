<template>
    <table>
        <thead>
            <tr>
                <th scope="row">Player Count</th>
                <th
                    v-for="count in Object.keys(store.numbers)"
                    :key="count"
                    scope="col"
                >
                    {{ count }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(breakdown, team) in store.table">
                <th scope="row">{{ team }}</th>
                <td v-for="count in breakdown">{{ count }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import useGameStore from "../scripts/store/game";

const store = useGameStore();
</script>
