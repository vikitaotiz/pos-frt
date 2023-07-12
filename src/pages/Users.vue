<template>
  <div class="q-pa-md">
    <!-- Render users table -->
    <div v-if="isLoading">Loading users...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Users"
      :rows="users"
      :columns="user_columns"
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

          <q-td key="email" :props="props">
            {{ props.row.email }}
          </q-td>

          <q-td key="roles" :props="props">
            <div v-for="role in props.row.roles" :key="role.uuid">
              <q-badge>
                {{ role.name }}
              </q-badge>
              <br />
            </div>
            <div v-if="props.row?.roles?.length === 0">
              <small>No Role Assigned</small>
            </div>
          </q-td>

          <q-td key="departments" :props="props">
            <div
              v-for="department in props.row.departments"
              :key="department.uuid"
            >
              <q-badge color="green">
                {{ department.name }}
              </q-badge>
              <br />
            </div>

            <div v-if="props.row?.departments?.length === 0">
              <small>No Department Assigned</small>
            </div>
          </q-td>

          <q-td key="active" :props="props">
            <q-badge v-if="props.row.active"> Enabled </q-badge>

            <q-badge v-else color="red"> Disbled </q-badge>
          </q-td>

          <q-td key="created_at" :props="props">
            {{ props.row.created_at }}
          </q-td>

          <q-td key="actions" :props="props">
            <q-icon
              color="blue"
              name="edit"
              @click="openEditUserDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteUser(props.row)"
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
          @click="openAddNewUserDialog"
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
          @click="exportExcel(users)"
        />
      </template>
    </q-table>

    <!-- Add/Edit User dialog -->
    <q-dialog v-model="addEditUser" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="user_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="user_name && !edit_user"
            flat
            label="Add User"
            color="primary"
            @click="addNewUser"
          />

          <q-btn
            v-if="user_name && edit_user"
            flat
            label="Edit User"
            color="primary"
            @click="editSelectedUser"
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
import { user_columns } from "src/utilities/columns/user_columns";
import { paginations } from "src/utilities/paginations";
import { useUserStore } from "src/stores/user-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const user_store = useUserStore();
const pagination = paginations(10);

// Local variables
const addEditUser = ref(false);
const edit_user = ref(false);
const filter = ref("");
const form_title = ref("");
const user_name = ref("");
const user_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get users method
const {
  data: users,
  isLoading,
  isError,
} = useQuery("users", () => user_store.fetchUsers());

// Delete user method
const deleteUser = async (user) => {
  const del = confirm(`Continue with the operation. Delete ${user.name} ?`);
  if (del) {
    const res = await user_store.deleteUser({ uuid: user.uuid });
    if (res.status === "success") {
      queryClient.refetchQueries("users");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new user dialog
const openAddNewUserDialog = () => {
  form_title.value = "Add New User";
  addEditUser.value = true;
  edit_user.value = false;
};

// Trigger edit user dialog
const openEditUserDialog = (user) => {
  edit_user.value = true;
  form_title.value = `Edit ${user.name}`;
  user_name.value = user.name;
  user_id.value = user.uuid;
  addEditUser.value = true;
};

// Create new user method
const addNewUser = async () => {
  errorMsg.value = "";

  if (user_name.value.trim()) {
    const res = await user_store.createUser({
      name: user_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("users");
      user_name.value = "";
      addEditUser.value = false;

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

// Edit user method
const editSelectedUser = async () => {
  const dt = {
    name: user_name.value.trim(),
    uuid: user_id.value,
  };

  if (dt.name) {
    const res = await user_store.updateUser(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("users");

      user_name.value = "";
      addEditUser.value = false;
      edit_user.value = false;
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
  addEditUser.value = false;
  user_name.value = "";
  user_id.value = "";
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
const exportExcel = (users) => {
  const dt = users.map((val) => {
    return {
      name: val.name,
      users: val.users.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, user_columns, exportFile, $q, "UsersData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
