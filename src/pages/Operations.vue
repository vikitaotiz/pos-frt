<template>
  <div class="q-pa-md">
    <div class="row" style="overflow: hidden">
      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-8" style="overflow: auto">
        <!-- Render products table -->
        <small style="color: red">{{ dupError }}</small>
        <div v-if="isLoading">Loading products...</div>
        <div v-else-if="isError">An error has occurred: {{ isError }}</div>
        <q-table
          v-else
          title="Make Sale (All Products)"
          :rows="products"
          :columns="product_columns"
          v-model:pagination="pagination"
          separator="cell"
          row-key="name"
          :filter="filter"
          dense
          grid
        >
          <template v-slot:item="props">
            <div
              class="q-pa-xs col-xs-12 col-sm-6 col-md-3"
              @click="openProductDialog(props.row)"
            >
              <q-card bordered class="selected_product">
                <q-card-section class="text-center">
                  <strong style="color: #017951">{{ props.row.name }}</strong>
                  <hr />
                  <small
                    ><i>Category: {{ props.row.category }}</i></small
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
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4"
        style="overflow: auto"
      >
        <q-card bordered>
          <q-card-actions
            ><i>New Bill</i> <q-space /><span style="color: orange"
              >(Items: {{ selected_products.length }})</span
            ></q-card-actions
          >

          <q-card-section>
            <q-list bordered separator dense class="bill">
              <q-item>
                <q-item-section>Name</q-item-section>
                <q-item-section side style="color: white"
                  >Quantity</q-item-section
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
            <br />
            <q-list bordered separator dense>
              <q-item
                v-for="(prod, index) in selected_products"
                :key="prod.uuid"
              >
                <q-item-section>{{ prod.name }}</q-item-section>
                <q-item-section side>{{ prod.quantity }}</q-item-section>
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
            </q-list>
            <br />
            <q-btn-group spread rounded>
              <q-btn
                dense
                color="primary"
                label="Sale"
                icon="dashboard"
                @click="openSaleProductDialog"
              />
              <q-btn
                dense
                color="orange"
                label="Hold Bill"
                icon="dashboard"
                @click="holdBill"
              />
            </q-btn-group>
            <hr />
            <q-btn
              color="primary"
              flat
              dense
              class="full-width"
              label="Print Bill"
              icon="download"
              @click="printBill"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Product Quantity dialog -->
    <q-dialog v-model="productQuantity" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">Sale : {{ selected_product.name }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            autofocus
            outlined
            dense
            label="Product Quantity"
            v-model="product_quantity"
            type="number"
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
        <q-card-section>
          <div class="text-h6">Make Payment</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            autofocus
            outlined
            dense
            label="Selling Price"
            v-model="selling_price"
            class="q-mb-sm"
            type="number"
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
            label="Sale Product(s)"
            color="primary"
            @click="addNewSale"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
// File and Library imports
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useQuery, useQueryClient } from "vue-query";
import { product_columns } from "src/utilities/columns/product_columns";
import { paginations } from "src/utilities/paginations";
import { useProductStore } from "src/stores/product-store";
import { usePaymentModeStore } from "src/stores/payment-mode-store";
import { useSaleStore } from "src/stores/sale-store";
import print from "print-js";
import { useRouter } from "vue-router";

const router = useRouter();

// Global and store initialization
const $q = useQuasar();
// const queryClient = useQueryClient();
const product_store = useProductStore();
const payment_mode_store = usePaymentModeStore();
const sale_store = useSaleStore();
const pagination = paginations(10);

// Local variables
const saleProduct = ref(false);
const productQuantity = ref(false);
const filter = ref("");
const product_quantity = ref(0);
const selling_price = ref(0);
const payment_mode_uuid = ref("");
const product_id = ref("");
const errorMsg = ref("");
const dupError = ref("");

const selected_product = ref("");
const selected_products = ref([]);

// Vue query initial data load - Get products method
const {
  data: products,
  isLoading,
  isError,
} = useQuery("products", () => product_store.fetchProducts());

const { data: payment_modes } = useQuery("payment_modes", () =>
  payment_mode_store.fetchPaymentModes()
);

const openProductDialog = (data) => {
  errorMsg.value = "";
  dupError.value = "";

  if (selected_products.value.some((val) => val.name == data.name)) {
    errorMsg.value =
      "Product already added to the bill! Select a different product.";

    dupError.value =
      "Product already added to the bill! Select a different product.";
    notifyUser(`${data.name} already added to the bill!`, "red", "top");
  } else {
    productQuantity.value = true;
    selected_product.value = data;
  }
};

const openSaleProductDialog = () => {
  saleProduct.value = true;
};

const closeSelectedProductDialog = () => {
  productQuantity.value = false;
  selected_product.value = "";
  product_quantity.value = "";
};

const addToSelectedProductsList = () => {
  const prod = {
    uuid: selected_product.value.uuid,
    name: selected_product.value.name,
    quantity: product_quantity.value,
  };

  selected_products.value.push(prod);
  notifyUser(`${selected_product.value.name} added to cart!`, "green", "top");
  productQuantity.value = false;
  selected_product.value = "";
  product_quantity.value = "";
};

const removeAddedProduct = (index) => selected_products.value.splice(index, 1);

const clearProductList = () => {
  const clear = confirm("Are you sure?");
  if (clear) selected_products.value = [];
};

// Create new product method
const addNewSale = async () => {
  let prods = [];
  selected_products.value.forEach((val) =>
    prods.push({
      name: val.name,
      quantity: val.quantity,
      uuid: val.uuid,
    })
  );

  const finItem = {
    products: prods,
    selling_price: selling_price.value.trim(),
    payment_mode_uuid: payment_mode_uuid.value.uuid,
    bill_status: "sold",
  };

  if (finItem.selling_price) {
    const res = await sale_store.createSaleOperation(finItem);

    if (res.status === "success") {
      // queryClient.refetchQueries("products");
      payment_mode_uuid.value = "";
      product_quantity.value = "";
      saleProduct.value = false;
      selected_products.value = [];
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
};

const holdBill = async () => {
  let prods = [];
  selected_products.value.forEach((val) =>
    prods.push({
      name: val.name,
      quantity: val.quantity,
      uuid: val.uuid,
    })
  );

  const finItem = {
    products: prods,
  };

  console.log(finItem);

  if (finItem?.products?.length) {
    const res = await sale_store.createHoldBillOperation(finItem);

    if (res.status === "success") {
      // queryClient.refetchQueries("products");
      payment_mode_uuid.value = "";
      product_quantity.value = "";
      saleProduct.value = false;
      selected_products.value = [];
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
  print({
    printable: selected_products.value,
    properties: ["name", "quantity"],
    type: "json",
    gridHeaderStyle: "color: red;  border: 2px solid #3971A5;",
    gridStyle: "border: 2px solid #3971A5;",
  });
};
</script>

<style scope>
.error_msg {
  color: red;
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
</style>
