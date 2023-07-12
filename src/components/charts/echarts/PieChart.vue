<template>
  <div>
    <q-card :class="$q.dark.isActive ? 'bg-dark' : ''">
      <q-card-section class="text-h6"> Product Categories </q-card-section>
      <q-card-section>
        <ECharts
          ref="piechart"
          :option="options"
          class="q-mt-md"
          :resizable="true"
          autoresize
          style="height: 250px"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import ECharts from "vue-echarts";
import { useQuasar } from "quasar";
import { useQuery } from "vue-query";
import { useCategoryStore } from "src/stores/category-store";

const $q = useQuasar();
const category_store = useCategoryStore();

const options = reactive({
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b}: {c} ({d}%)",
  },
  legend: {
    top: "bottom",
    bottom: "5%",
    left: "center",
  },
  series: [
    {
      name: "Category",
      type: "pie",
      radius: ["40%", "70%"],
      center: ["50%", "45%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "40",
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        // { value: 1048, name: "Search Engine" },
        // { value: 735, name: "Direct access" },
        // { value: 580, name: "Email marketing" },
        // { value: 484, name: "Affiliate Advertising" },
        // { value: 300, name: "Video ad" },
      ],
    },
  ],
});

useQuery("categories", () => category_store.fetchCategories(), {
  onSuccess: (data) => {
    const dt = data.map((val) => {
      return {
        name: val.name,
        products: val.products.length,
        created_at: val.created_at,
      };
    });

    options.series[0].data = [];

    dt.forEach((val) => {
      options.series[0].data.push({
        value: val.products,
        name: val.name,
      });
    });
  },
});
</script>

<style scoped></style>
