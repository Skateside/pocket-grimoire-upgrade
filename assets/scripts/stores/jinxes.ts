import type {
    IJinx,
    // IRole,
    // IRoleJinxRaw,
} from "../types/data";
import { EJinxState } from "../enums/data";
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

    return {
        // Getters.
        jinxes,
    };

    /*
    const roleStore = useRoleStore();
    const tokensStore = useTokensStore();

    const innerConvertJinx = (jinx: IRoleJinxRaw, targetId: IRole) => ({
        target: targetId,
        trick: roleStore.getById(jinx.id),
        reason: jinx.reason,
        state: EJinxState.THEORETICAL,
    } satisfies IJinx);

    const innerSetJinxState = (jinx: IJinx) => {

        const inScript = roleStore.script
            .filter((role) => !roleStore.getIsMeta(role))
            .map(({ id }) => id);
        const { inPlay } = tokensStore;
        const targetId = jinx.target.id;
        const trickId = jinx.trick.id;

        if (
            inScript.includes(targetId)
            && inScript.includes(trickId)
        ) {
            jinx.state = EJinxState.POTENTIAL;
        }

        if (
            Object.hasOwn(inPlay, targetId)
            && Object.hasOwn(inPlay, trickId)
        ) {
            jinx.state = EJinxState.ACTIVE;
        }

        return jinx;

    };

    const jinxes = computed(() => {

        const jinxes: IJinx[] = [];

        roleStore.script.forEach((role) => {

            if (roleStore.getIsMeta(role) || !role.jinxes) {
                return; // ignore meta role and role without jinxes.
            }

            jinxes.push(
                ...role.jinxes.map((jinx) => {
                    return innerSetJinxState(innerConvertJinx(jinx, role));
                }),
            );

        });

        return jinxes.filter(({ state }) => state !== EJinxState.THEORETICAL);

    });

    const active = computed(() => {
        return jinxes.value.filter(({ state }) => state === EJinxState.ACTIVE);
    });

    const hasJinxes = computed(() => jinxes.value.length > 0);

    const getIsActive = computed(() => (jinx: IJinx) => {
        return jinx.state === EJinxState.ACTIVE;
    });

    return {
        // Getters.
        active,
        hasJinxes,
        getIsActive,
        jinxes,
    };
    */

});

export default useJinxesStore;
