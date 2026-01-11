import {
    EJinxState,
    type IJinx,
    type IRole,
    type IRoleJinxRaw,
} from "../types/data";
import {
    defineStore,
} from "pinia";
import {
    computed,
} from "vue";
import useRoleStore from "./role";
import useTokenStore from "./token";

const useJinxStore = defineStore("jinx", () => {

    const roleStore = useRoleStore();
    const tokenStore = useTokenStore();

    const innerConvertJinx = (jinx: IRoleJinxRaw, targetId: IRole) => {

        const converted: IJinx = {
            target: targetId,
            trick: roleStore.getById(jinx.id),
            reason: jinx.reason,
            state: EJinxState.Theoretical,
        };

        return converted;

    };

    const innerSetJinxState = (jinx: IJinx) => {

        const inScript = roleStore.script
            .filter((role) => !roleStore.getIsMeta(role))
            .map(({ id }) => id);
        const { inPlay } = tokenStore;
        const targetId = jinx.target.id;
        const trickId = jinx.trick.id;

        if (
            inScript.includes(targetId)
            && inScript.includes(trickId)
        ) {
            jinx.state = EJinxState.Potential;
        }

        if (
            Object.hasOwn(inPlay, targetId)
            && Object.hasOwn(inPlay, trickId)
        ) {
            jinx.state = EJinxState.Active;
        }

        return jinx;

    };

    const jinxes = computed(() => {

        const jinxes: IJinx[] = [];

        roleStore.script.forEach((role) => {

            if (roleStore.getIsMeta(role) || !role.jinxes) {
                return;
            }

            jinxes.push(
                ...role.jinxes.map((jinx) => {
                    return innerSetJinxState(innerConvertJinx(jinx, role));
                }),
            );

        });

        return jinxes.filter(({ state }) => state !== EJinxState.Theoretical);

    });

    const active = computed(() => {
        return jinxes.value.filter(({ state }) => state === EJinxState.Active);
    });

    const hasJinxes = computed(() => jinxes.value.length > 0);

    const getIsActive = computed(() => (jinx: IJinx) => {
        return jinx.state === EJinxState.Active;
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
