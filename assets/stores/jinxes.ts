import type { IJinx } from "~/types/data";
import { EJinxState } from "~/enums/data";
import { defineStore } from "pinia";
import { computed } from "vue";
import useRolesStore from "./roles";
import useTokensStore from "./tokens";

const useJinxesStore = defineStore("jinxes", () => {

    const rolesStore = useRolesStore();
    const tokensStore = useTokensStore();

    const jinxes = computed(() => {

        const jinxes: IJinx[] = [];

        rolesStore.scriptRoles.forEach((role) => {

            (role.jinxes || []).forEach((jinx) => {

                jinxes.push({
                    target: role.id,
                    trick: jinx.id,
                    reason: jinx.reason,
                    state: EJinxState.THEORETICAL,
                });

            });

        });

        const roleIds = rolesStore.scriptRoles.map(({ id }) => id);

        jinxes.forEach((jinx) => {

            if (roleIds.includes(jinx.target) && roleIds.includes(jinx.trick)) {
                jinx.state = EJinxState.POTENTIAL;
            }

            if (
                tokensStore.inPlay[jinx.target] > 0
                && tokensStore.inPlay[jinx.trick] > 0
            ) {
                jinx.state = EJinxState.ACTIVE;
            }

        });

        return jinxes;

    });

    const active = computed(() => {
        return jinxes.value.filter(({ state }) => state === EJinxState.ACTIVE);
    });

    const potential = computed(() => {
        return jinxes.value.filter(({ state }) => state === EJinxState.POTENTIAL);
    });

    return {
        // Getters.
        jinxes,
        active,
        potential,
    };

});

export default useJinxesStore;
