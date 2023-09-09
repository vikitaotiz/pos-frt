<template>
  <div class="q-pa-md">
    <q-card dark class="bg-primary q-mb-sm">
      <q-toolbar
        ><q-btn
          dense
          flat
          icon="arrow_back"
          label="Back"
          @click="$router.back()"
        /><q-space />{{ timeframe }}<q-space />
        <q-btn-group unelevated>
          <q-btn
            unelevated
            v-if="reset_btn"
            icon="autorenew"
            size="sm"
            color="orange"
            label="Reset"
            @click="
              () => {
                timeframe = 'Today';
                queryClient.refetchQueries('inventories');
                reset_btn = false;
              }
            "
          />
          <q-btn
            unelevated
            icon="event"
            size="sm"
            color="indigo"
            label="Calendar (Older Inventories)"
            @click="openDatePicker()"
          />
        </q-btn-group>
      </q-toolbar>
    </q-card>
    <!-- Render inventories table -->
    <div v-if="isLoading">Loading inventories...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Purchases/Inventories"
      :rows="inventories"
      :columns="inventory_columns"
      separator="cell"
      row-key="name"
      :filter="filter"
      dense
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="product" :props="props">
            {{ props.row.product }}
          </q-td>

          <q-td key="buying_price" :props="props">
            {{ props.row.buying_price }}
          </q-td>

          <q-td key="quantity" :props="props">
            {{ props.row.quantity }}
          </q-td>

          <q-td key="total" :props="props">
            {{ props.row.total }}
          </q-td>

          <q-td key="measurement" :props="props">
            {{ props.row.measurement }}
          </q-td>

          <q-td key="department" :props="props">
            {{ props.row.department }}
          </q-td>

          <q-td key="user" :props="props">
            {{ props.row.user }}
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td
            key="actions"
            :props="props"
            v-if="hasPermission(auth_store?.user?.user?.roles)"
          >
            <q-icon
              color="blue"
              name="edit"
              @click="openEditInventoryDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteInventory(props.row)"
              style="cursor: pointer"
              size="20px"
            />
          </q-td>
        </q-tr>
      </template>

      <template v-slot:top-right>
        <q-input
          borderless
          dense
          outlined
          rounded
          debounce="300"
          v-model="filter"
          placeholder="Search"
          class="q-mr-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn-group v-if="hasPermission(auth_store?.user?.user?.roles)">
          <q-btn
            @click="openAddNewInventoryDialog"
            dense
            color="primary"
            icon="add"
            label="Add"
          />

          <q-btn
            dense
            flat
            color="primary"
            icon-right="archive"
            label="Export"
            class="q-ml-sm"
            no-caps
            @click="exportExcel(inventories)"
          />
        </q-btn-group>
      </template>
    </q-table>

    <!-- Update Actual Quantity -->
    <q-dialog v-model="editInventory" persistent>
      <q-card style="width: 500px">
        <q-toolbar
          >{{ form_title }}
          <q-space />
          <small>
            <q-badge>Total: {{ quantity * buying_price }}</q-badge>
          </small>
        </q-toolbar>
        <q-card-section>
          <q-input
            dense
            outlined
            v-model="quantity"
            label="Actual Quantity"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            dense
            outlined
            v-model="buying_price"
            label="Buying Price"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
          />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            flat
            label="Edit Inventory"
            color="primary"
            @click="editSelectedInventory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Inventory dialog -->
    <q-dialog v-model="addEditInventory" persistent>
      <q-card style="width: 600px">
        <q-toolbar>
          <div class="text-h6">{{ form_title }}</div>
          <q-space />
          <small
            ><i>Total: {{ quantity * buying_price }}</i></small
          >
          <q-space />
          <small v-if="inventory.product_id">
            <q-badge class="q-mr-sm"
              >Measurement: {{ inventory.product_id.measurement }}</q-badge
            >
            <q-badge
              >Available Quantity: {{ inventory.product_id.quantity }}</q-badge
            >
            <br /><q-badge
              >Previous Buying Price:
              {{ inventory.product_id.buying_price }}</q-badge
            >
          </small>
        </q-toolbar>

        <q-card-section>
          <q-select
            outlined
            clearable
            dense
            v-model="inventory.product_id"
            use-input
            input-debounce="0"
            label="Select Product"
            :options="options"
            option-value="uuid"
            option-label="name"
            @filter="filterFn"
            behavior="menu"
            hint="Type in product name to filter..."
          >
            <template v-slot:option="scope">
              <q-item dense v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label
                    >{{ scope.opt.name }} :
                    <small
                      ><q-badge color="orange"
                        >Available Qty: {{ scope.opt.quantity }}</q-badge
                      ></small
                    ></q-item-label
                  >
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  <q-btn
                    size="sm"
                    outline
                    label="No results? CLick here to create new product."
                    to="/products"
                    color="primary"
                  />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-section>
          <q-input
            dense
            outlined
            v-model="quantity"
            label="Product Quantity"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            dense
            outlined
            v-model="buying_price"
            label="Buying Price (Per Unit)"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
          />
        </q-card-section>

        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="inventory.product_id && !edit_inventory"
            flat
            label="Add Inventory"
            color="primary"
            @click="addNewInventory"
            :loading="loadingInventoryBtn"
          />

          <q-btn
            v-if="inventory.product_id && edit_inventory"
            flat
            label="Edit Inventory"
            color="primary"
            @click="editSelectedInventory"
            :loading="loadingInventoryBtn"
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
            label="Fetch Inventories"
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
// File and Library imports
import { reactive, ref } from "vue";
import { exportFile, useQuasar } from "quasar";
import { useMutation, useQuery, useQueryClient } from "vue-query";
import moment from "moment";
import { inventory_columns } from "src/utilities/columns/inventory_columns";
import { useInventoryStore } from "src/stores/inventory-store";
import { useProductStore } from "src/stores/product-store";
import { exportTable } from "src/utilities/excel";
import { useAuthStore } from "src/stores/auth-store";
import { hasPermission } from "src/utilities/helpers";

const auth_store = useAuthStore();
// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const inventory_store = useInventoryStore();
const product_store = useProductStore();

// Local variables
const reset_btn = ref(false);
const addEditInventory = ref(false);
const loadingInventoryBtn = ref(false);
const editInventory = ref(false);
const edit_inventory = ref(false);
const filter = ref("");
const form_title = ref("");
const quantity = ref(1);
const buying_price = ref(1);

const inventory = reactive({
  product_id: "",
  measurement_id: "",
});

const inventory_id = ref("");
const errorMsg = ref("");
let stringOptions = [];
const timeframe = ref("Today");
const date = ref("2019/03/01");
const dateRange = ref("2019/03/01");

const max_date = new Date().toISOString().split("T")[0];

const bills_date = reactive({
  from: "",
  to: "",
});

const openDatePicker = () => (datePicker.value = true);

const datePicker = ref(false);

// Vue query initial data load - Get inventories method
const inventories = ref([]);
const { isLoading, isError } = useQuery(
  "inventories",
  () => inventory_store.fetchInventories(),
  {
    onSuccess: (dat) => {
      inventories.value = [];
      dat?.forEach((el) => {
        const res = {
          product: el.product,
          buying_price: el.buying_price,
          quantity: el.quantity,
          total: el.total,
          measurement: el.measurement,
          department: el.department,
          user: el.user,
          created_at: el.created_at,
        };

        inventories.value.push(res);
      });
    },
  }
);

const { data: products } = useQuery(
  "products",
  () => product_store.fetchProducts(),
  {
    onSuccess: (data) => {
      stringOptions = data.map((el) => {
        return {
          name: el.name,
          uuid: el.uuid,
          quantity: el.quantity,
          measurement: el.measurement,
          buying_price: el.buying_price,
        };
      });
    },
  }
);

const options = ref(stringOptions);

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

// Delete inventory method
const deleteInventory = async (inventory) => {
  const del = confirm(
    `Continue with the operation. Delete ${inventory.name} ?`
  );
  if (del) {
    const res = await inventory_store.deleteInventory({ uuid: inventory.uuid });
    if (res.status === "success") {
      queryClient.refetchQueries("inventories");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new inventory dialog
const openAddNewInventoryDialog = () => {
  if (product_store.products.length === 0) {
    notifyUser(
      "You need to create at least one PRODUCT in order to create inventories!",
      "orange",
      "top"
    );
  } else {
    form_title.value = "Create Inventory";
    addEditInventory.value = true;
    edit_inventory.value = false;
  }
};

// Trigger edit inventory dialog
const openEditInventoryDialog = (inventory) => {
  quantity.value = inventory.quantity;
  buying_price.value = inventory.buying_price;
  form_title.value = `Update Actual Quantity for  ${inventory.product}`;
  inventory_id.value = inventory;
  editInventory.value = true;
};

// Create new inventory method
const addNewInventory = async () => {
  loadingInventoryBtn.value = true;
  errorMsg.value = "";

  const inven = {
    product_uuid: inventory.product_id.uuid,
    measurement_name: inventory.product_id.measurement,
    quantity: quantity.value,
    buying_price: buying_price.value,
  };

  if (
    inven.product_uuid &&
    inven.measurement_name &&
    inven.quantity &&
    inven.buying_price
  ) {
    const res = await inventory_store.createInventory(inven);

    if (res.status === "success") {
      queryClient.refetchQueries("inventories");
      queryClient.refetchQueries("finished_products");

      inventory.product_id = "";
      inventory.measurement_id = "";
      quantity.value = 1;
      inventory.buying_price = 1;

      addEditInventory.value = false;
      loadingInventoryBtn.value = false;

      notifyUser(res.message, "green", "top");
    } else {
      errorMsg.value = res.message;
      notifyUser(res.message, "red", "top-right");
    }
  } else {
    loadingInventoryBtn.value = false;

    errorMsg.value = "Product, Quantity and Buying Price are required!";
    notifyUser(
      "Product, Quantity and Buying Price are required!",
      "red",
      "top-right"
    );
  }
};

// Edit inventory method
const editSelectedInventory = async () => {
  loadingInventoryBtn.value = true;

  const dt = {
    quantity: Number(quantity.value),
    buying_price: Number(buying_price.value),
    inventory_uuid: inventory_id.value.uuid,
  };

  if (dt.quantity && dt.buying_price) {
    const res = await inventory_store.updateInventory(dt);

    if (res.status === "success") {
      queryClient.refetchQueries("inventories");
      quantity.value = 1;
      buying_price.value = 1;
      addEditInventory.value = false;
      editInventory.value = false;
      edit_inventory.value = false;
      form_title.value = "";
      loadingInventoryBtn.value = false;

      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  } else {
    loadingInventoryBtn.value = false;

    errorMsg.value = "Quantity and Buying price are required!";
    notifyUser("Quantity and Buying price are required!", "red", "top-right");
  }
};

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
    ).format("DD-MM-YYYY")} - ${moment(bills_date.to).format("DD-MM-YYYY")}`,
    boxClass: "bg-indigo text-white",
    spinnerColor: "white",
  });
};

const { mutate } = useMutation(
  (data) => inventory_store.fetchInventoriesInDateRange(data),
  {
    onSuccess: (data) => {
      timeframe.value = `(From: ${moment(bills_date.from).format(
        "DD-MM-YYYY"
      )} - To: ${moment(bills_date.to).format("DD-MM-YYYY")}). ${
        data?.data?.length
      } Records. Total Amount: ${data?.data?.reduce((a, b) => a + b.total, 0)}`;
      $q.loading.hide();
      reset_btn.value = true;

      inventories.value = [];
      data?.data?.forEach((el) => {
        const res = {
          product: el.product,
          buying_price: el.buying_price,
          quantity: el.quantity,
          total: el.total,
          measurement: el.measurement,
          department: el.department,
          user: el.user,
          created_at: el.created_at,
        };

        inventories.value.push(res);
      });
    },
  }
);

// Close Add/Edit dialog
const closeAddEditDialog = () => {
  addEditInventory.value = false;
  editInventory.value = false;
  inventory.product_id = "";
  quantity.value = 1;
  buying_price.value = 1;
  inventory_id.value = "";
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

// Export to excel
const exportExcel = (inventories) => {
  const dt = inventories.map((val) => {
    return {
      name: val.name,
      inventories: val.inventories.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, inventory_columns, exportFile, $q, "InventoriesData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
