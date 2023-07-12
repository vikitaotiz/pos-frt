<template>
  <div class="q-pa-md">
    <!-- Render inventories table -->
    <div v-if="isLoading">Loading inventories...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Inventories"
      :rows="inventories"
      :columns="inventory_columns"
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

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td key="actions" :props="props">
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

        <q-btn
          @click="openAddNewInventoryDialog"
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
          @click="exportExcel(inventories)"
        />
      </template>
    </q-table>

    <!-- Add/Edit Inventory dialog -->
    <q-dialog v-model="addEditInventory" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="inventory_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="inventory_name && !edit_inventory"
            flat
            label="Add Inventory"
            color="primary"
            @click="addNewInventory"
          />

          <q-btn
            v-if="inventory_name && edit_inventory"
            flat
            label="Edit Inventory"
            color="primary"
            @click="editSelectedInventory"
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
import { inventory_columns } from "src/utilities/columns/inventory_columns";
import { paginations } from "src/utilities/paginations";
import { useInventoryStore } from "src/stores/inventory-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const inventory_store = useInventoryStore();
const pagination = paginations(10);

// Local variables
const addEditInventory = ref(false);
const edit_inventory = ref(false);
const filter = ref("");
const form_title = ref("");
const inventory_name = ref("");
const inventory_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get inventories method
const {
  data: inventories,
  isLoading,
  isError,
} = useQuery("inventories", () => inventory_store.fetchInventories());

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
  form_title.value = "Add New Inventory";
  addEditInventory.value = true;
  edit_inventory.value = false;
};

// Trigger edit inventory dialog
const openEditInventoryDialog = (inventory) => {
  edit_inventory.value = true;
  form_title.value = `Edit ${inventory.name}`;
  inventory_name.value = inventory.name;
  inventory_id.value = inventory.uuid;
  addEditInventory.value = true;
};

// Create new inventory method
const addNewInventory = async () => {
  errorMsg.value = "";

  if (inventory_name.value.trim()) {
    const res = await inventory_store.createInventory({
      name: inventory_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("inventories");
      inventory_name.value = "";
      addEditInventory.value = false;

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

// Edit inventory method
const editSelectedInventory = async () => {
  const dt = {
    name: inventory_name.value.trim(),
    uuid: inventory_id.value,
  };

  if (dt.name) {
    const res = await inventory_store.updateInventory(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("inventories");

      inventory_name.value = "";
      addEditInventory.value = false;
      edit_inventory.value = false;
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
  addEditInventory.value = false;
  inventory_name.value = "";
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
