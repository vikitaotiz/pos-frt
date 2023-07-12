<template>
  <q-card class="q-pa-sm">
    <apexchart
      height="300"
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

const get_days = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return days[d.getDay()];
  });

  return dates.reverse();
};

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
    options.xaxis.categories = [];

    const days = data.map((val) => val.day);
    const sales = data.map((val) => val.sales);

    options.xaxis.categories = days;

    console.log(convert_to_array(options.xaxis.categories));

    series.value[0].data = sales;
  },
});

const convert_to_array = (arr) => JSON.parse(JSON.stringify(arr));
</script>
