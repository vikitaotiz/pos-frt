<template>
  <div class="q-pa-sm">
    <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><StatsToday /></div>
      <div
        class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
        v-if="hasPermission(auth_store?.user?.user?.roles)"
      >
        <StatsAll />
      </div>

      <div
        class="col-lg-6 col-md-6 col-sm-12 col-xs-12 desktop_stats"
        v-if="hasPermission(auth_store?.user?.user?.roles)"
      >
        <BarChart />
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12 desktop_stats">
        <PieChart />
      </div>
    </div>
  </div>
</template>
<script setup>
import StatsToday from "components/charts/StatsToday.vue";
import StatsAll from "components/charts/StatsAll.vue";
import BarChart from "components/charts/echarts/BarChart.vue";
import PieChart from "components/charts/echarts/PieChart.vue";

import { useAuthStore } from "src/stores/auth-store";
import { hasPermission } from "src/utilities/helpers";

const auth_store = useAuthStore();
</script>

<style scoped>
@media screen and (max-width: 768px) {
  .desktop_stats {
    display: none;
  }
}
</style>
