<template>
  <div class="q-pa-md">
    <!-- Render sales table -->
    <div v-if="isLoading">Loading sales...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Sales"
      :rows="sales"
      :columns="sale_columns"
      v-model:pagination="pagination"
      separator="cell"
      row-key="name"
      :filter="filter"
      dense
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>

          <q-td key="quantity" :props="props">
            {{ props.row.quantity }}
          </q-td>

          <q-td key="status" :props="props">
            {{ props.row.status }}
          </q-td>

          <q-td key="user" :props="props">
            {{ props.row.user }}
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td key="actions" :props="props">
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

        <q-btn
          @click="openAddNewSaleDialog"
          round
          dense
          color="primary"
          size="small"
          icon="add"
        />

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
  </div>
</template>

<script setup>
// File and Library imports
import { ref } from "vue";
import { exportFile, useQuasar } from "quasar";
import { useQuery, useQueryClient } from "vue-query";
import { sale_columns } from "src/utilities/columns/sale_columns";
import { paginations } from "src/utilities/paginations";
import { useSaleStore } from "src/stores/sale-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const sale_store = useSaleStore();
const pagination = paginations(10);

// Local variables
const addEditSale = ref(false);
const edit_sale = ref(false);
const filter = ref("");
const form_title = ref("");
const sale_name = ref("");
const sale_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get sales method
const {
  data: sales,
  isLoading,
  isError,
} = useQuery("sales", () => sale_store.fetchSales());

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

// Trigger add new sale dialog
const openAddNewSaleDialog = () => {
  form_title.value = "Add New Sale";
  addEditSale.value = true;
  edit_sale.value = false;
};

// Trigger edit sale dialog
const openEditSaleDialog = (sale) => {
  edit_sale.value = true;
  form_title.value = `Edit ${sale.name}`;
  sale_name.value = sale.name;
  sale_id.value = sale.uuid;
  addEditSale.value = true;
};

// Create new sale method
const addNewSale = async () => {
  errorMsg.value = "";

  if (sale_name.value.trim()) {
    const res = await sale_store.createSale({
      name: sale_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("sales");
      sale_name.value = "";
      addEditSale.value = false;

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

// Edit sale method
const editSelectedSale = async () => {
  const dt = {
    name: sale_name.value.trim(),
    uuid: sale_id.value,
  };

  if (dt.name) {
    const res = await sale_store.updateSale(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("sales");

      sale_name.value = "";
      addEditSale.value = false;
      edit_sale.value = false;
      form_title.value = "";

      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  } else {
    errorMsg.value = "Name is required!";
    notifyUser("Name is required!", "red", "top-right");
  }
};

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
</style>
