<template>
  <div class="q-pa-md">
    <!-- Render payment_modes table -->
    <div v-if="isLoading">Loading payment_modes...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="PaymentModes"
      :rows="payment_modes"
      :columns="payment_mode_columns"
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

          <q-td key="user" :props="props">
            {{ props.row.user }}
          </q-td>

          <q-td key="sales" :props="props">
            {{ props.row.sales }}
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td key="actions" :props="props">
            <q-icon
              color="blue"
              name="edit"
              @click="openEditPaymentModeDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deletePaymentMode(props.row)"
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
          @click="openAddNewPaymentModeDialog"
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
          @click="exportExcel(payment_modes)"
        />
      </template>
    </q-table>

    <!-- Add/Edit PaymentMode dialog -->
    <q-dialog v-model="addEditPaymentMode" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="payment_mode_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="payment_mode_name && !edit_payment_mode"
            flat
            label="Add PaymentMode"
            color="primary"
            @click="addNewPaymentMode"
          />

          <q-btn
            v-if="payment_mode_name && edit_payment_mode"
            flat
            label="Edit PaymentMode"
            color="primary"
            @click="editSelectedPaymentMode"
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
import { payment_mode_columns } from "src/utilities/columns/payment_mode_columns";
import { paginations } from "src/utilities/paginations";
import { usePaymentModeStore } from "src/stores/payment-mode-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const payment_mode_store = usePaymentModeStore();
const pagination = paginations(10);

// Local variables
const addEditPaymentMode = ref(false);
const edit_payment_mode = ref(false);
const filter = ref("");
const form_title = ref("");
const payment_mode_name = ref("");
const payment_mode_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get payment_modes method
const {
  data: payment_modes,
  isLoading,
  isError,
} = useQuery("payment_modes", () => payment_mode_store.fetchPaymentModes());

// Delete payment_mode method
const deletePaymentMode = async (payment_mode) => {
  const del = confirm(
    `Continue with the operation. Delete ${payment_mode.name} ?`
  );
  if (del) {
    const res = await payment_mode_store.deletePaymentMode({
      uuid: payment_mode.uuid,
    });
    if (res.status === "success") {
      queryClient.refetchQueries("payment_modes");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new payment_mode dialog
const openAddNewPaymentModeDialog = () => {
  form_title.value = "Add New PaymentMode";
  addEditPaymentMode.value = true;
  edit_payment_mode.value = false;
};

// Trigger edit payment_mode dialog
const openEditPaymentModeDialog = (payment_mode) => {
  edit_payment_mode.value = true;
  form_title.value = `Edit ${payment_mode.name}`;
  payment_mode_name.value = payment_mode.name;
  payment_mode_id.value = payment_mode.uuid;
  addEditPaymentMode.value = true;
};

// Create new payment_mode method
const addNewPaymentMode = async () => {
  errorMsg.value = "";

  if (payment_mode_name.value.trim()) {
    const res = await payment_mode_store.createPaymentMode({
      name: payment_mode_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("payment_modes");
      payment_mode_name.value = "";
      addEditPaymentMode.value = false;

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

// Edit payment_mode method
const editSelectedPaymentMode = async () => {
  const dt = {
    name: payment_mode_name.value.trim(),
    uuid: payment_mode_id.value,
  };

  if (dt.name) {
    const res = await payment_mode_store.updatePaymentMode(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("payment_modes");

      payment_mode_name.value = "";
      addEditPaymentMode.value = false;
      edit_payment_mode.value = false;
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
  addEditPaymentMode.value = false;
  payment_mode_name.value = "";
  payment_mode_id.value = "";
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
const exportExcel = (payment_modes) => {
  const dt = payment_modes.map((val) => {
    return {
      name: val.name,
      users: val.users.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, payment_mode_columns, exportFile, $q, "PaymentModesData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
