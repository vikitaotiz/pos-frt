<template>
  <q-card
    style="border-radius: 8px"
    class="q-pa-sm"
    v-if="series[0].data.length > 0"
  >
    <apexchart
      v-if="series[0].data.length"
      type="bar"
      :options="options"
      :series="series"
    ></apexchart>
  </q-card>
</template>

<script setup>
import { reactive, ref } from "vue";
import { getCssVar } from "quasar";
import { useQuery } from "vue-query";
import { useSaleStore } from "src/stores/sale-store";

const sale_store = useSaleStore();

const options = reactive({
  title: {
    text: "Sales Records for the last seven days",
    align: "left",
  },
  chart: {
    id: "apex-column",
  },
  colors: [getCssVar("primary"), getCssVar("secondary"), getCssVar("negative")],
  xaxis: {
    categories: [],
    title: {
      text: "Date/Days",
    },
  },

  yaxis: {
    title: {
      text: "Amount",
    },
  },

  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "55%",
      endingShape: "rounded",
    },
  },
});
const series = ref([
  {
    name: "Sales",
    data: [],
  },
]);

useQuery("sales", () => sale_store.fetchSevenDaysSales(), {
  onSuccess: (data) => {
    options.xaxis.categories = data.map((val) => val.day)?.reverse();
    series.value[0].data = data.map((val) => val.sales)?.reverse();
  },
});
</script>
