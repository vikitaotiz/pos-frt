<template>
  <div class="q-pa-sm">
    <!-- <line-chart /> -->
    <div class="q-pa-sm">
      <h5 style="font-weight: 800; color: #017951">App Settings</h5>
      <small>
        <q-toolbar>
          Setup/System Settings.
          <q-space />
          <strong>SMA v0.1 &copy; {{ moment().format("Y") }}</strong>
        </q-toolbar>
      </small>
      <!-- <q-btn label="Send Notification" @click="notifyWhatsapp()" /> -->
      <q-separator color="primary" />
    </div>
    <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/roles" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod">
              <span><q-icon name="settings" /></span>
              <span class="float-right">Roles</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/departments" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod">
              <span><q-icon name="settings" /></span>
              <span class="float-right">Departments</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/sales" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod"
              ><span><q-icon name="settings" /></span>
              <span class="float-right">Sales</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/inventories" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod">
              <span><q-icon name="settings" /></span>
              <span class="float-right">Inventories</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/users" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod"
              ><span><q-icon name="settings" /></span>
              <span class="float-right">Users</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/payment_modes" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod">
              <span><q-icon name="settings" /></span>
              <span class="float-right">Payment Mode</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/measurements" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod">
              <span><q-icon name="settings" /></span>
              <span class="float-right">Measurements</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/debtors" class="module_link">
          <q-card flat class="shadow-2 rad">
            <q-card-section class="mod">
              <span><q-icon name="settings" /></span>
              <span class="float-right">Debtors</span>
            </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <!-- <router-link to="/trash" class="module_link"> -->
        <q-card flat dark class="shadow-2 rad" @click="openVerifyAdminDialog()">
          <q-card-section class="mod_trash">
            <span><q-icon name="delete" /></span>
            <span class="float-right">Recycle Bin and Logs</span>
          </q-card-section>
        </q-card>
        <!-- </router-link> -->
      </div>
    </div>

    <q-dialog
      v-model="verifyAdminDialog"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 500px">
        <div
          v-if="verif_tkn"
          style="background-color: teal; color: white; text-align: center"
        >
          <strong>Confirmation Token Sent.</strong>
        </div>

        <div
          v-if="errorMsg"
          style="background-color: red; color: white; text-align: center"
        >
          <strong>{{ errorMsg }}</strong>
        </div>

        <q-card-section>
          <div class="text-h6">
            Confirm and verify that you are an administrator.
          </div>
        </q-card-section>
        <q-separator color="white" />

        <q-card-section class="q-pt-sm">
          <div v-if="!verif_tkn">
            <q-input
              dense
              outlined
              type="email"
              label="Email"
              v-model="admin_email"
              hint="Please ensure that this admin email exists and is active."
              class="q-mb-sm"
              clearable
            />
            <q-input
              dense
              outlined
              type="password"
              label="Password"
              v-model="admin_password"
              clearable
            />
          </div>
          <div v-else>
            <small
              >Copy your access token from email then paste it below.</small
            >
            <q-input
              dense
              outlined
              label="Access Token"
              v-model="verification_token"
              :hint="confMsg"
            />
          </div>
        </q-card-section>
        <q-separator v-if="verif_tkn" color="teal" />
        <small
          ><q-card-actions v-if="verif_tkn">
            <q-space />
            <strong style="color: teal">Token Expires once used</strong>
          </q-card-actions></small
        >
        <q-separator color="teal" />

        <q-card-actions class="bg-white text-primary">
          <q-btn
            flat
            label="Cancel"
            color="red"
            @click="closeVerifyAdminDialog()"
          />
          <q-space />
          <q-btn
            v-if="!verif_tkn && admin_email"
            flat
            label="Confirm"
            @click="verifyAdmin()"
          />

          <q-btn
            v-if="verif_tkn && verification_token"
            flat
            label="Verify and Continue"
            @click="verifyAccessToken()"
            :loading="loadVerifBtn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import moment from "moment";
import { useRouter } from "vue-router";

import LineChart from "src/components/charts/echarts/LineChart.vue";
import { sendNotification } from "src/utilities/web_push";
import { notifyWhatsapp } from "src/utilities/whatsapp";
import { useUserStore } from "src/stores/user-store";

const user_store = useUserStore();
const router = useRouter();
const $q = useQuasar();

const verifyAdminDialog = ref(false);
const verif_tkn = ref(false);
const loadVerifBtn = ref(false);
const admin_email = ref("");
const admin_password = ref("");
const verification_token = ref("");
const errorMsg = ref("");
const confMsg = ref("");

const openVerifyAdminDialog = () => {
  if (user_store.access_granted) {
    redirectUser("Access granted", "teal");
  } else {
    verifyAdminDialog.value = true;
  }
};

const verifyAdmin = async () => {
  const userLogin = {
    email: admin_email.value.trim(),
    password: admin_password.value.trim(),
  };
  if (userLogin.email && userLogin.password) {
    $q.loading.show({
      message:
        "Verifying admin credentials and sending access token to " +
        userLogin.email +
        ". Please wait...",
    });
    const res = await user_store.confirmAdmin(userLogin);

    if (res.status === "success") {
      confMsg.value = `A one time access token has been sent to ${
        userLogin.email
      }. It ends in .......${res.access_token.slice(-10)}`;
      notifyMsg(
        `Administrator confirmed successfully. access token has been sent to ${userLogin.email}`,
        "teal"
      );
      verif_tkn.value = true;
      $q.loading.hide();
    }
    if (res.status === "error") {
      displayErrorMsg(res.message);
    }
  } else {
    $q.loading.hide();
    notifyMsg("Email and password are required", "red");
  }
};

const verifyAccessToken = async () => {
  loadVerifBtn.value = true;
  const userLogin = {
    access_token: verification_token.value.trim(),
  };
  if (userLogin.access_token) {
    const res = await user_store.verifyAccessToken(userLogin);

    if (res.status === "success") {
      redirectUser(res.message, "green");
    }
    if (res.status === "error") {
      displayErrorMsg(res.message);
      loadVerifBtn.value = false;
    }
  } else {
    $q.loading.hide();
    notifyMsg("Access token is required", "red");
    loadVerifBtn.value = false;
  }
};

const notifyMsg = (message, color) => {
  $q.notify({
    message,
    color,
    position: "top",
  });
};

const displayErrorMsg = (message) => {
  $q.loading.hide();
  errorMsg.value = message;
  notifyMsg(message, "red");
  setTimeout(() => (errorMsg.value = ""), 10000);
};

const redirectUser = (message, color) => {
  router.push("/trash");
  notifyMsg(message, color);
  clearInput();
};

const closeVerifyAdminDialog = () => {
  verifyAdminDialog.value = false;
  clearInput();
};

const clearInput = () => {
  admin_email.value = "";
  admin_password.value = "";
  verification_token.value = "";
  verif_tkn.value = false;
  $q.loading.hide();
  loadVerifBtn.value = false;
};
</script>

<style scoped>
.module_link {
  text-decoration: none;
}

.mod {
  color: white;
  font-weight: 800;
  background: linear-gradient(90deg, #9ebd13 0%, #008552 100%);
}

.mod_trash {
  color: white;
  font-weight: 800;
  background: linear-gradient(90deg, #f32929 0%, #008552 100%);
  cursor: pointer;
}

.rad {
  border-radius: 10px;
}

.mod:hover {
  background: rgb(29, 88, 56);
}

.mod_trash:hover {
  background: rgb(29, 88, 56);
}
</style>
