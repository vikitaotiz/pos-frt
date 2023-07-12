<template>
  <div class="q-pa-md">
    <!-- Render departments table -->
    <div v-if="isLoading">Loading departments...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Departments"
      :rows="departments"
      :columns="department_columns"
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
              @click="openEditDepartmentDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteDepartment(props.row)"
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
          @click="openAddNewDepartmentDialog"
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
          @click="exportExcel(departments)"
        />
      </template>
    </q-table>

    <!-- Add/Edit Department dialog -->
    <q-dialog v-model="addEditDepartment" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="department_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="department_name && !edit_department"
            flat
            label="Add Department"
            color="primary"
            @click="addNewDepartment"
          />

          <q-btn
            v-if="department_name && edit_department"
            flat
            label="Edit Department"
            color="primary"
            @click="editSelectedDepartment"
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
import { department_columns } from "src/utilities/columns/department_columns";
import { paginations } from "src/utilities/paginations";
import { useDepartmentStore } from "src/stores/department-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const department_store = useDepartmentStore();
const pagination = paginations(10);

// Local variables
const addEditDepartment = ref(false);
const edit_department = ref(false);
const filter = ref("");
const form_title = ref("");
const department_name = ref("");
const department_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get departments method
const {
  data: departments,
  isLoading,
  isError,
} = useQuery("departments", () => department_store.fetchDepartments());

// Delete department method
const deleteDepartment = async (department) => {
  const del = confirm(
    `Continue with the operation. Delete ${department.name} ?`
  );
  if (del) {
    const res = await department_store.deleteDepartment({
      uuid: department.uuid,
    });
    if (res.status === "success") {
      queryClient.refetchQueries("departments");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new department dialog
const openAddNewDepartmentDialog = () => {
  form_title.value = "Add New Department";
  addEditDepartment.value = true;
  edit_department.value = false;
};

// Trigger edit department dialog
const openEditDepartmentDialog = (department) => {
  edit_department.value = true;
  form_title.value = `Edit ${department.name}`;
  department_name.value = department.name;
  department_id.value = department.uuid;
  addEditDepartment.value = true;
};

// Create new department method
const addNewDepartment = async () => {
  errorMsg.value = "";

  if (department_name.value.trim()) {
    const res = await department_store.createDepartment({
      name: department_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("departments");
      department_name.value = "";
      addEditDepartment.value = false;

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

// Edit department method
const editSelectedDepartment = async () => {
  const dt = {
    name: department_name.value.trim(),
    uuid: department_id.value,
  };

  if (dt.name) {
    const res = await department_store.updateDepartment(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("departments");

      department_name.value = "";
      addEditDepartment.value = false;
      edit_department.value = false;
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
  addEditDepartment.value = false;
  department_name.value = "";
  department_id.value = "";
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
const exportExcel = (departments) => {
  const dt = departments.map((val) => {
    return {
      name: val.name,
      users: val.users.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, department_columns, exportFile, $q, "DepartmentsData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
