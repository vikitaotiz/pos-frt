<template>
  <div class="q-pa-md">
    <div v-if="isLoading">Loading bills...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      grid
      flat
      bordered
      title="Uncleared Bills"
      :rows="bills"
      row-key="bill_ref"
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-btn-group class="q-mr-sm q-mb-sm">
          <q-btn
            icon="list"
            size="sm"
            color="primary"
            label="All Bills"
            to="/bills"
          />
        </q-btn-group>

        <q-input
          dense
          debounce="300"
          outlined
          v-model="filter"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card
            bordered
            :class="`${props.row.status == 'pending' ? 'sale_pending' : ''}`"
            style="8px"
          >
            <div
              class="text-center q-pa-xs"
              :class="`${
                props.row.payment_mode === 'Debt' ? 'debt_bill' : 'bill'
              }`"
            >
              <small
                ><strong
                  ><q-icon name="description" style="margin-bottom: 2px" />
                  BILL-{{ props.row.bill_ref }}</strong
                ></small
              >
            </div>
            <q-card-section>
              <div class="text-center">
                <strong> Created by : {{ props.row.user }}</strong>
                <q-space />
              </div>
              <q-separator class="q-mb-sm" />

              <div class="text-center">
                <small>Created On : {{ props.row.created_at }}</small> <br />
                <small
                  ><q-badge color="blue"
                    >Status : {{ props.row.status }} <br />
                    Mode : {{ props.row.payment_mode }}</q-badge
                  >
                </small>
              </div>
              <q-separator class="q-mb-sm" />

              <small>
                <q-list dense bordered separator class="debt_bill">
                  <q-item>
                    <q-item-section>Name</q-item-section>
                    <q-item-section>Price</q-item-section>
                    <q-item-section style="color: white"
                      >Quantity</q-item-section
                    >
                    <q-item-section style="color: white">Total</q-item-section>
                    <q-item-section
                      v-if="
                        props.row.status === 'pending' &&
                        props.row.sales.length > 1
                      "
                      >Action</q-item-section
                    >
                  </q-item>
                </q-list>
              </small>

              <small>
                <q-list dense bordered separator>
                  <q-item v-for="(prod, index) in props.row.sales" :key="index">
                    <q-item-section>{{ prod.name }}</q-item-section>
                    <q-item-section>{{ prod.selling_price }}</q-item-section>
                    <q-item-section>{{ prod.quantity }}</q-item-section>
                    <q-item-section>{{
                      (prod.quantity * prod.selling_price).toFixed(2)
                    }}</q-item-section>
                  </q-item>
                </q-list>
              </small>
            </q-card-section>
            <q-separator />

            <q-card-section v-if="props?.row?.debtors?.length > 0">
              <small>
                <b>Payment Records (Partially Paid)</b>
                <q-list dense bordered separator>
                  <q-item>
                    <q-item-section>Paid</q-item-section>
                    <q-item-section>Balance</q-item-section>
                    <q-item-section>Mode</q-item-section>
                    <q-item-section>Date</q-item-section>
                  </q-item>
                </q-list>
                <q-list dense bordered separator>
                  <q-item
                    v-for="(deb, index) in props.row.debtors"
                    :key="index"
                  >
                    <q-item-section>{{ deb.amount_paid }}</q-item-section>
                    <q-item-section>{{ deb.balance }}</q-item-section>
                    <q-item-section>{{ deb.payment_mode }}</q-item-section>
                    <q-item-section>{{ deb.created_at }}</q-item-section>
                  </q-item>
                  <q-item class="bg-indigo text-white">
                    <q-item-section>Total Debt Cleared</q-item-section>
                    <q-item-section>
                      {{ props?.row?.total_debt_paid }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </small>
            </q-card-section>

            <q-separator />
            <q-card-section class="text-center">
              <small>
                <p>Debtor: {{ props.row.debtor_name }}</p>
                <b>Initial Debt Ksh {{ props?.row?.selling_price }}</b> <br />
                <b v-if="props?.row?.total_debt_paid > 0"
                  >Amount due Ksh
                  {{ props?.row?.selling_price - props?.row?.total_debt_paid }}
                </b>
              </small>
            </q-card-section>
            <q-card-section style="padding: 0">
              <q-btn-group class="full-width">
                <q-btn
                  class="full-width"
                  dense
                  flat
                  @click="printBill(props.row)"
                  label="Print Bill"
                  icon="print"
                  color="primary"
                />
                <q-btn
                  v-if="hasPermission(auth_store?.user?.user?.roles)"
                  dense
                  flat
                  push
                  color="orange"
                  class="full-width"
                  label="Clear Bill"
                  icon="grain"
                  @click="openSaleProductDialog(props.row)"
                />
              </q-btn-group>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>

    <!-- Product Quantity dialog -->
    <!-- <q-dialog v-model="productQuantity" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <q-toolbar>
            <b>Add Product</b>
            <q-space />
            <small v-if="selected_product">
              <q-badge class="q-mr-sm" color="blue"
                >Price: {{ selected_product.price }}</q-badge
              >
              <q-badge class="q-mr-sm" color="blue"
                >Category: {{ selected_product.category }}</q-badge
              >
              <q-badge class="q-mr-sm" color="blue"
                >Department: {{ selected_product.department }}</q-badge
              >
            </small>
          </q-toolbar>
          <hr />
          <q-select
            dense
            use-input
            outlined
            v-model="selected_product"
            input-debounce="0"
            @new-value="createValue"
            :options="filterOptions"
            @filter="filterFn"
            option-value="uuid"
            option-label="name"
            label="Select Product to add"
            hint="You can type in the product name for quick search..."
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-if="selected_product"
            outlined
            dense
            label="Product Quantity"
            v-model="product_quantity"
            type="number" min="1" oninput="validity.valid||(value='');"
            :hint="`Note : You can sale a maximum of ${selected_product.quantity}`"
          />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="red"
            @click="closeSelectedProductDialog"
          />
          <q-space />
          <q-btn
            v-if="product_quantity && selected_product"
            flat
            label="Add Product"
            color="primary"
            @click="addToSelectedProductsList"
            :loading="loadingSaleBtn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog> -->

    <!-- Sale Product dialog -->
    <q-dialog v-model="saleProduct" persistent>
      <q-card style="width: 500px">
        <q-toolbar>
          <div class="text-h6">Make Payment</div>
          <q-space />
          <small class="q-mt-sm"
            ><q-btn
              :disabled="payment_mode_uuid.name === 'Mpesa & Cash'"
              size="sm"
              color="blue"
              depressed
              :class="`${!expected_price ? 'actual_selling_price' : ''}`"
              @click="expected_price = !expected_price"
              :label="`Full payment : ${total_bill}`"
          /></small>
        </q-toolbar>

        <q-card-section class="q-pt-none">
          <q-input
            v-if="!expected_price && payment_mode_uuid.name !== 'Mpesa & Cash'"
            autofocus
            outlined
            dense
            label="Actual amount paid"
            v-model="actual_selling_price"
            class="q-pa-xs col-xs-12 col-sm-6 col-md-6 q-mb-sm"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
          />

          <q-select
            v-if="actual_selling_price && actual_selling_price > 0"
            dense
            outlined
            v-model="payment_mode_uuid"
            :options="payment_modes"
            option-value="uuid"
            option-label="name"
            label="Select Payment Mode"
          />

          <div v-if="payment_mode_uuid.name === 'Mpesa & Cash'" class="q-pa-sm">
            <div class="row q-col-gutter-sm">
              <q-input
                outlined
                dense
                class="col-6"
                label="Mpesa Amount"
                type="number"
                min="1"
                oninput="validity.valid||(value='');"
                v-model="both_mpesa"
              />
              <q-input
                outlined
                dense
                class="col-6"
                label="Cash Amount"
                type="number"
                min="1"
                oninput="validity.valid||(value='');"
                v-model="both_cash"
              />
            </div>
          </div>
          <div v-if="payment_mode_uuid.name === 'Debt'" class="q-pa-sm">
            <q-input outlined v-model="debtor_name" dense label="Debtor Name" />
          </div>
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="red"
            @click="closeSaleProductDialog"
          />
          <q-space />
          <q-btn
            v-if="actual_selling_price && payment_mode_uuid"
            flat
            label="Pay"
            color="primary"
            @click="clearDebt"
            :loading="loadingSaleBtn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { useSaleStore } from "src/stores/sale-store";
import { useProductStore } from "src/stores/product-store";
import { usePaymentModeStore } from "src/stores/payment-mode-store";
import { useQuery, useQueryClient } from "vue-query";
import { exportDataToPdf } from "src/utilities/receipt";

import { useAuthStore } from "src/stores/auth-store";
import { hasPermission } from "src/utilities/helpers";

const auth_store = useAuthStore();
const queryClient = useQueryClient();

const $q = useQuasar();

const filter = ref("");
const sale_store = useSaleStore();
const product_store = useProductStore();
const payment_mode_store = usePaymentModeStore();

const productQuantity = ref(false);
const loadingSaleBtn = ref(false);
const expected_price = ref(true);
const saleProduct = ref(false);
const product_quantity = ref(1);
const actual_selling_price = ref(1);
const both_mpesa = ref(1);
const both_cash = ref(1);
const debtor_name = ref("");
const selected_bill = ref("");
const selected_product = ref("");
const payment_mode_uuid = ref("");
const errorMsg = ref("");
const products = ref([]);
const bills = ref([]);

// const { data: bills1 } = useQuery("bills", () => sale_store.fetchBills());
const {
  data: bills_data,
  isLoading,
  isError,
} = useQuery("bills", () => sale_store.fetchUnclearedBills(), {
  onSuccess: (data) => {
    bills.value = data.map((val) => {
      return {
        user: val.user,
        uuid: val.uuid,
        bill_ref: val.bill_ref,
        debtor_name: val.debtor_name,
        debtors: val.debtors,
        total_debt_paid: val.total_debt_paid,
        status: val.status,
        payment_mode: val.payment_mode,
        selling_price: val.selling_price,
        actual_selling_price: val.actual_selling_price,
        created_at: val.created_at,
        sales: val.sales,
      };
    });
  },
});

useQuery("products", () => product_store.fetchProducts(), {
  onSuccess: (data) => {
    products.value = data.map((val) => {
      return {
        uuid: val.uuid,
        name: val.name,
        price: val.selling_price,
        category: val.category,
        department: val.department,
        quantity: val.quantity,
      };
    });
  },
});

const payment_modes = ref([]);

useQuery("payment_modes", () => payment_mode_store.fetchPaymentModes(), {
  onSuccess: (data) =>
    (payment_modes.value = data.filter((val) => val.name !== "Debt")),
});

const filterOptions = ref(products.value);

// const openProductQuantityDialog = (bill) => {
//   selected_bill.value = bill;
//   productQuantity.value = true;
// };

const total_bill = computed(() => {
  let total = 0;
  selected_bill.value.sales.forEach((val) => {
    total += val.selling_price * val.quantity;
  });
  total = total - selected_bill.value.total_debt_paid;
  return total;
});

const openSaleProductDialog = (data) => {
  selected_bill.value = data;
  saleProduct.value = true;
};

// const closeSelectedProductDialog = () => {
//   errorMsg.value = "";
//   productQuantity.value = false;
//   selected_product.value = "";
//   product_quantity.value = 1;
//   errorMsg.value = "";
// };

// const addToSelectedProductsList = async () => {
//   loadingSaleBtn.value = true;
//   if (
//     selected_bill.value.sales.some(
//       (val) => val.name === selected_product.value.name
//     )
//   ) {
//     errorMsg.value = "Product already added to the bill";
//     notifyUser("Product already added to the bill", "red", "top-right");
//   } else {
//     if (product_quantity.value > selected_product.value.quantity) {
//       errorMsg.value = `${product_quantity.value} is more than the maximum available quantity`;
//       notifyUser(
//         `${product_quantity.value} is more than the maximum available quantity`,
//         "red",
//         "top"
//       );
//     } else {
//       const res = await sale_store.addProductToBill({
//         bill_uuid: selected_bill.value.uuid,
//         uuid: selected_product.value.uuid,
//         name: selected_product.value.name,
//         selling_price: selected_product.value.price,
//         quantity: product_quantity.value,
//       });

//       if (res.status == "success") {
//         queryClient.refetchQueries("bills");
//         selected_bill.value = "";
//         productQuantity.value = false;
//         loadingSaleBtn.value = false;
//         notifyUser(res.message, "green", "top");
//       } else {
//         loadingSaleBtn.value = false;
//         selected_bill.value = "";
//         productQuantity.value = false;
//         notifyUser(res.message, "red", "top");
//       }
//     }
//   }
// };

const closeSaleProductDialog = () => {
  saleProduct.value = false;
  payment_mode_uuid.value = "";
  errorMsg.value = "";
};

// const removeProductFromSelectedBill = async (product) => {
//   loadingSaleBtn.value = true;
//   const del = confirm("Are you sure?");
//   if (del) {
//     const res = await sale_store.removeProductFromBill({
//       product_uuid: product.uuid,
//     });

//     if (res.status == "success") {
//       queryClient.refetchQueries("bills");
//       loadingSaleBtn.value = false;
//       notifyUser(res.message, "green", "top");
//     } else {
//       selected_bill.value = "";
//       loadingSaleBtn.value = false;
//       productQuantity.value = false;
//       notifyUser(res.message, "red", "top");
//     }
//   }
// };

// const removeSelectedBill = async (bill) => {
//   loadingSaleBtn.value = true;
//   const del = confirm("Are you sure?");
//   if (del) {
//     const res = await sale_store.deleteBill({ bill_uuid: bill.uuid });
//     if (res.status == "success") {
//       queryClient.refetchQueries("bills");
//       loadingSaleBtn.value = false;
//       notifyUser(res.message, "green", "top");
//     } else {
//       loadingSaleBtn.value = false;
//       selected_bill.value = "";
//       productQuantity.value = false;
//       notifyUser(res.message, "red", "top");
//     }
//   }
// };

const clearDebt = async () => {
  loadingSaleBtn.value = true;
  let prods = [];
  selected_bill.value.sales.forEach((val) =>
    prods.push({
      name: val.name,
      quantity: val.quantity,
      uuid: val.uuid,
    })
  );

  const finItem = {
    bill_uuid: selected_bill.value.uuid,
    // products: prods,
    payment_mode_uuid: payment_mode_uuid.value.uuid,
    debtor_name: selected_bill.value.debtor_name,
  };

  if (payment_mode_uuid.value.name === "Mpesa & Cash") {
    const both_cash_mpesa = Number(both_mpesa.value) + Number(both_cash.value);
    finItem.selling_price = both_cash_mpesa;
    finItem.actual_selling_price = both_cash_mpesa;
  } else {
    if (expected_price.value) {
      finItem.selling_price = Number(total_bill.value);
      finItem.actual_selling_price = Number(total_bill.value);
    } else {
      finItem.selling_price = Number(total_bill.value);
      finItem.actual_selling_price = Number(actual_selling_price.value);
    }
  }

  if (finItem.actual_selling_price === finItem.selling_price) {
    finItem.balance = 0;
  } else {
    finItem.balance = finItem.selling_price - finItem.actual_selling_price;
  }

  if (
    finItem.actual_selling_price &&
    finItem.payment_mode_uuid &&
    finItem.debtor_name
  ) {
    const res = await sale_store.payUnclearedBill(finItem);

    if (res.status === "success") {
      queryClient.refetchQueries("bills");

      payment_mode_uuid.value = "";
      product_quantity.value = "";
      saleProduct.value = false;
      loadingSaleBtn.value = false;
      notifyUser(res.message, "green", "top");
    } else {
      errorMsg.value = res.message;
      notifyUser(res.message, "red", "top-right");
    }
  } else {
    loadingSaleBtn.value = false;
    errorMsg.value = "Name is required!";
    notifyUser("Name is required!", "red", "top-right");
  }
};

const createValue = (val, done) => {
  if (val.length > 0) {
    if (!products.value.includes(val)) {
      products.value.push(val);
    }
    done(val, "toggle");
  }
};

const filterFn = (val, update) => {
  update(() => {
    if (val === "") {
      filterOptions.value = products.value;
    } else {
      const needle = val.toLowerCase();
      filterOptions.value = products.value.filter(
        (v) => v.name.toLowerCase().indexOf(needle) > -1
      );
    }
  });
};

const printBill = (dt) => {
  const print_data = [];
  dt.sales.forEach((val) => {
    print_data.push({
      name: val.name,
      quantity: val.quantity,
      price: val.selling_price,
      total: val.quantity * val.selling_price,
    });
  });

  const receipt_data = {
    title: "Sales Receipt",
    bill_ref: dt.bill_ref,
    created_at: dt.created_at,
    status: dt.status === "sold" ? "Sold" : "Pending Payment",
    user: dt.user,
    payment_mode: dt.payment_mode,
    actual_selling_price: dt.actual_selling_price,
    debtor_name: dt.debtor_name,
  };

  exportDataToPdf(
    print_data,
    ["name", "quantity", "price", "total"],
    receipt_data
  );
};

// Shared notification method
const notifyUser = (message, color, position) => {
  $q.notify({
    message,
    color,
    position,
  });
};
</script>

<style scoped>
.bill {
  background-color: #017951;
  color: white;
}

.sale_pending {
  background-color: #b0f7df;
  box-shadow: rgb(249, 5, 5) 0px 3px 8px;
}

.error_msg {
  color: red;
}

.actual_selling_price {
  text-decoration: line-through;
}

.debt_bill {
  background-color: #2196f3;
  color: white;
}
</style>
