import type { IJinx, IRole, IRoleJinxRaw } from "../types/data";
import { EJinxState } from "../enums/data";
import { defineStore } from "pinia";
import { computed } from "vue";
import useRoleStore from "./role";
import useTokensStore from "./tokens";

const useJinxStore = defineStore("jinx", () => {

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

});

export default useJinxStore;
