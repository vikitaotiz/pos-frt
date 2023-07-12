<template>
  <div>
    <div class="row q-pa-sm">
      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="bg-primary">
          <q-card-section class="text-center">
            Total Sales
            <hr />
            <h5 class="q-ma-sm">{{ total }}</h5>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="bg-info">
          <q-card-section class="text-center">
            Mpesa Sales
            <hr />
            <h5 class="q-ma-sm">{{ mpesa }}</h5>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="bg-warning">
          <q-card-section class="text-center">
            Cash Sales
            <hr />
            <h5 class="q-ma-sm">{{ cash }}</h5>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuery } from "vue-query";
import { useSaleStore } from "src/stores/sale-store";

const sale_store = useSaleStore();

const mpesa = ref(0);
const cash = ref(0);
const total = ref(0);

useQuery("bills", () => sale_store.fetchBills(), {
  onSuccess: (data) => {
    const arr_mpesa = [];
    const arr_cash = [];
    const arr_total = [];

    data.forEach((val) => {
      if (val.payment_mode == "Mpesa") arr_mpesa.push(val.selling_price);
      if (val.payment_mode == "Cash") arr_cash.push(val.selling_price);
      arr_total.push(val.selling_price);
    });

    total.value = arr_total.reduce((a, b) => a + b);
    mpesa.value = arr_mpesa.reduce((a, b) => a + b);
    cash.value = arr_cash.reduce((a, b) => a + b);
  },
});
</script>
