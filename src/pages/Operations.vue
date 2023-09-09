<template>
  <div class="q-pa-md">
    <div class="row" style="overflow: hidden">
      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-7" style="overflow: auto">
        <!-- Render products table -->
        <small style="color: red">{{ dupError }}</small>
        <div v-if="isLoading">Loading products...</div>
        <div v-else-if="isError">An error has occurred: {{ isError }}</div>
        <q-table
          v-else
          :title="`Make Sale (All Products : ${products?.length})`"
          :rows="products"
          :columns="product_columns"
          separator="cell"
          row-key="name"
          :filter="filter"
          dense
          grid
        >
          <template v-slot:item="props">
            <div
              class="q-pa-xs col-xs-12 col-sm-6 col-md-4"
              @click="openProductDialog(props.row)"
            >
              <q-card
                bordered
                class="selected_product"
                style="border-radius: 10px"
                :class="`${props.row.quantity < 1 ? 'minQty' : ''}`"
              >
                <q-card-section class="text-center">
                  <strong style="color: #017951"
                    ><q-icon name="bubble_chart" /> {{ props.row.name }}</strong
                  >
                  <hr />
                  <small
                    ><i
                      >Selling Price:
                      <b>Ksh {{ props.row.selling_price }}</b></i
                    ></small
                  >
                  <hr />
                  <small
                    ><i>Category: {{ props.row.category }}</i></small
                  ><br />
                  <small
                    ><i>Department: {{ props.row.department }}</i></small
                  ><br />
                  <small
                    ><q-badge
                      :color="`${props.row.quantity < 1 ? 'red' : 'orange'}`"
                      >Available Quantity <br />{{ props.row.quantity }}
                      {{ props.row.measurement }}</q-badge
                    ></small
                  >
                </q-card-section>
              </q-card>
            </div>
          </template>

          <template v-slot:top-right>
            <q-input
              borderless
              dense
              outlined
              rounded
              debounce="300"
              v-model="filter"
              placeholder="Search product..."
              class="q-mr-md"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </div>
      <div
        v-if="selected_products.length > 0"
        class="q-pa-xs col-xs-12 col-sm-6 col-md-5"
        style="overflow: auto"
      >
        <q-card bordered>
          <q-card-actions
            ><i><q-icon name="shopping_cart" /> New Bill</i> <q-space /><span
              style="color: orange"
              >(Items: {{ selected_products.length }})</span
            ></q-card-actions
          >

          <q-card-section>
            <small>
              <q-list bordered separator dense class="bill">
                <q-item>
                  <q-item-section>Name</q-item-section>
                  <q-item-section style="color: white">Price</q-item-section>
                  <q-item-section style="color: white">Quantity</q-item-section>
                  <q-item-section side style="color: white"
                    >Total</q-item-section
                  >
                  <q-item-section avatar>
                    <q-icon
                      class="select_list"
                      name="delete"
                      dense
                      color="white"
                      @click="clearProductList"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <q-list bordered separator dense>
                <q-item
                  v-for="(prod, index) in selected_products"
                  :key="prod.uuid"
                >
                  <q-item-section>{{ prod.name }}</q-item-section>
                  <q-item-section>
                    <span style="color: black">
                      {{ prod.price }}
                    </span>
                  </q-item-section>
                  <q-item-section>{{ prod.quantity }}</q-item-section>
                  <q-item-section side>
                    <span style="color: black">{{
                      prod.price * prod.quantity
                    }}</span></q-item-section
                  >
                  <q-item-section avatar
                    ><q-icon
                      class="select_list"
                      name="delete"
                      dense
                      color="red"
                      @click="removeAddedProduct(index)"
                    />
                  </q-item-section>
                </q-item>
                <q-separator color="orange" />
                <q-item>
                  <q-item-section>Total</q-item-section>
                  <q-item-section avatar>{{ total_bill }}</q-item-section>
                  <q-item-section avatar></q-item-section>
                </q-item>
              </q-list>
            </small>
            <br />
            <q-btn-group spread rounded>
              <q-btn
                v-if="hasPermission(auth_store?.user?.user?.roles)"
                size="sm"
                color="primary"
                label="Sale"
                icon="grain"
                @click="openSaleProductDialog"
              />
              <q-btn
                size="sm"
                color="orange"
                label="Hold Bill"
                icon="pan_tool"
                @click="holdBill"
                :loading="loadSaleButton"
              />
            </q-btn-group>
            <hr />
            <q-btn
              color="primary"
              flat
              class="full-width"
              label="Print Bill"
              icon="print"
              @click="printBill"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Product Quantity dialog -->
    <q-dialog v-model="productQuantity" persistent>
      <q-card style="width: 500px">
        <q-toolbar>
          <div class="text-h6">
            <q-icon name="bubble_chart" /> {{ selected_product.name }}
          </div>
          <q-space />
          <small
            ><q-badge>{{ selected_product.measurement }}</q-badge></small
          >
        </q-toolbar>

        <q-card-section class="q-pt-none">
          <q-input
            autofocus
            outlined
            dense
            label="Product Quantity"
            v-model="product_quantity"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
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
            v-if="product_quantity"
            flat
            label="Add Product"
            color="primary"
            @click="addToSelectedProductsList"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
              dense
              color="blue"
              depressed
              :class="`${!expected_price ? 'actual_selling_price' : ''}`"
              @click="expected_price = !expected_price"
              :label="`Expected Selling Price : ${total_bill}`"
          /></small>
        </q-toolbar>

        <q-card-section class="q-pt-none">
          <q-input
            v-if="!expected_price && payment_mode_uuid.name !== 'Mpesa & Cash'"
            autofocus
            outlined
            dense
            label="Actual Selling Price"
            v-model="selling_price"
            class="q-pa-xs col-xs-12 col-sm-6 col-md-6 q-mb-sm"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
          />

          <q-select
            v-if="selling_price && selling_price > 0"
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

          <div v-if="payment_mode_uuid.name === 'Debt'" class="q-pt-sm">
            <q-select
              outlined
              clearable
              dense
              v-model="debtor"
              use-input
              input-debounce="0"
              label="Select debtor"
              :options="options"
              option-value="uuid"
              option-label="name"
              @filter="filterFn"
              behavior="menu"
              @onchange="$emit('selectDebtor', picked_data)"
              hint="Type in debtor name to filter..."
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    <q-btn
                      size="sm"
                      outline
                      label="No results? CLick here to create new debtor."
                      to="/debtors"
                      color="primary"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
            v-if="selling_price && payment_mode_uuid"
            flat
            label="Sale"
            color="primary"
            @click="addNewSale"
            :loading="loadSaleButton"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
// File and Library imports
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useQuery, useQueryClient } from "vue-query";
import moment from "moment";
import { product_columns } from "src/utilities/columns/product_columns";
import { useAuthStore } from "src/stores/auth-store";
import { useProductStore } from "src/stores/product-store";
import { usePaymentModeStore } from "src/stores/payment-mode-store";
import { useSaleStore } from "src/stores/sale-store";
import { useDebtorStore } from "src/stores/debtor-store";
import { useOperationStore } from "src/stores/operation-store";
import { hasPermission } from "src/utilities/helpers";
import { exportDataToPdf } from "src/utilities/receipt";

const auth_store = useAuthStore();
const router = useRouter();

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const product_store = useProductStore();
const payment_mode_store = usePaymentModeStore();
const sale_store = useSaleStore();
const debtor_store = useDebtorStore();
const operation_store = useOperationStore();
const loadSaleButton = ref(false);

// Local variables
const saleProduct = ref(false);
const productQuantity = ref(false);
const expected_price = ref(true);
const filter = ref("");
const product_quantity = ref(1);
const selling_price = ref(1);
const both_mpesa = ref(1);
const both_cash = ref(1);
const debtor = ref("");
const payment_mode_uuid = ref("");
const product_id = ref("");
const errorMsg = ref("");
const dupError = ref("");

const selected_product = ref("");

let selected_products = operation_store.selected_products;

// Vue query initial data load - Get products method
const {
  data: products,
  isLoading,
  isError,
} = useQuery("products", () => product_store.fetchProducts());

const { data: payment_modes } = useQuery("payment_modes", () =>
  payment_mode_store.fetchPaymentModes()
);

let stringOptions = [];

const { data: debtors } = useQuery(
  "debtors",
  () => debtor_store.fetchDebtors(),
  {
    onSuccess: (data) => {
      stringOptions = data.map((el) => {
        return {
          name: el.name,
          uuid: el.uuid,
        };
      });
    },
  }
);

const options = ref(stringOptions);

const picked_data = ref(null);

const filterFn = (val, update) => {
  if (val === "") {
    update(() => {
      options.value = stringOptions;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    options.value = stringOptions.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

const openProductDialog = (data) => {
  if (data.quantity < 1) {
    errorMsg.value = `${data.name} quantity is zero. Add more from INVENTORIES.`;
    dupError.value = `${data.name} quantity is zero. Add more from INVENTORIES.`;
    notifyUser(
      `${data.name} quantity is zero. Add more from INVENTORIES`,
      "red",
      "top"
    );
  } else {
    errorMsg.value = "";
    dupError.value = "";
    if (selected_products.some((val) => val.name == data.name)) {
      errorMsg.value =
        "Product already added to the bill! Select a different product.";
      dupError.value =
        "Product already added to the bill! Select a different product.";
      notifyUser(`${data.name} already added to the bill!`, "red", "top");
    } else {
      productQuantity.value = true;
      selected_product.value = data;
    }
  }
};

const openSaleProductDialog = () => {
  saleProduct.value = true;
};

const closeSelectedProductDialog = () => {
  productQuantity.value = false;
  selected_product.value = "";
  product_quantity.value = 1;
};

const addToSelectedProductsList = () => {
  if (product_quantity.value > selected_product.value.quantity) {
    errorMsg.value = `${product_quantity.value} is more than the maximum available quantity`;
    notifyUser(
      `${product_quantity.value} is more than the maximum available quantity`,
      "red",
      "top"
    );
  } else {
    const prod = {
      uuid: selected_product.value.uuid,
      name: selected_product.value.name,
      price: selected_product.value.selling_price,
      quantity: product_quantity.value,
    };

    selected_products.push(prod);
    notifyUser(`${selected_product.value.name} added to cart!`, "green", "top");
    productQuantity.value = false;
    selected_product.value = "";
    product_quantity.value = 1;
  }
};

const total_bill = computed(() => {
  let total = 0;
  selected_products.forEach((val) => {
    total += val.quantity * val.price;
  });
  return total;
});

const removeAddedProduct = (index) => selected_products.splice(index, 1);

const clearProductList = () => {
  const clear = confirm("Are you sure?");
  if (clear) selected_products.splice(0, selected_products.length);
};

// Create new product method
const addNewSale = async () => {
  loadSaleButton.value = true;
  let prods = [];
  selected_products.forEach((val) =>
    prods.push({
      name: val.name,
      quantity: val.quantity,
      uuid: val.uuid,
    })
  );

  const finItem = {
    products: prods,
    payment_mode_uuid: payment_mode_uuid.value.uuid,
    bill_status: "sold",
    debtor_uuid: debtor.value.uuid,
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
      finItem.actual_selling_price = Number(selling_price.value);
    }
  }

  if (finItem.selling_price && finItem.payment_mode_uuid) {
    if (payment_mode_uuid.value.name === "Debt" && !debtor.value) {
      alert("Debtor name is required.");
      errorMsg.value = "Debtor name is required.";
      loadSaleButton.value = false;
    } else {
      const res = await sale_store.createSaleOperation(finItem);

      if (res.status === "success") {
        // send_push_notification({
        //   title: "A sale has been made",
        //   mode: payment_mode_uuid.value.name,
        //   amount: finItem.actual_selling_price,
        // });
        queryClient.refetchQueries("finished_products");
        payment_mode_uuid.value = "";
        product_quantity.value = "";
        debtor.value = "";
        saleProduct.value = false;
        selected_products.splice(0, selected_products.length);
        loadSaleButton.value = false;
        router.push("/bills");
        notifyUser(res.message, "green", "top");
      } else {
        errorMsg.value = res.message;
        notifyUser(res.message, "red", "top-right");
      }
    }
  } else {
    errorMsg.value = "Name is required!";
    notifyUser("Name is required!", "red", "top-right");
  }
};

const holdBill = async () => {
  loadSaleButton.value = true;
  let prods = [];

  const hold_bill = confirm("Are you sure?");
  if (hold_bill) {
    selected_products.forEach((val) =>
      prods.push({
        name: val.name,
        quantity: val.quantity,
        uuid: val.uuid,
      })
    );

    const finItem = {
      products: prods,
    };

    if (finItem?.products?.length) {
      const res = await sale_store.createHoldBillOperation(finItem);
      if (res.status === "success") {
        queryClient.refetchQueries("products");
        payment_mode_uuid.value = "";
        product_quantity.value = "";
        saleProduct.value = false;
        selected_products.splice(0, selected_products.length);
        loadSaleButton.value = false;
        router.push("/bills");
        notifyUser(res.message, "green", "top");
      } else {
        errorMsg.value = res.message;
        notifyUser(res.message, "red", "top-right");
      }
    } else {
      errorMsg.value = "Name is required!";
      notifyUser("Name is required!", "red", "top-right");
    }
  }
};

// Close Add/Edit dialog
const closeSaleProductDialog = () => {
  saleProduct.value = false;
  product_quantity.value = "";
  product_id.value = "";
  errorMsg.value = "";
};

// Shared notification method
const notifyUser = (message, color, position) => {
  $q.notify({
    message,
    color,
    position,
  });
};

const printBill = () => {
  const print_data = [];
  selected_products.forEach((val) => {
    print_data.push({
      name: val.name,
      quantity: val.quantity,
      price: Number(val.price),
      total: Number(val.quantity) * Number(val.price),
    });
  });

  const receipt_data = {
    title: "Sales Receipt",
    bill_ref: "New Bill",
    created_at: moment().format("MM ddd, YYYY HH:mm:ss a"),
    status: "Pending Payment",
    user: auth_store?.user?.user?.name,
    payment_mode: "No Payment Mode",
    actual_selling_price: print_data.reduce((a, b) => a + b.total, 0),
    debtor_name: "No Debtor",
  };

  exportDataToPdf(
    print_data,
    ["name", "quantity", "price", "total"],
    receipt_data
  );
};
</script>

<style scope>
.error_msg {
  color: red;
}

.minQty {
  /* border: 3px solid red; */
  /* color: #fff; */
  animation: blinkingBackground 3s infinite;
}

/* .blink-bg {
  color: #fff;
  animation: blinkingBackground 5s infinite;
} */
@keyframes blinkingBackground {
  0% {
    border: 3px solid rgb(4, 187, 187);
  }
  25% {
    border: 5px solid teal;
  }
  50% {
    border: 7px solid red;
  }
  75% {
    border: 5px solid teal;
  }
  100% {
    border: 3px solid rgb(4, 187, 187);
  }
}

.selected_product {
  cursor: pointer;
}

.selected_product:hover {
  background-color: rgb(144, 215, 236);
}

.select_list {
  cursor: pointer;
}

.bill {
  background-color: #017951;
  color: white;
}
.actual_selling_price {
  text-decoration: line-through;
}
</style>
