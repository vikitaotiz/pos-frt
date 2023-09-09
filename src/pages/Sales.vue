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
        <q-btn-group>
          <q-btn
            v-if="reset_btn"
            icon="autorenew"
            size="sm"
            color="orange"
            label="Reset"
            @click="
              () => {
                timeframe = 'Today';
                queryClient.refetchQueries('sales');
                reset_btn = false;
              }
            "
          />
          <q-btn
            icon="event"
            size="sm"
            color="indigo"
            label="Calendar (Older Sales)"
            @click="openDatePicker()"
          />
        </q-btn-group>
      </q-toolbar>
    </q-card>
    <!-- Render sales table -->
    <div v-if="isLoading">Loading sales...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Products Sold"
      :rows="sales"
      :columns="sale_columns"
      separator="cell"
      row-key="name"
      :filter="filter"
      dense
    >
      <template v-slot:body="props">
        <q-tr
          :props="props"
          :class="`${props.row.status === 'pending' ? 'pending-sale' : ''}`"
        >
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>

          <q-td key="quantity" :props="props">
            {{ props.row.quantity }}
          </q-td>

          <q-td key="status" :props="props">
            {{ props.row.status }}
          </q-td>

          <q-td key="bill_ref" :props="props">
            <b>BILL-{{ props.row.bill_ref }}</b>
          </q-td>
          <q-td key="payment_mode" :props="props">
            {{ props.row.payment_mode }}
          </q-td>
          <q-td key="user" :props="props">
            {{ props.row.user }}
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <!-- <q-td key="actions" :props="props">
            <q-icon
              color="blue"
              name="edit"
              @click="openEditSaleDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteSale(props.row)"
              style="cursor: pointer"
              size="20px"
            />
          </q-td> -->
        </q-tr>
      </template>

      <template v-slot:top-right v-if="sales?.length > 0">
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

        <!-- <q-btn
          @click="openAddNewSaleDialog"
          round
          dense
          color="primary"
          size="small"
          icon="add"
        /> -->

        <q-btn
          dense
          flat
          color="primary"
          icon-right="archive"
          label="Export"
          class="q-ml-sm"
          no-caps
          @click="exportExcel(sales)"
        />
      </template>
    </q-table>

    <!-- Add/Edit Sale dialog -->
    <q-dialog v-model="addEditSale" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="sale_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="sale_name && !edit_sale"
            flat
            label="Add Sale"
            color="primary"
            @click="addNewSale"
          />

          <q-btn
            v-if="sale_name && edit_sale"
            flat
            label="Edit Sale"
            color="primary"
            @click="editSelectedSale"
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
            label="Fetch Sales"
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
import { sale_columns } from "src/utilities/columns/sale_columns";

import { useSaleStore } from "src/stores/sale-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const sale_store = useSaleStore();

// Local variables
const reset_btn = ref(false);
const addEditSale = ref(false);
const edit_sale = ref(false);
const filter = ref("");
const form_title = ref("");
const sale_name = ref("");
const sale_id = ref("");
const errorMsg = ref("");

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

// Vue query initial data load - Get sales method
const sales = ref([]);
const { isLoading, isError } = useQuery(
  "sales",
  () => sale_store.fetchSales(),
  {
    onSuccess: (dat) => {
      sales.value = [];

      dat?.forEach((el) => {
        const res = {
          name: el.name,
          quantity: el.quantity,
          status: el.status,
          bill_ref: el.bill_ref,
          payment_mode: el.payment_mode,
          user: el.user,
          created_at: el.created_at,
        };

        sales.value.push(res);
      });
    },
  }
);

// Delete sale method
const deleteSale = async (sale) => {
  const del = confirm(`Continue with the operation. Delete ${sale.name} ?`);
  if (del) {
    const res = await sale_store.deleteSale({ uuid: sale.uuid });
    if (res.status === "success") {
      queryClient.refetchQueries("sales");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// // Trigger add new sale dialog
// const openAddNewSaleDialog = () => {
//   form_title.value = "Add New Sale";
//   addEditSale.value = true;
//   edit_sale.value = false;
// };

// // Trigger edit sale dialog
// const openEditSaleDialog = (sale) => {
//   edit_sale.value = true;
//   form_title.value = `Edit ${sale.name}`;
//   sale_name.value = sale.name;
//   sale_id.value = sale.uuid;
//   addEditSale.value = true;
// };

// Create new sale method
// const addNewSale = async () => {
//   errorMsg.value = "";

//   if (sale_name.value.trim()) {
//     const res = await sale_store.createSale({
//       name: sale_name.value.trim(),
//     });
//     if (res.status === "success") {
//       queryClient.refetchQueries("sales");
//       sale_name.value = "";
//       addEditSale.value = false;

//       notifyUser(res.message, "green", "top");
//     } else {
//       errorMsg.value = res.message;
//       notifyUser(res.message, "red", "top-right");
//     }
//   } else {
//     errorMsg.value = "Name is required!";
//     notifyUser("Name is required!", "red", "top-right");
//   }
// };

// Edit sale method
// const editSelectedSale = async () => {
//   const dt = {
//     name: sale_name.value.trim(),
//     uuid: sale_id.value,
//   };

//   if (dt.name) {
//     const res = await sale_store.updateSale(dt);
//     if (res.status === "success") {
//       queryClient.refetchQueries("sales");

//       sale_name.value = "";
//       addEditSale.value = false;
//       edit_sale.value = false;
//       form_title.value = "";

//       notifyUser(res.message, "green", "top");
//     } else notifyUser("There was an error", "red", "top-right");
//   } else {
//     errorMsg.value = "Name is required!";
//     notifyUser("Name is required!", "red", "top-right");
//   }
// };

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
  (data) => sale_store.fetchSalesInDateRange(data),
  {
    onSuccess: (data) => {
      timeframe.value = `(From: ${moment(bills_date.from).format(
        "DD-MM-YYYY"
      )} - To: ${moment(bills_date.to).format("DD-MM-YYYY")}). ${
        data?.data?.length
      } Records. Total Product Quantity: ${data?.data?.reduce(
        (a, b) => a + b.quantity,
        0
      )}`;
      $q.loading.hide();

      reset_btn.value = true;

      sales.value = [];
      data?.data?.forEach((el) => {
        const res = {
          name: el.name,
          quantity: el.quantity,
          status: el.status,
          bill_ref: el.bill_ref,
          payment_mode: el.payment_mode,
          user: el.user,
          created_at: el.created_at,
        };

        sales.value.push(res);
      });
    },
  }
);

// Close Add/Edit dialog
const closeAddEditDialog = () => {
  addEditSale.value = false;
  sale_name.value = "";
  sale_id.value = "";
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
const exportExcel = (sales) => {
  const dt = sales.map((val) => {
    return {
      name: val.name,
      sales: val.sales.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, sale_columns, exportFile, $q, "SalesData");
};
</script>

<style scope>
.error_msg {
  color: red;
}

.pending-sale {
  background-color: orangered;
  color: white;
}
</style>
