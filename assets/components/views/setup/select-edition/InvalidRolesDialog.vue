<template>
   <DialogUI
      v-if="rolesStore.importReport.invalid.length"
      :title="`Imported ${rolesStore.importReport.imported} of ${rolesStore.importReport.given}`"
   >
      <p>The valid roles have been imported, but some roles couldn't be.</p>
      
      <dl>
         <div v-for="{ role, reasons } in rolesStore.importReport.invalid">
            <dt>{{ role.id || "(unknown role)" }}</dt>
            <dd v-for="reason in reasons">{{ reason }}</dd>
         </div>
      </dl>

      <BaseButton @click="() => rolesStore.clearImportReport()">OK</BaseButton>
   </DialogUI>
</template>

<script setup lang="ts">
import DialogUI from "~/components/ui/DialogUI.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import useRolesStore from "~/scripts/store/roles";

const rolesStore = useRolesStore();
</script>
