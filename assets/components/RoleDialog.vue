<template>
    <div ref="dialog" popover>
        <div v-for="role in roles">
            {{ role.name }}
        </div>
    </div>
</template>

<script setup lang="ts">
// import type { IRole, IRolePlayTeam } from "../scripts/types/data";
import useRoleStore from "../scripts/store/role";
import { computed, onMounted, ref } from "vue";

const store = useRoleStore();
const dialog = ref<HTMLElement | null>(null);

const roles = computed(() => store.script.filter((role) => !store.getIsMeta(role)));

// const roles = computed(() => {

//     const grouped = store.script.reduce((groups, role) => {

//         if (store.getIsMeta(role)) {
//             return groups;
//         }

//         const group = groups.find(([team]) => team === role.team);

//         if (group) {
//             group[1].push(role);
//         }

//         return groups;

//     }, [
//         ["townsfolk", []],
//         ["outsider", []],
//         ["minion", []],
//         ["demon", []],
//         ["traveller", []],
//     ] as [IRolePlayTeam, IRole[]][]);

//     return grouped.map(([_team, roles]) => roles).flat();

//     // const order: IRolePlayTeam[] = [
//     //     "townsfolk",
//     //     "outsider",
//     //     "minion",
//     //     "demon",
//     //     "traveller",
//     // ];

//     // Object.entries(Object.groupBy(
//     //     store.script.filter((role) => !store.getIsMeta(role)),
//     //     (role) => (role as IRole).team,
//     // ))
//     // .sort(([teamA], [teamB]) => {
//     //     return order.indexOf(teamA as IRolePlayTeam) - order.indexOf(teamB as IRolePlayTeam);
//     // });


// });

onMounted(() => {
    dialog.value?.showPopover();
});
</script>
