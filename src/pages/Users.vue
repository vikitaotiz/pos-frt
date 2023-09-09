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
      separator="cell"
      row-key="name"
      :filter="filter"
      dense
    >
      <template v-slot:body="props">
        <q-tr
          :props="props"
          :class="`${
            props.row.name == 'Administrator' ? 'bg-admin text-white' : ''
          }`"
        >
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>

          <q-td key="email" :props="props">
            {{ props.row.email }}
          </q-td>
          <q-td key="phone" :props="props">
            {{ props.row.phone ? props.row.phone : "Null" }}
          </q-td>

          <q-td key="email_notify" :props="props">
            <q-badge :color="`${props.row.email_notify ? 'blue' : 'red'}`">
              {{ props.row.email_notify ? "Enabled" : "Disabled" }}
            </q-badge>
          </q-td>

          <!-- <q-td key="whatsapp_notify" :props="props">
            <q-badge :color="`${props.row.whatsapp_notify ? 'blue' : 'red'}`">
              {{ props.row.whatsapp_notify ? "Enabled" : "Disabled" }}
            </q-badge>
          </q-td> -->

          <q-td key="roles" :props="props">
            <div v-for="role in props.row.roles" :key="role.uuid">
              <q-badge color="blue">
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
              v-if="props.row.name !== 'Administrator'"
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
          placeholder="Search Name"
          class="q-mr-md"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <span>
          <q-btn
            @click="openAddNewUserDialog"
            dense
            color="primary"
            icon="add"
            label="Create New User"
            unelevated
            size="sm"
          />

          <q-btn
            dense
            outline
            color="primary"
            icon-right="archive"
            label="Export Users"
            class="q-ml-sm"
            no-caps
            @click="exportExcel(users)"
            size="sm"
          />
        </span>
      </template>
    </q-table>

    <!-- Add/Edit User dialog -->
    <q-dialog v-model="addEditUser" persistent>
      <q-card style="width: 500px">
        <q-toolbar>
          <div class="text-h6">{{ form_title }}</div>
          <q-space />

          <q-toggle
            v-model="user_status"
            checked-icon="check"
            color="green"
            unchecked-icon="clear"
            :label="`${user_status ? 'User active.' : 'User disabled.'}`"
          />
        </q-toolbar>

        <q-card-section class="q-pt-none">
          <q-input
            v-if="name !== 'Administrator'"
            class="q-mb-sm"
            outlined
            dense
            label="Name"
            v-model="name"
          />
          <q-input
            class="q-mb-sm"
            outlined
            dense
            label="Phone (Optional)"
            v-model="phone"
          />
          <q-input
            class="q-mb-sm"
            outlined
            dense
            label="Email"
            v-model="email"
            type="email"
          />

          <q-select
            v-if="name !== 'Administrator'"
            dense
            multiple
            use-chips
            hint="You can assign a user multiple roles."
            outlined
            v-model="role_uuids"
            :options="data_roles"
            option-value="uuid"
            option-label="name"
            label="Select Role"
            class="q-mb-sm"
          />

          <q-select
            v-if="name !== 'Administrator'"
            dense
            outlined
            v-model="department_uuid"
            :options="data_departments"
            option-value="uuid"
            option-label="name"
            label="Select Department"
            class="q-mb-sm"
          />
          <q-input
            v-if="name !== 'Administrator'"
            class="q-mb-sm"
            outlined
            dense
            label="Password"
            v-model="password"
            type="password"
          />
        </q-card-section>

        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <small v-if="name === 'Administrator'">
          <q-separator color="primary" />
          <q-toolbar>
            <q-toggle
              v-model="email_notify"
              checked-icon="check"
              color="green"
              unchecked-icon="clear"
              :label="`${
                email_notify
                  ? 'Email Notification Enabled.'
                  : 'Email Notification Disabled.'
              }`"
            />
            <q-space />
            <!-- <q-toggle
              v-model="whatsapp_notify"
              checked-icon="check"
              color="green"
              unchecked-icon="clear"
              :label="`${
                whatsapp_notify
                  ? 'Whatsapp Notification Enabled.'
                  : 'Whatsapp Notification Disabled.'
              }`"
            /> -->
          </q-toolbar>
          <q-separator color="primary" />
        </small>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="name && !edit_user"
            flat
            label="Add User"
            color="primary"
            @click="addNewUser"
            :loading="loadingUserBtn"
          />

          <q-btn
            v-if="name && edit_user"
            flat
            label="Edit User"
            color="primary"
            @click="editSelectedUser"
            :loading="loadingUserBtn"
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
import { useUserStore } from "src/stores/user-store";
import { useRoleStore } from "src/stores/role-store";
import { useDepartmentStore } from "src/stores/department-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const user_store = useUserStore();
const role_store = useRoleStore();
const department_store = useDepartmentStore();

// Local variables
const addEditUser = ref(false);
const edit_user = ref(false);
const loadingUserBtn = ref(false);

const filter = ref("");
const form_title = ref("");
const name = ref("");
const phone = ref("");
const email = ref("");
const user_status = ref(true);
const email_notify = ref(false);
const whatsapp_notify = ref(false);
const password = ref("");
const role_uuids = ref([]);
const department_uuid = ref("");
const user_uuid = ref("");
const errorMsg = ref("");
const data_roles = ref([]);
const data_departments = ref([]);

// Vue query initial data load - Get users method
const {
  data: users,
  isLoading,
  isError,
} = useQuery("users", () => user_store.fetchUsers());

// Vue query initial data load - Get roles method
useQuery("roles", () => role_store.fetchRoles(), {
  onSuccess: (data) => {
    data_roles.value = data.map((el) => {
      return {
        name: el.name,
        uuid: el.uuid,
      };
    });
  },
});

// Vue query initial data load - Get roles method
useQuery("departments", () => department_store.fetchDepartments(), {
  onSuccess: (data) => {
    data_departments.value = data.map((el) => {
      return {
        name: el.name,
        uuid: el.uuid,
      };
    });
  },
});

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
  user_status.value = user.active ? true : false;
  email_notify.value = user.email_notify ? true : false;
  whatsapp_notify.value = user.whatsapp_notify ? true : false;

  edit_user.value = true;
  const user_dept = user.departments.map((el) => el.name)[0];

  user_uuid.value = user.uuid;
  name.value = user.name;
  email.value = user.email;
  phone.value = user.phone;
  password.value = user.password;
  department_uuid.value = user.departments.find((el) => el.name === user_dept);

  role_uuids.value = user.roles.map((el) => {
    return {
      name: el.name,
      uuid: el.uuid,
    };
  });

  form_title.value = `Edit ${user.name}`;
  addEditUser.value = true;
};

// Create new user method
const addNewUser = async () => {
  loadingUserBtn.value = true;
  const new_user = {
    name: name.value.trim(),
    active: user_status.value ? 1 : 0,
    email: email.value.trim(),
    phone: phone.value.trim(),
    role_uuids: role_uuids.value.map((val) => val.uuid),
    department_uuid: department_uuid.value.uuid,
    password: password.value.trim(),
  };

  if (new_user.name && new_user.email && new_user.password) {
    const res = await user_store.createUser(new_user);
    console.log(res);

    if (res.status === "success") {
      queryClient.refetchQueries("users");
      loadingUserBtn.value = false;
      clearInput();
      notifyUser(res.message, "green", "top");
    } else {
      errorMsg.value = res.message;
      loadingUserBtn.value = false;
      notifyUser(res.message, "red", "top-right");
    }
  } else {
    loadingUserBtn.value = false;
    errorMsg.value = "All fields are required!";
    notifyUser("All fields are required!", "red", "top-right");
  }
};

// Edit user method
const editSelectedUser = async () => {
  const new_user = {
    user_uuid: user_uuid.value,
    name: name.value.trim(),
    active: user_status.value ? 1 : 0,
    email_notify: email_notify.value ? 1 : 0,
    whatsapp_notify: whatsapp_notify.value ? 1 : 0,
    email: email.value.trim(),
    phone: phone.value ? phone.value.trim() : phone.value,
    role_uuids: role_uuids.value.map((val) => val.uuid),
    department_uuid: department_uuid.value.uuid,
    password: password.value ? password.value.trim() : password.value,
  };

  if (new_user.name && new_user.email && role_uuids.value.length > 0) {
    const res = await user_store.updateUser(new_user);

    if (res.status === "success") {
      queryClient.refetchQueries("users");

      clearInput();

      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  } else {
    errorMsg.value = "All fields are required!";
    notifyUser("All fields are required!", "red", "top-right");
  }
};

// Close Add/Edit dialog
const closeAddEditDialog = () => clearInput();

// Shared notification method
const notifyUser = (message, color, position) => {
  $q.notify({
    message,
    color,
    position,
  });
};

const clearInput = () => {
  email.value = "";
  name.value = "";
  phone.value = "";
  role_uuids.value = [];
  department_uuid.value = "";
  password.value = "";
  addEditUser.value = false;
  edit_user.value = false;
  form_title.value = "";
  loadingUserBtn.value = false;
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

.bg-admin {
  background-color: #119d6e;
}
</style>
