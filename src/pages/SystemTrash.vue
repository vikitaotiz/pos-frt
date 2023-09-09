<template>
  <div class="q-pa-md" v-if="user_store.access_granted">
    <q-card dark class="bg_trash q-ma-md" style="border-radius: 20px">
      <q-toolbar
        ><q-btn
          dense
          flat
          icon="arrow_back"
          label="Exit"
          @click="
            () => {
              user_store.access_granted = false;
              $router.back();
            }
          "
        /><q-space />
        <span>
          <q-icon name="delete" size="xs" />
          <strong>Recycle Bin and Logs</strong>
        </span>

        <q-space />
        <q-badge color="blue" class="q-pa-sm" rounded>{{
          user_store.access_granted ? "Access Granted" : "Access Denied"
        }}</q-badge>
      </q-toolbar>
    </q-card>

    <div class="text-blue text-center q-mb-md">
      <b style="color: #017951">
        Session expires in: Minutes {{ redirectTime.minutes }} : Seconds
        {{ redirectTime.seconds }}
      </b>
    </div>
    <q-separator color="primary" />

    <q-card-section class="q-pt-md">
      <div v-if="isLoading">Loading Deleted Records</div>

      <div v-else class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-btn
            :label="`Products (${data?.deleted_products?.length})`"
            :color="`${data?.deleted_products?.length > 0 ? 'red' : 'orange'}`"
            @click="openDisplayDialog('products')"
            rounded
            class="full-width"
            unelevated
            icon="list"
          />
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-btn
            :label="`Bills (${data?.deleted_bills?.length})`"
            :color="`${data?.deleted_bills?.length > 0 ? 'red' : 'orange'}`"
            @click="openDisplayDialog('bills')"
            rounded
            class="full-width"
            unelevated
            icon="description"
          />
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-btn
            :label="`Sales (${data?.deleted_sales?.length})`"
            :color="`${data?.deleted_sales?.length > 0 ? 'red' : 'orange'}`"
            @click="openDisplayDialog('sales')"
            rounded
            class="full-width"
            unelevated
            icon="show_chart"
          />
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-btn
            :label="`Users (${data?.deleted_users?.length})`"
            :color="`${data?.deleted_users?.length > 0 ? 'red' : 'orange'}`"
            @click="openDisplayDialog('users')"
            rounded
            class="full-width"
            unelevated
            icon="supervisor_account"
          />
        </div>
      </div>

      <div v-if="isError">There was an error</div>
    </q-card-section>

    <q-dialog
      v-model="displayDialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-white bg_trash">
        <q-bar class="q-pa-lg">
          <div class="text-h6">
            <q-icon name="delete" size="sm" /> {{ dialogTitle }}
          </div>
          <q-space />
          <q-btn
            dense
            flat
            icon="minimize"
            @click="maximizedToggle = false"
            :disable="!maximizedToggle"
          >
            <q-tooltip v-if="maximizedToggle" class="bg-white text-green"
              >Minimize Recycle Bin</q-tooltip
            >
          </q-btn>
          <q-btn
            dense
            flat
            icon="crop_square"
            @click="maximizedToggle = true"
            :disable="maximizedToggle"
          >
            <q-tooltip v-if="!maximizedToggle" class="bg-white text-green"
              >Maximize Recycle Bin</q-tooltip
            >
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-green">Close Recycle Bin</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="q-pt-none">
          <q-table
            flat
            bordered
            title="Records"
            dense
            :rows="selected_data"
            row-key="name"
            class="q-mt-md"
          >
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <div class="my-table-details">
                  <q-btn
                    flat
                    icon="settings_backup_restore"
                    color="primary"
                    size="sm"
                  />
                  <q-btn flat icon="delete" color="red" size="sm" />
                </div>
              </q-td> </template
          ></q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useUserStore } from "src/stores/user-store";
const user_store = useUserStore();
const router = useRouter();

if (!user_store.access_granted) {
  router.push("/settings");
}

import { reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useQuery, useQueryClient } from "vue-query";
import { useDeletedRecordStore } from "src/stores/deleted-records-store";
import { useRouter } from "vue-router";

const $q = useQuasar();
const deleted_records = useDeletedRecordStore();

const displayDialog = ref(false);
const maximizedToggle = ref(true);

const selected_data = ref([]);
const loaded_data = ref([]);
const dialogTitle = ref("");

const redirectTime = reactive({
  minutes: 0,
  seconds: 0,
});

const interval = setInterval(() => {
  redirectTime.seconds++;
  if (redirectTime.seconds === 59) {
    redirectTime.minutes++;
    redirectTime.seconds = 0;
  }
}, 1000);

interval;

setTimeout(() => {
  clearInterval(interval);
  notifyUser(
    "Your access session has expired. Confirm your credentials to continue",
    "teal",
    "top"
  );
  router.push("/settings");
  user_store.access_granted = false;
}, 1800000);

const { data, isLoading, isError } = useQuery(
  "deleted_records",
  () => deleted_records.fetchDeletedRecords(),
  {
    onSuccess: (dat) => (loaded_data.value = dat),
  }
);

const openDisplayDialog = (data_type) => {
  if (data_type == "products") {
    dialogTitle.value = `DELETED PRODUCTS (${loaded_data.value.deleted_products.length})`;
    selected_data.value = loaded_data.value.deleted_products;
  }

  if (data_type == "bills") {
    dialogTitle.value = `DELETED BILLS (${loaded_data.value.deleted_bills.length})`;
    selected_data.value = loaded_data.value.deleted_bills;
  }

  if (data_type == "sales") {
    dialogTitle.value = `DELETED SALES (${loaded_data.value.deleted_sales.length})`;
    selected_data.value = loaded_data.value.deleted_sales;
  }

  if (data_type == "users") {
    dialogTitle.value = `DELETED USERS (${loaded_data.value.deleted_users.length})`;
    selected_data.value = loaded_data.value.deleted_users;
  }

  if (selected_data.value.length > 0) {
    displayDialog.value = true;
  } else {
    notifyUser(`${data_type} has no deleted records`, "red", "top");
  }
};

const notifyUser = (message, color, position) => {
  $q.notify({
    type: "negative",
    message,
    color,
    position,
  });
};
</script>

<style scoped>
.bg_trash {
  background: linear-gradient(90deg, #f32929 0%, #008552 100%);
}
</style>
