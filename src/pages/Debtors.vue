<template>
  <div class="q-pa-md">
    <!-- Render debtors table -->
    <div v-if="isLoading">Loading debtors...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Debtors"
      :rows="debtors"
      :columns="debtor_columns"
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

          <q-td key="phone" :props="props">
            {{ props.row.phone }}
          </q-td>

          <q-td key="email" :props="props">
            {{ props.row.email ? props.row.email : "N/A" }}
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td key="user" :props="props">
            {{ props.row.user }}
          </q-td>

          <q-td key="actions" :props="props">
            <q-icon
              color="blue"
              name="edit"
              @click="openEditDebtorDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteDebtor(props.row)"
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
          @click="openAddNewDebtorDialog"
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
          @click="exportExcel(debtors)"
        />
      </template>
    </q-table>

    <!-- Add/Edit Debtor dialog -->
    <q-dialog v-model="addEditDebtor" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="name" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Phone" v-model="phone" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Email (Optional)" v-model="email" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="name && !edit_debtor"
            flat
            label="Add Debtor"
            color="primary"
            @click="addNewDebtor"
            :loading="loadingDebtorBtn"
          />

          <q-btn
            v-if="name && edit_debtor"
            flat
            label="Edit Debtor"
            color="primary"
            @click="editSelectedDebtor"
            :loading="loadingDebtorBtn"
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
import { debtor_columns } from "src/utilities/columns/debtor_columns";
import { paginations } from "src/utilities/paginations";
import { useDebtorStore } from "src/stores/debtor-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const debtor_store = useDebtorStore();
const pagination = paginations(10);

// Local variables
const addEditDebtor = ref(false);
const edit_debtor = ref(false);
const loadingDebtorBtn = ref(false);

const filter = ref("");
const form_title = ref("");
const name = ref("");
const phone = ref("");
const email = ref("");
const debtor_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get debtors method
const {
  data: debtors,
  isLoading,
  isError,
} = useQuery("debtors", () => debtor_store.fetchDebtors());

// Delete debtor method
const deleteDebtor = async (debtor) => {
  const del = confirm(`Continue with the operation. Delete ${debtor.name} ?`);
  if (del) {
    const res = await debtor_store.deleteDebtor({ uuid: debtor.uuid });
    if (res.status === "success") {
      queryClient.refetchQueries("debtors");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new debtor dialog
const openAddNewDebtorDialog = () => {
  form_title.value = "Add New Debtor";
  addEditDebtor.value = true;
  edit_debtor.value = false;
};

// Trigger edit debtor dialog
const openEditDebtorDialog = (debtor) => {
  edit_debtor.value = true;
  form_title.value = `Edit ${debtor.name}`;
  name.value = debtor.name;
  phone.value = debtor.phone;
  email.value = debtor.email;
  debtor_id.value = debtor.uuid;
  addEditDebtor.value = true;
};

// Create new debtor method
const addNewDebtor = async () => {
  loadingDebtorBtn.value = true;
  errorMsg.value = "";

  const new_debtor = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
  };

  if (new_debtor.name && new_debtor.phone) {
    const res = await debtor_store.createDebtor(new_debtor);
    if (res.status === "success") {
      queryClient.refetchQueries("debtors");
      name.value = "";
      phone.value = "";
      email.value = "";
      addEditDebtor.value = false;

      notifyUser(res.message, "green", "top");
      loadingDebtorBtn.value = false;
    } else {
      errorMsg.value = res.message;
      notifyUser(res.message, "red", "top-right");
      loadingDebtorBtn.value = false;
    }
  } else {
    errorMsg.value = "Name and Phone are required!";
    notifyUser("Name and Phone are required!", "red", "top-right");
  }
};

// Edit debtor method
const editSelectedDebtor = async () => {
  loadingDebtorBtn.value = true;

  const dt = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    uuid: debtor_id.value,
  };

  if (dt.name) {
    const res = await debtor_store.updateDebtor(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("debtors");

      name.value = "";
      phone.value = "";
      email.value = "";
      addEditDebtor.value = false;
      edit_debtor.value = false;
      form_title.value = "";

      notifyUser(res.message, "green", "top");
      loadingDebtorBtn.value = false;
    } else {
      loadingDebtorBtn.value = false;

      notifyUser("There was an error", "red", "top-right");
    }
  } else {
    errorMsg.value = "Name is required!";
    notifyUser("Name is required!", "red", "top-right");
    loadingDebtorBtn.value = false;
  }
};

// Close Add/Edit dialog
const closeAddEditDialog = () => {
  addEditDebtor.value = false;
  name.value = "";
  phone.value = "";
  email.value = "";
  debtor_id.value = "";
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
const exportExcel = (debtors) => {
  const dt = debtors.map((val) => {
    return {
      name: val.name,
      users: val.users.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, debtor_columns, exportFile, $q, "DebtorsData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
