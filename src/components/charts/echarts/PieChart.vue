<template>
  <q-card style="border-radius: 8px" v-if="series.length > 0">
    <q-card-section>
      <apexchart
        v-if="series.length > 0"
        type="pie"
        :options="options"
        :series="series"
        :height="358"
      ></apexchart>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { reactive, ref } from "vue";
import { getCssVar } from "quasar";
import { useQuery } from "vue-query";

import { useAccountStore } from "src/stores/account-store";

const account_store = useAccountStore();

useQuery("today_product_sales", () => account_store.fetchTodayProductSales(), {
  onSuccess: (data) => {
    series.value = data.map((val) => val.quantity);
    options.labels = data.map((val) => val.name);
  },
});

const options = reactive({
  title: {
    text: "Todays Product Sales",
    align: "left",
  },
  chart: {
    id: "apex-donut",
  },
  colors: [
    getCssVar("secondary"),
    getCssVar("accent"),
    getCssVar("positive"),
    getCssVar("primary"),
    getCssVar("negative"),
    getCssVar("info"),
  ],
  markers: {
    size: 4,
    hover: {
      sizeOffset: 6,
    },
  },
  labels: [],
});

const series = ref([]);
</script>
