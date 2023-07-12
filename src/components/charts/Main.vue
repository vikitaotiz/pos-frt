<template>
  <q-page>
    <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <bar-chart></bar-chart>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <pie-chart></pie-chart>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import LineChart from "components/charts/echarts/LineChart.vue";
import BarChart from "components/charts/echarts/BarChart.vue";
import PieChart from "components/charts/echarts/PieChart.vue";
</script>
