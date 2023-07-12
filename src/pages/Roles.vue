<template>
  <div class="q-pa-md">
    <!-- Render roles table -->
    <div v-if="isLoading">Loading roles...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Roles"
      :rows="roles"
      :columns="role_columns"
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

          <q-td key="users" :props="props">
            {{ props.row.users.length }}
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td key="actions" :props="props">
            <q-icon
              color="blue"
              name="edit"
              @click="openEditRoleDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteRole(props.row)"
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
          @click="openAddNewRoleDialog"
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
          @click="exportExcel(roles)"
        />
      </template>
    </q-table>

    <!-- Add/Edit Role dialog -->
    <q-dialog v-model="addEditRole" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="role_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="role_name && !edit_role"
            flat
            label="Add Role"
            color="primary"
            @click="addNewRole"
          />

          <q-btn
            v-if="role_name && edit_role"
            flat
            label="Edit Role"
            color="primary"
            @click="editSelectedRole"
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
import { role_columns } from "src/utilities/columns/role_columns";
import { paginations } from "src/utilities/paginations";
import { useRoleStore } from "src/stores/role-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const role_store = useRoleStore();
const pagination = paginations(10);

// Local variables
const addEditRole = ref(false);
const edit_role = ref(false);
const filter = ref("");
const form_title = ref("");
const role_name = ref("");
const role_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get roles method
const {
  data: roles,
  isLoading,
  isError,
} = useQuery("roles", () => role_store.fetchRoles());

// Delete role method
const deleteRole = async (role) => {
  const del = confirm(`Continue with the operation. Delete ${role.name} ?`);
  if (del) {
    const res = await role_store.deleteRole({ uuid: role.uuid });
    if (res.status === "success") {
      queryClient.refetchQueries("roles");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new role dialog
const openAddNewRoleDialog = () => {
  form_title.value = "Add New Role";
  addEditRole.value = true;
  edit_role.value = false;
};

// Trigger edit role dialog
const openEditRoleDialog = (role) => {
  edit_role.value = true;
  form_title.value = `Edit ${role.name}`;
  role_name.value = role.name;
  role_id.value = role.uuid;
  addEditRole.value = true;
};

// Create new role method
const addNewRole = async () => {
  errorMsg.value = "";

  if (role_name.value.trim()) {
    const res = await role_store.createRole({ name: role_name.value.trim() });
    if (res.status === "success") {
      queryClient.refetchQueries("roles");
      role_name.value = "";
      addEditRole.value = false;

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

// Edit role method
const editSelectedRole = async () => {
  const dt = {
    name: role_name.value.trim(),
    uuid: role_id.value,
  };

  if (dt.name) {
    const res = await role_store.updateRole(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("roles");

      role_name.value = "";
      addEditRole.value = false;
      edit_role.value = false;
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
  addEditRole.value = false;
  role_name.value = "";
  role_id.value = "";
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
const exportExcel = (roles) => {
  const dt = roles.map((val) => {
    return {
      name: val.name,
      users: val.users.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, role_columns, exportFile, $q, "RolesData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
