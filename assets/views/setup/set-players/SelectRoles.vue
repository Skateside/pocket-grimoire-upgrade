<template>
    <StackLayout>
        <BaseLabel label="Show character abilities" :nested="true">
            <BaseCheckbox
                v-model="showAbilities"
                name="abilities"
            />
        </BaseLabel>
        <BaseLabel label="Allow duplicate characters" :nested="true">
            <BaseCheckbox
                v-model="allowDuplicates"
                name="duplicates"
            />
        </BaseLabel>
        <div>
            <BaseButton @click="selectRandom">Highlight random</BaseButton>
        </div>
    </StackLayout>

    <template v-for="team in ORDER">
        <fieldset v-if="rolesStore.scriptByType[team]?.length">
            <legend>{{ team }} ({{ teamCounts[team] }}/{{ gameStore.getTeamCount(team, props.count) }})</legend>
            <GridLayout min-width="10ch">
                <div v-for="role in rolesStore.scriptByType[team]" :key="role.id">
                    <BaseInputSpinner
                        v-if="allowDuplicates && included[role.id]"
                        v-model="counts[role.id]"
                        readonly
                        :aria-label="`Number of ${role.name} to add`"
                        :min="0"
                    />
                    <StackLayout class="assign-roles__picker">
                        <label :for="`role-${role.id}-${suffix}`">
                            <BaseCheckbox
                                v-model="included[role.id]"
                                :name="`role[${role.id}]`"
                                :id="`role-${role.id}-${suffix}`"
                                :disabled="rolesStore.getIsBagDisabled(role)"
                                :aria-describedby="showAbilities ? `role-ability-${role.id}-${suffix}` : undefined"
                                @change="() => handleSelection(role)"
                            />
                            <StackLayout node="span">
                                <img :src="rolesStore.getImage(role)" alt="" width="50" height="50">
                                <strong>{{ role.name }}</strong>
                            </StackLayout>
                        </label>
                        <span v-if="showAbilities" :id="`role-ability-${role.id}-${suffix}`">{{ role.ability }}</span>
                    </StackLayout>
                </div>
            </GridLayout>
        </fieldset>
    </template>
</template>

<script setup lang="ts">
import type { IGameBreakdown, IRole, IRoleCounts } from "~/types/data";
import {
    ERoleSpecialType,
    ERoleSpecialName,
    ERoleTeam,
} from "~/enums/data";
import { computed, reactive, useId, watch } from "vue";
import { ORDER } from "~/helpers/roles";
import useGameStore from "~/stores/game";
import useRolesStore from "~/stores/roles";
import GridLayout from "~/layouts/GridLayout.vue";
import StackLayout from "~/layouts/StackLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseCheckbox from "~/components/base/BaseCheckbox.vue";
import BaseInputSpinner from "~/components/base/BaseInputSpinner.vue"
import BaseLabel from "~/components/base/BaseLabel.vue";
import { shuffle } from "~/utilities/arrays";

const props = defineProps<{
    count: number,
    modelValue: IRoleCounts,
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: IRoleCounts): void,
}>();

const suffix = useId();
const gameStore = useGameStore();
const rolesStore = useRolesStore();
const showAbilities = defineModel<boolean>("abilities", { default: true });
const allowDuplicates = defineModel<boolean>("duplicates", { default: false });
const included = reactive<Record<IRole["id"], boolean>>(
    Object.fromEntries(rolesStore.script.map(({ id }) => [id, false]))
);
const counts = reactive<IRoleCounts>(
    Object.fromEntries(rolesStore.script.map(({ id }) => [id, 0]))
);
const teams = computed<Record<IRole["id"], ERoleTeam>>(() => Object.fromEntries(
    rolesStore.script
        .filter((role) => !rolesStore.getIsMeta(role))
        .map((role) => [role.id, (role as IRole).team])
));
const teamCounts = computed(() => {

    const teamCounts = Object.fromEntries(ORDER.map((team) => [team, 0]));

    Object.entries(counts).forEach(([id, count]) => {

        const team = teams.value[id];

        if (!team) {
            return;
        }

        teamCounts[team] += Number(count);

    });

    return teamCounts;

});

watch(counts, (value) => {

    Object.entries(value).forEach(([id, count]) => {

        if (count < 1) {
            included[id] = false;
        }

    });

    emit("update:modelValue", value);

});

const handleSelection = (role: IRole) => {

    const { id } = role;

    counts[id] = Number(included[id]);

    if (
        included[id]
        && (
            rolesStore.getSpecial(
                role,
                ERoleSpecialType.SELECTION,
                ERoleSpecialName.BAG_DUPLICATE,
            )
            || rolesStore.getSpecial(
                role,
                ERoleSpecialType.SELECTION,
                ERoleSpecialName.GOOD_DUPLICATE,
            )
        )
    ) {
        allowDuplicates.value = true;
    }

};

const selectRandom = () => {

    const types = rolesStore.scriptByType;
    const breakdown = gameStore.getBreakdown(props.count);

    const random: IRole["id"][] = [];

    for (const [team, count] of Object.entries(breakdown)) {

        const roles = types[team as keyof IGameBreakdown].filter((role) => (
            rolesStore.getIsBasicRole(role)
            && !rolesStore.getIsBagDisabled(role)
        ));
        const shuffled = shuffle(roles);
        const sliced = shuffled.slice(0, count);

        random.push(...sliced.map(({ id }) => id));

    }

    rolesStore.script.forEach((role) => {

        if (!rolesStore.getIsBasicRole(role)) {
            return;
        }

        const { id } = role;
        included[id] = random.includes(id);
        handleSelection(role);

    });

};
</script>

<style lang="scss" scoped>
.assign-roles__picker {
    position: relative;

    > label::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        inset-inline-start: 0;
        inset-block-start: 0;
    }
}
</style>
