<template>
  <div class="q-pa-md">
    <q-card dark class="bg-primary">
      <q-toolbar
        ><q-btn
          dense
          flat
          icon="arrow_back"
          label="Back"
          @click="$router.back()"
        /><q-space />
        <span>
          <q-btn
            unelevated
            class="q-ma-xs"
            icon="list"
            size="sm"
            color="green"
            label="All Bills"
            @click="() => queryClient.refetchQueries('bills')"
          />
          <q-btn
            unelevated
            class="q-ma-xs"
            icon="timeline"
            size="sm"
            color="blue"
            label="Sold Bills"
            @click="bills = bills_data?.filter((val) => val.status === 'sold')"
          />
          <q-btn
            unelevated
            class="q-ma-xs"
            icon="pan_tool"
            size="sm"
            color="brown"
            label="Pending Bills"
            @click="
              bills = bills_data?.filter((val) => val.status === 'pending')
            "
          />
          <q-btn
            unelevated
            class="q-ma-xs"
            icon="pan_tool"
            size="sm"
            color="orange"
            label="Clear Bills"
            to="/clear_bills"
          />
          <q-btn
            unelevated
            class="q-ma-xs"
            icon="event"
            size="sm"
            color="indigo"
            label="Calendar (Older Bills)"
            @click="openDatePicker()"
          />
        </span>
      </q-toolbar>
    </q-card>
    <div v-if="isLoading">Loading bills...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      grid
      flat
      bordered
      :title="`Sold/Pending Bills ${timeframe}`"
      :rows="bills"
      row-key="bill_ref"
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-input
          dense
          debounce="300"
          outlined
          v-model="filter"
          placeholder="Search bill number"
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
            style="border-radius: 8px"
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
            <q-card-section style="padding: 2px">
              <q-toolbar v-if="props.row.status === 'pending'">
                <strong> Created by : {{ props.row.user }}</strong>
                <q-space />
                <q-btn-group flat>
                  <q-btn
                    outline
                    rounded
                    size="sm"
                    color="blue"
                    icon="add"
                    @click="openProductQuantityDialog(props.row)"
                  >
                    <q-tooltip> Add More Items to this bill. </q-tooltip></q-btn
                  >
                  <q-btn
                    v-if="hasPermission(auth_store?.user?.user?.roles)"
                    size="sm"
                    outline
                    rounded
                    color="red"
                    icon="delete"
                    @click="removeSelectedBill(props.row)"
                    :loading="loadingSaleBtn"
                  >
                    <q-tooltip> Delete this bill </q-tooltip></q-btn
                  >
                </q-btn-group>
              </q-toolbar>
              <div v-else class="text-center">
                <strong> Created by : {{ props.row.user }}</strong>
                <q-space />
              </div>
              <q-separator class="q-mb-sm" />

              <div class="text-center">
                <small>Created On : {{ props.row.created_at }}</small> <br />
                <small
                  ><q-badge
                    v-if="props.row.payment_mode === 'Debt'"
                    color="blue"
                    >Status : {{ props.row.status }} <br />
                    Mode : {{ props.row.payment_mode }}</q-badge
                  >
                  <q-badge
                    v-else
                    :color="`${props.row.status == 'pending' ? 'red' : ''}`"
                    >Status : {{ props.row.status }} <br />
                    Mode : {{ props.row.payment_mode }}</q-badge
                  >
                </small>
              </div>
              <q-separator class="q-mb-sm" />

              <small>
                <q-list
                  dense
                  bordered
                  separator
                  :class="`${
                    props.row.payment_mode === 'Debt' ? 'debt_bill' : 'bill'
                  }`"
                >
                  <q-item>
                    <q-item-section>Name</q-item-section>
                    <q-item-section>Price</q-item-section>
                    <q-item-section style="color: white"
                      >Quantity</q-item-section
                    >
                    <q-item-section style="color: white">Total</q-item-section>
                    <q-item-section
                      v-if="
                        hasPermission(auth_store?.user?.user?.roles) &&
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

                    <q-item-section
                      v-if="
                        hasPermission(auth_store?.user?.user?.roles) &&
                        props.row.status === 'pending' &&
                        props.row.sales.length > 1
                      "
                    >
                      <q-icon
                        name="delete"
                        size="xs"
                        color="red"
                        @click="removeProductFromSelectedBill(prod)"
                        style="cursor: pointer"
                      >
                        <q-tooltip>
                          Return/Remove {{ prod.name }} from this bill
                        </q-tooltip></q-icon
                      >
                    </q-item-section>
                  </q-item>
                </q-list>
              </small>
            </q-card-section>
            <q-separator />
            <q-card-section
              class="text-center"
              v-if="props.row.selling_price > 0"
            >
              <p v-if="props.row.payment_mode === 'Debt'">
                Debtor: {{ props.row.debtor_name }} <br />
                <b>Amount due Ksh {{ props.row.selling_price }} </b>
              </p>
              <b v-else>Price Ksh {{ props.row.selling_price }} </b>
              <p v-if="props.row.debt_records?.length > 0">
                <q-btn
                  flat
                  size="sm"
                  label="Click to View Payment History"
                  color="orange"
                  @click="openPaymentHistory(props.row)"
                />
              </p>
              <hr />
            </q-card-section>
            <q-card-section style="padding: 0">
              <q-btn
                v-if="props.row.status === 'sold'"
                class="full-width"
                dense
                flat
                @click="printBill(props.row)"
                label="Print Bill"
                icon="print"
                :color="`${
                  props.row.payment_mode === 'Debt' ? 'blue' : 'primary'
                }`"
              />

              <q-btn-group v-else class="full-width">
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
                  label="Sale"
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
    <q-dialog v-model="productQuantity" persistent>
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
                >Current Qty: {{ selected_product.quantity }}</q-badge
              >
              <br />
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
            v-if="product_quantity && selected_product"
            flat
            label="Add Product"
            color="primary"
            @click="addToSelectedProductsList"
            :loading="loadingSaleBtn"
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
            :options="payment_modes.filter((el) => el.name !== 'Debt')"
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
            label="Sale"
            color="primary"
            @click="addNewSale"
            :loading="loadingSaleBtn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="paymentHistoryDialog" persistent>
      <q-card>
        <q-toolbar class="bg-orange text-white q-mb-sm">
          <b>Payment History for BILL-{{ debt_records.bill_ref }}. </b>
          <q-space />
          <b>Name: {{ debt_records.debtor_name }}. </b>
        </q-toolbar>

        <q-card-section class="q-pt-none">
          <small>
            <table border="1" style="width: 100%; border-collapse: collapse">
              <tr>
                <th class="text-center q-pa-sm">Amount Paid</th>
                <th class="text-center q-pa-sm">Balance</th>
                <th class="text-center q-pa-sm">Mode</th>
                <th class="text-center q-pa-sm">Cleared By</th>
                <th class="text-center q-pa-sm">Cleared On</th>
              </tr>
              <tr v-for="rec in debt_records.debt_records" :key="rec.uuid">
                <td class="text-center q-pa-sm">{{ rec.amount_paid }}</td>
                <td class="text-center q-pa-sm">{{ rec.balance }}</td>
                <td class="text-center q-pa-sm">{{ rec.payment_mode }}</td>
                <td class="text-center q-pa-sm">{{ rec.user }}</td>
                <td class="text-center q-pa-sm">{{ rec.created_at }}</td>
              </tr>
            </table>
          </small>
        </q-card-section>

        <q-card-actions>
          <q-btn
            dense
            flat
            :label="`Total Paid: ${debt_records.total_debt_paid}`"
            color="primary"
            disabled
          />
          <q-space />
          <q-btn
            dense
            outline
            label="Close History"
            color="primary"
            @click="closePaymentHistory()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="datePicker" persistent>
      <q-card
        class="bg-indigo text-white text-center q-pa-sm"
        style="width: 300px"
      >
        <div class="text-center q-ma-sm">
          <b><q-icon name="events" /> Date Picker</b>
        </div>
        <q-separator color="white" />
        <q-card-section>
          <div>
            From :
            <input type="date" v-model="bills_date.from" :max="max_date" />
          </div>
          <br />
          <div v-if="bills_date.from">
            To :
            <input type="date" v-model="bills_date.to" :max="max_date" />
          </div>
        </q-card-section>
        <q-separator color="yellow" />
        <q-btn-group flat class="full-width">
          <q-btn dense label="Cancel" color="yellow" flat v-close-popup />
          <q-space />
          <q-btn
            v-if="bills_date.to"
            dense
            label="Fetch Bills"
            color="white"
            flat
            @click="submitDateRange"
            v-close-popup
          />
        </q-btn-group>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from "vue";
import { useQuasar } from "quasar";
import { useMutation, useQuery, useQueryClient } from "vue-query";
import { useSaleStore } from "src/stores/sale-store";
import { useProductStore } from "src/stores/product-store";
import { usePaymentModeStore } from "src/stores/payment-mode-store";
import { useAuthStore } from "src/stores/auth-store";
import { exportDataToPdf } from "src/utilities/receipt";
import { hasPermission } from "src/utilities/helpers";
// import ViewDebtPaymentHistory from "src/components/ViewDebtPaymentHistory.vue";
import moment from "moment";

const queryClient = useQueryClient();

const $q = useQuasar();
const auth_store = useAuthStore();

const date = ref("2019/03/01");
const dateRange = ref("2019/03/01");

const max_date = new Date().toISOString().split("T")[0];

const bills_date = reactive({
  from: "",
  to: "",
});

const openDatePicker = () => (datePicker.value = true);

const datePicker = ref(false);

const filter = ref("");
const sale_store = useSaleStore();
const product_store = useProductStore();
const payment_mode_store = usePaymentModeStore();

const productQuantity = ref(false);
const loadingSaleBtn = ref(false);
const paymentHistoryDialog = ref(false);
const debt_records = ref("");
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

const timeframe = ref("");

$q.loading.show({
  message: `Please Wait. Fetching today's bills`,
  boxClass: "bg-primary text-white",
  spinnerColor: "white",
});

const bills_data = ref([]);

// const { data: bills1 } = useQuery("bills", () => sale_store.fetchBills());
const { isLoading, isError } = useQuery(
  "bills",
  () => sale_store.fetchBills(),
  {
    onSuccess: (data) => {
      $q.loading.hide();
      timeframe.value = `(Today). ${data?.length} Records`;
      bills.value = data.map((val) => {
        return {
          user: val.user,
          uuid: val.uuid,
          bill_ref: val.bill_ref,
          debtor_name: val.debtor_name,
          total_debt_paid: val.total_debt_paid,
          debt_records: val.debt_records,
          status: val.status,
          payment_mode: val.payment_mode,
          selling_price: val.selling_price,
          actual_selling_price: val.actual_selling_price,
          created_at: val.created_at,
          sales: val.sales,
        };
      });

      bills_data.value = bills.value;
    },
  }
);

const submitDateRange = () => {
  date.value = dateRange.value;

  let beginningTime = moment(bills_date.from);
  let endTime = moment(bills_date.to);

  let date_data = {};

  if (parseInt(beginningTime.diff(endTime, "seconds")) >= 0) {
    date_data.from = bills_date.from;
    date_data.to = bills_date.to;
  } else {
    date_data.from = bills_date.to;
    date_data.to = bills_date.from;
  }

  mutate(date_data);
  $q.loading.show({
    message: `Please Wait. Fetching data between ${moment(
      bills_date.from
    ).format("DD-MM-YY")} - ${moment(bills_date.to).format("DD-MM-YY")}`,
    boxClass: "bg-indigo text-white",
    spinnerColor: "white",
  });
};

const { mutate } = useMutation(
  (data) => sale_store.fetchBillsInDateRange(data),
  {
    onSuccess: (data) => {
      timeframe.value = `(From: ${moment(bills_date.from).format(
        "DD-MM-YY"
      )} - To: ${moment(bills_date.to).format("DD-MM-YY")}). ${
        data?.data?.length
      } Records.`;
      $q.loading.hide();
      bills.value = data?.data?.map((val) => {
        return {
          user: val.user,
          uuid: val.uuid,
          bill_ref: val.bill_ref,
          debtor_name: val.debtor_name,
          total_debt_paid: val.total_debt_paid,
          debt_records: val.debt_records,
          status: val.status,
          payment_mode: val.payment_mode,
          selling_price: val.selling_price,
          actual_selling_price: val.actual_selling_price,
          created_at: val.created_at,
          sales: val.sales,
        };
      });
      bills_data.value = bills.value;
    },
  }
);

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

const { data: payment_modes } = useQuery("payment_modes", () =>
  payment_mode_store.fetchPaymentModes()
);

const filterOptions = ref(products.value);

const openProductQuantityDialog = (bill) => {
  selected_bill.value = bill;
  productQuantity.value = true;
};

const openPaymentHistory = (data) => {
  debt_records.value = data;
  paymentHistoryDialog.value = true;
};

const closePaymentHistory = () => {
  debt_records.value = "";
  paymentHistoryDialog.value = false;
};

const total_bill = computed(() => {
  let total = 0;
  selected_bill.value.sales.forEach((val) => {
    total += val.selling_price * val.quantity;
  });
  return total;
});

const openSaleProductDialog = (data) => {
  selected_bill.value = data;
  saleProduct.value = true;
};

const closeSelectedProductDialog = () => {
  errorMsg.value = "";
  productQuantity.value = false;
  selected_product.value = "";
  product_quantity.value = 1;
  errorMsg.value = "";
};

const addToSelectedProductsList = async () => {
  loadingSaleBtn.value = true;
  if (product_quantity.value > selected_product.value.quantity) {
    errorMsg.value = `${product_quantity.value} is more than the maximum available quantity`;
    notifyUser(
      `${product_quantity.value} is more than the maximum available quantity`,
      "red",
      "top"
    );
  } else {
    const res = await sale_store.addProductToBill({
      bill_uuid: selected_bill.value.uuid,
      uuid: selected_product.value.uuid,
      name: selected_product.value.name,
      selling_price: selected_product.value.price,
      quantity: product_quantity.value,
      product_uuid: selected_product.value.uuid,
    });

    if (res.status == "success") {
      queryClient.refetchQueries("bills");
      selected_bill.value = "";
      productQuantity.value = false;
      loadingSaleBtn.value = false;
      notifyUser(res.message, "green", "top");
    } else {
      loadingSaleBtn.value = false;
      selected_bill.value = "";
      productQuantity.value = false;
      notifyUser(res.message, "red", "top");
    }
  }
};

const closeSaleProductDialog = () => {
  saleProduct.value = false;
  payment_mode_uuid.value = "";
  errorMsg.value = "";
};

const removeProductFromSelectedBill = async (product) => {
  loadingSaleBtn.value = true;

  const del = confirm("Are you sure?");
  if (del) {
    const res = await sale_store.removeProductFromBill({
      product_uuid: product.uuid,
      product_name: product.name,
      quantity: product.quantity,
    });

    if (res.status == "success") {
      queryClient.refetchQueries("bills");
      loadingSaleBtn.value = false;
      notifyUser(res.message, "green", "top");
    } else {
      selected_bill.value = "";
      loadingSaleBtn.value = false;
      productQuantity.value = false;
      notifyUser(res.message, "red", "top");
    }
  }
};

const removeSelectedBill = async (bill) => {
  loadingSaleBtn.value = true;
  const del = confirm("Are you sure?");
  if (del) {
    const res = await sale_store.deleteBill({ bill_uuid: bill.uuid });

    if (res.status == "success") {
      queryClient.refetchQueries("bills");
      loadingSaleBtn.value = false;
      notifyUser(res.message, "green", "top");
    } else {
      loadingSaleBtn.value = false;
      selected_bill.value = "";
      productQuantity.value = false;
      notifyUser(res.message, "red", "top");
    }
  }
};

const addNewSale = async () => {
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
    products: prods,
    payment_mode_uuid: payment_mode_uuid.value.uuid,
    bill_status: "sold",
    debtor_name: debtor_name.value.trim(),
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

  if (finItem.actual_selling_price && finItem.payment_mode_uuid) {
    if (payment_mode_uuid.value.name === "Debt" && !debtor_name.value) {
      alert("Debtor name is required.");
      errorMsg.value = "Debtor name is required.";
      loadingSaleBtn.value = false;
    } else {
      const res = await sale_store.updateSaleOperation(finItem);

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
