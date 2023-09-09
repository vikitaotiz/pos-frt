<template>
  <div class="q-pa-md">
    <AccountsBarCharts :account_store="account_store" />
    <!-- Render accounts table -->
    <div v-if="isLoading">Loading accounts...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Accounts"
      :rows="accounts"
      :columns="account_columns"
      separator="cell"
      row-key="name"
      :filter="filter"
      dense
      grid
    >
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 select_account"
          style="cursor: pointer"
          @click="openEditAccountDialog(props.row)"
        >
          <q-card
            ripple
            :class="`${
              moment().format('DD-MM-YYYY') !== props.row.valid_date
                ? 'old_account'
                : 'shadow-2'
            } `"
          >
            <q-card-section>
              <q-list dense separator>
                <q-item flat class="bg-primary text-white">
                  <q-item-section> Created on </q-item-section>

                  <q-item-section side
                    ><span style="color: white">{{
                      props.row.created_at
                    }}</span>
                  </q-item-section>
                </q-item>

                <q-item flat class="bg-blue text-white">
                  <q-item-section> Account closed by </q-item-section>
                  <q-item-section side
                    ><b style="color: white">{{ props.row.user }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Expected Total Sales </q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.total_sales.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Expected Cash </q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.expected_cash.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Expected Mpesa </q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.expected_mpesa.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Expected Mpesa & Cash</q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.expected_mpesa_cash.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Expected Card</q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.expected_card.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Expected Debt</q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.expected_debt.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item class="bg-orange text-white">
                  <q-item-section> Expenses </q-item-section>
                  <q-item-section side
                    ><b style="color: white">{{
                      props.row.production_cost.toLocaleString()
                    }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    Expected Profit
                    <small
                      ><i>(Total Sales - Expenses)</i></small
                    ></q-item-section
                  >
                  <q-item-section side
                    ><b>{{ props.row.expected_profit.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-separator color="primary" /> <br />
              <q-separator color="orange" />
              <q-list dense separator>
                <q-item>
                  <q-item-section> Actual Total Sales </q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.actual_total_sales.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Actual Cash </q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.actual_cash.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section> Actual Mpesa </q-item-section>
                  <q-item-section side
                    ><b>{{ props.row.actual_mpesa.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    Actual Profit
                    <small
                      ><i>(Total Sales - Expense)</i></small
                    ></q-item-section
                  >
                  <q-item-section side
                    ><b>{{ props.row.actual_profit.toLocaleString() }}</b>
                  </q-item-section>
                </q-item>
              </q-list>
              <div class="text-center q-pt-sm">
                <small
                  ><i
                    >Department: {{ props.row.department.toLocaleString() }}</i
                  ></small
                >
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- <q-td key="actions" :props="props">
            <q-icon
              color="blue"
              name="edit"
              @click="openEditAccountDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteAccount(props.row)"
              style="cursor: pointer"
              size="20px"
            />
          </q-td> -->
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
        <q-btn-group v-if="hasPermission(auth_store?.user?.user?.roles)">
          <q-btn
            @click="openAddNewAccountDialog"
            round
            dense
            color="primary"
            size="small"
            icon="add"
            label="Add"
          />

          <q-btn
            dense
            flat
            color="primary"
            icon-right="archive"
            label="Export"
            class="q-ml-sm"
            no-caps
            @click="exportExcel(accounts)"
          />
        </q-btn-group>
      </template>
    </q-table>

    <!-- Add/Edit Account dialog -->
    <q-dialog v-model="addEditAccount" persistent>
      <q-card style="width: 700px">
        <q-toolbar>
          <div class="text-h6">{{ form_title }}</div>
          <q-space />
          <small style="text-align: center">
            <i>Expected Values</i>
            <hr />
            <q-badge class="q-mr-xs"
              >Total: {{ account_store?.total_daily_sales }}</q-badge
            >
            <q-badge class="q-mr-xs"
              >Cash: {{ account_store?.total_daily_cash_sales }}</q-badge
            >
            <q-badge class="q-mr-xs"
              >Mpesa: {{ account_store?.total_daily_mpesa_sales }}</q-badge
            >
            <br />
            <q-badge class="q-mr-xs"
              >Mpesa & Cash:
              {{ account_store?.total_daily_mpesa_cash_sales }}</q-badge
            >
            <q-badge class="q-mr-xs"
              >Card: {{ account_store?.total_daily_card_sales }}</q-badge
            >
            <q-badge class="q-mr-xs"
              >Debt: {{ account_store?.total_daily_debt_sales }}</q-badge
            >
            <br />
            <q-badge class="q-mr-xs"
              >Expense: {{ account_store?.total_daily_expense }}</q-badge
            >
          </small>
        </q-toolbar>

        <q-card-section class="q-pt-none">
          <q-input
            outlined
            dense
            label="Actual Cash"
            v-model="actual_cash_at_hand"
            type="number"
            min="0"
            oninput="validity.valid||(value='');"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            outlined
            dense
            label="Actual Mpesa"
            v-model="actual_mpesa_at_hand"
            type="number"
            min="0"
            oninput="validity.valid||(value='');"
          />
        </q-card-section>

        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="actual_cash_at_hand && !edit_account"
            flat
            label="Close Day"
            color="primary"
            @click="addNewAccount"
            :loading="loadingAccountsBtn"
          />

          <q-btn
            v-if="actual_cash_at_hand && edit_account"
            flat
            label="Edit Account"
            color="primary"
            @click="editSelectedAccount"
            :loading="loadingAccountsBtn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
// File and Library imports
import { ref, computed } from "vue";
import { exportFile, useQuasar } from "quasar";
import { useQuery, useQueryClient } from "vue-query";
import { account_columns } from "src/utilities/columns/account_columns";
import { useAccountStore } from "src/stores/account-store";
import { useAuthStore } from "src/stores/auth-store";
import { exportTable } from "src/utilities/excel";
import { hasPermission } from "src/utilities/helpers";
import moment from "moment";

import AccountsBarCharts from "src/components/charts/echarts/AccountsBarCharts.vue";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const account_store = useAccountStore();
const auth_store = useAuthStore();

// Local variables
const addEditAccount = ref(false);
const edit_account = ref(false);
const loadingAccountsBtn = ref(false);
const filter = ref("");
const form_title = ref("");
const actual_cash_at_hand = ref(0);
const actual_mpesa_at_hand = ref(0);
const account_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get accounts method
const {
  data: accounts,
  isLoading,
  isError,
} = useQuery("accounts", () => account_store.fetchAccounts());

useQuery("account_stats_today", () => account_store.fetchTodaySalesStats());

// // Delete account method
// const deleteAccount = async (account) => {
//   const del = confirm(`Continue with the operation. Delete ${account} ?`);
//   if (del) {
//     const res = await account_store.deleteAccount({ uuid: account.uuid });
//     if (res.status === "success") {
//       queryClient.refetchQueries("accounts");
//       notifyUser(res.message, "green", "top");
//     } else notifyUser("There was an error", "red", "top-right");
//   }
// };

// Trigger add new account dialog
const openAddNewAccountDialog = () => {
  form_title.value = "Close Accounts for the day";
  addEditAccount.value = true;
  edit_account.value = false;
};

// // Trigger edit account dialog
const openEditAccountDialog = (account) => {
  if (hasPermission(auth_store?.user?.user?.roles)) {
    edit_account.value = true;
    form_title.value = `Edit Account for ${account.created_at}`;
    account_id.value = account.uuid;
    actual_cash_at_hand.value = account.actual_cash;
    actual_mpesa_at_hand.value = account.actual_mpesa;
    addEditAccount.value = true;
  } else {
    alert("You are not authorized to edit the accounts. Contact admin.");
  }
};

// // Create new account method
const addNewAccount = async () => {
  loadingAccountsBtn.value = true;
  errorMsg.value = "";

  if (hasPermission(auth_store?.user?.user?.roles)) {
    const account = {
      user_departments: auth_store?.user?.user?.departments.map(
        (el) => el.name
      ),

      actual_cash: Number(actual_cash_at_hand.value),
      actual_mpesa: Number(actual_mpesa_at_hand.value),
      expected_cash: Number(
        account_store?.total_daily_cash_sales.split(",").join("")
      ),
      expected_mpesa: Number(
        account_store?.total_daily_mpesa_sales.split(",").join("")
      ),
      expected_mpesa_cash: Number(
        account_store?.total_daily_mpesa_cash_sales.split(",").join("")
      ),
      expected_card: Number(
        account_store?.total_daily_card_sales.split(",").join("")
      ),
      expected_debt: Number(
        account_store?.total_daily_debt_sales.split(",").join("")
      ),
      total_sales: Number(account_store?.total_daily_sales.split(",").join("")),
      total_expense: Number(
        account_store?.total_daily_expense.split(",").join("")
      ),
    };
    if (account.actual_cash || account.actual_mpesa) {
      const res = await account_store.createAccount(account);

      if (res.status === "success") {
        queryClient.refetchQueries("accounts");
        actual_cash_at_hand.value = 1;
        actual_mpesa_at_hand.value = 1;
        addEditAccount.value = false;
        notifyUser(res.message, "green", "top");
        loadingAccountsBtn.value = false;
      } else {
        errorMsg.value = res.message;
        notifyUser(res.message, "red", "top-right");
        loadingAccountsBtn.value = false;
      }
    } else {
      errorMsg.value =
        "Either actual cash or mpesa should be greater than zero!";
      notifyUser(
        "Either actual cash or mpesa should be greater than zero!",
        "red",
        "top-right"
      );
      loadingAccountsBtn.value = false;
    }
  } else {
    notifyUser(
      "Permission denied! Only cashier or admin is allowed",
      "red",
      "top"
    );
  }
};

// Edit account method
const editSelectedAccount = async () => {
  loadingAccountsBtn.value = true;

  const dt = {
    account_uuid: account_id.value,
    actual_cash: Number(actual_cash_at_hand.value),
    actual_mpesa: Number(actual_mpesa_at_hand.value),
    expected_cash: account_store?.total_daily_cash_sales,
    expected_mpesa: account_store?.total_daily_mpesa_sales,
    expected_mpesa_cash: account_store?.total_daily_mpesa_cash_sales,
    expected_card: account_store?.total_daily_card_sales,
    expected_debt: account_store?.total_daily_debt_sales,
    total_sales: account_store?.total_daily_sales,
    total_expense: account_store?.total_daily_expense,
  };

  if (dt.actual_cash && dt.actual_mpesa) {
    const res = await account_store.updateAccount(dt);

    if (res.status === "success") {
      queryClient.refetchQueries("accounts");

      actual_cash_at_hand.value = 1;
      actual_mpesa_at_hand.value = 1;

      addEditAccount.value = false;
      edit_account.value = false;
      form_title.value = "";

      notifyUser(res.message, "green", "top");
      loadingAccountsBtn.value = false;
    } else {
      loadingAccountsBtn.value = false;
      notifyUser("There was an error", "red", "top-right");
    }
  } else {
    errorMsg.value = "Name is required!";
    notifyUser("Name is required!", "red", "top-right");
    loadingAccountsBtn.value = false;
  }
};

// // Close Add/Edit dialog
const closeAddEditDialog = () => {
  addEditAccount.value = false;
  actual_cash_at_hand.value = 1;
  actual_mpesa_at_hand.value = 1;
  account_id.value = "";
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
const exportExcel = (accounts) => {
  const dt = accounts.map((val) => {
    return {
      name: val.name,
      users: val.users.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, account_columns, exportFile, $q, "AccountsData");
};
</script>

<style scope>
.error_msg {
  color: red;
}

.old_account {
  background-color: rgb(236, 234, 234);
}

.select_account:hover {
  border: 5px solid #59aff5;
  border-radius: 10px;
}
</style>
