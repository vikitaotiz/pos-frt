<template>
  <div class="q-pa-md">
    <q-table
      grid
      flat
      bordered
      title="Sold/Pending Bills"
      :rows="bills"
      row-key="user"
      :filter="filter"
      v-model:pagination="pagination"
    >
      <template v-slot:top-right>
        <q-input
          rounded
          outlined
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-3">
          <q-card
            bordered
            :class="`${props.row.status == 'pending' ? 'sale_pending' : ''}`"
          >
            <q-card-section>
              <div class="text-center">
                <strong>Created by : {{ props.row.user }}</strong> <br />
                <small>Created On : {{ props.row.created_at }}</small> <br />
                <small>Status : {{ props.row.status }}</small>
              </div>
              <q-separator class="q-mb-sm" />

              <q-list dense bordered separator class="bill">
                <q-item>
                  <q-item-section>Name</q-item-section>
                  <q-item-section side style="color: white"
                    >Quantity</q-item-section
                  >
                </q-item>
              </q-list>

              <q-list dense bordered separator>
                <q-item v-for="(prod, index) in props.row.sales" :key="index">
                  <q-item-section>{{ prod.name }}</q-item-section>
                  <q-item-section side>{{ prod.quantity }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator />
            <q-card-section class="flex flex-center">
              <b>Ksh {{ props.row.selling_price }} </b>
              <hr />
              <small>Mode : {{ props.row.payment_mode }}</small>
            </q-card-section>
            <hr />
            <q-card-section style="padding: 0">
              <q-btn
                class="full-width"
                dense
                flat
                @click="printBill(props.row.sales)"
                label="Print Bill"
                icon="download"
                color="primary"
              />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSaleStore } from "src/stores/sale-store";
import { useQuery } from "vue-query";
import { paginations } from "src/utilities/paginations";
import print from "print-js";

const pagination = paginations(10);

const filter = ref("");
const sale_store = useSaleStore();

const { data: bills } = useQuery("bills", () => sale_store.fetchBills());

const printBill = (dt) => {
  const print_data = [];
  dt.forEach((val) => {
    print_data.push({ name: val.name, quantity: val.quantity });
  });

  print({
    printable: print_data,
    properties: ["name", "quantity"],
    type: "json",
    gridHeaderStyle: "color: red;  border: 2px solid #3971A5;",
    gridStyle: "border: 2px solid #3971A5;",
  });
};
</script>

<style scoped>
.bill {
  background-color: #017951;
  color: white;
}

.sale_pending {
  border: 1px solid orangered;
}
</style>
