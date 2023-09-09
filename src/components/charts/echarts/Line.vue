<template>
  <apexchart
    v-if="series[0].data.length"
    type="line"
    height="348"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>
<script setup>
import { reactive, ref } from "vue";
import { useQuery } from "vue-query";
import { useSaleStore } from "src/stores/sale-store";

const sale_store = useSaleStore();

useQuery("sales", () => sale_store.fetchSevenDaysSales(), {
  onSuccess: (data) => {
    chartOptions.xaxis.categories = data.map((val) => val.day)?.reverse();
    series.value[0].data = data.map((val) => val.sales)?.reverse();
    series.value[1].data = data.map((val) => val.expense)?.reverse();
    series.value[2].data = data.map((val) => val.difference)?.reverse();
  },
});

const series = ref([
  {
    name: "Sales",
    data: [],
  },
  {
    name: "Expense",
    data: [],
  },
  {
    name: "Difference (Sales - Expense)",
    data: [],
  },
]);

const chartOptions = reactive({
  chart: {
    height: 350,
    type: "line",
    dropShadow: {
      enabled: true,
      color: "#000",
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.2,
    },
    toolbar: {
      show: false,
    },
  },
  colors: ["#017951", "#FF0000", "#000000"],
  dataLabels: {
    enabled: true,
  },
  stroke: {
    curve: "smooth",
  },
  title: {
    text: "Sales, Expenses and Difference",
    align: "left",
  },
  grid: {
    borderColor: "#31CCEC",
    row: {
      colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
      opacity: 0.5,
    },
    column: {
      colors: ["#f3f3f3", "transparent"],
    },

    xaxis: {
      lines: {
        show: true,
      },
    },
  },
  markers: {
    size: 1,
  },
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
    // min: 5,
    // max: 40,
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    floating: true,
    offsetY: -25,
    offsetX: -5,
  },
});
</script>
