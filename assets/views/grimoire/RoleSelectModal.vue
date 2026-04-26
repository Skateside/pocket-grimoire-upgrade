<template>
    <BaseModal ref="modal" title="Select Role">
        <details>
            <summary><h2>Filter</h2></summary>
            <StackLayout>
                <h3>Teams</h3>
                <ClusterLayout>
                    <!-- TODO: i18n -->
                    <BaseLabel
                        v-for="team in ORDER"
                        :key="team"
                        :label="team"
                        :nested="true"
                    >
                        <BaseCheckbox
                            v-model="teams[team]"
                            name="abilities"
                        />
                    </BaseLabel>
                </ClusterLayout>
                <h3>Exclude</h3>
                <StackLayout>
                    <BaseLabel label="Exclude roles in-play" :nested="true">
                        <BaseCheckbox
                            v-model="excludeRoles.inPlay"
                            name="abilities"
                        />
                    </BaseLabel>
                    <BaseLabel label="Exclude roles not on the script" :nested="true">
                        <BaseCheckbox
                            v-model="excludeRoles.notOnScript"
                            name="abilities"
                        />
                    </BaseLabel>
                </StackLayout>
            </StackLayout>
        </details>

        <h2>Results</h2>

        <GridLayout min-width="6ch">
            <button
                v-for="role in rolesStore.getFiltered(filters)"
                :key="role.id"
                class="no-button"
                @click="() => emit('role-click', role.id)"
            >
                <RoleToken :role="role" />
            </button>
        </GridLayout>
    </BaseModal>
</template>

<script setup lang="ts">
import type { IRole, IRoleFilter } from "~/types/data";
import { ERoleTeam } from "~/enums/data";
import { computed, reactive, useTemplateRef } from "vue";
import BaseModal from "~/components/modal/BaseModal.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseCheckbox from "~/components/base/BaseCheckbox.vue";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import GridLayout from "~/components/layouts/GridLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import RoleToken from "./RoleToken.vue";
import useRolesStore from "~/stores/roles";
import useTokensStore from "~/stores/tokens";
import { ORDER } from "~/helpers/roles";

const emit = defineEmits<{
    (e: "role-click", roleId: IRole["id"]): void,
}>();
const rolesStore = useRolesStore();
const tokensStore = useTokensStore();
const modal = useTemplateRef("modal");

const teams = reactive<Record<ERoleTeam, boolean>>({
    [ERoleTeam.TOWNSFOLK]: true,
    [ERoleTeam.OUTSIDER]: true,
    [ERoleTeam.MINION]: true,
    [ERoleTeam.DEMON]: true,
    [ERoleTeam.TRAVELLER]: true,
    [ERoleTeam.FABLED]: false,
    [ERoleTeam.LORIC]: false,
});
const excludeRoles = reactive({
    inPlay: false,
    notOnScript: true,
});
const filters = computed(() => {
    const include: IRoleFilter = {};
    const exclude: IRoleFilter = {};

    include.team = Object
        .keys(teams)
        .filter((team) => teams[team as ERoleTeam]) as ERoleTeam[];

    if (excludeRoles.notOnScript) {
        include.id = rolesStore.script.map(({ id }) => id);
    }

    if (excludeRoles.inPlay) {
        exclude.id = tokensStore.seats
            .map(({ roleId }) => roleId)
            .filter(Boolean) as IRole["id"][];
    }

    return {
        include,
        exclude,
    };
});

defineExpose({
    show() {
        return modal.value?.show();
    },
    hide() {
        return modal.value?.hide();
    },
});
</script>
