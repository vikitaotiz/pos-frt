<template>
  <div class="q-pa-md">
    <!-- Render measurements table -->
    <div v-if="isLoading">Loading measurements...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Measurements"
      :rows="measurements"
      :columns="measurement_columns"
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
              @click="openEditMeasurementDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteMeasurement(props.row)"
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
          @click="openAddNewMeasurementDialog"
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
          @click="exportExcel(measurements)"
        />
      </template>
    </q-table>

    <!-- Add/Edit Measurement dialog -->
    <q-dialog v-model="addEditMeasurement" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="measurement_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="measurement_name && !edit_measurement"
            flat
            label="Add Measurement"
            color="primary"
            @click="addNewMeasurement"
          />

          <q-btn
            v-if="measurement_name && edit_measurement"
            flat
            label="Edit Measurement"
            color="primary"
            @click="editSelectedMeasurement"
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
import { measurement_columns } from "src/utilities/columns/measurement_columns";
import { paginations } from "src/utilities/paginations";
import { useMeasurementStore } from "src/stores/measurement-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const measurement_store = useMeasurementStore();
const pagination = paginations(10);

// Local variables
const addEditMeasurement = ref(false);
const edit_measurement = ref(false);
const filter = ref("");
const form_title = ref("");
const measurement_name = ref("");
const measurement_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get measurements method
const {
  data: measurements,
  isLoading,
  isError,
} = useQuery("measurements", () => measurement_store.fetchMeasurements());

// Delete measurement method
const deleteMeasurement = async (measurement) => {
  const del = confirm(
    `Continue with the operation. Delete ${measurement.name} ?`
  );
  if (del) {
    const res = await measurement_store.deleteMeasurement({
      uuid: measurement.uuid,
    });
    if (res.status === "success") {
      queryClient.refetchQueries("measurements");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new measurement dialog
const openAddNewMeasurementDialog = () => {
  form_title.value = "Add New Measurement";
  addEditMeasurement.value = true;
  edit_measurement.value = false;
};

// Trigger edit measurement dialog
const openEditMeasurementDialog = (measurement) => {
  edit_measurement.value = true;
  form_title.value = `Edit ${measurement.name}`;
  measurement_name.value = measurement.name;
  measurement_id.value = measurement.uuid;
  addEditMeasurement.value = true;
};

// Create new measurement method
const addNewMeasurement = async () => {
  errorMsg.value = "";

  if (measurement_name.value.trim()) {
    const res = await measurement_store.createMeasurement({
      name: measurement_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("measurements");
      measurement_name.value = "";
      addEditMeasurement.value = false;

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

// Edit measurement method
const editSelectedMeasurement = async () => {
  const dt = {
    name: measurement_name.value.trim(),
    uuid: measurement_id.value,
  };

  if (dt.name) {
    const res = await measurement_store.updateMeasurement(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("measurements");

      measurement_name.value = "";
      addEditMeasurement.value = false;
      edit_measurement.value = false;
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
  addEditMeasurement.value = false;
  measurement_name.value = "";
  measurement_id.value = "";
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
const exportExcel = (measurements) => {
  const dt = measurements.map((val) => {
    return {
      name: val.name,
      users: val.users.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, measurement_columns, exportFile, $q, "MeasurementsData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
