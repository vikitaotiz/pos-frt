<template>
  <q-page class="flex flex-center">
    <div class="q-gutter-y-md desktop_size mobile_size">
      <q-card flat style="border-radius: 10px">
        <q-card-section class="text-center">
          <p style="font-weight: 800; font-size: larger; color: #017951">
            <q-icon name="grain" style="font-size: 30px" /> <br />Login to the
            System
          </p>
          <hr />
        </q-card-section>

        <q-card-section>
          <q-input
            rounded
            dense
            outlined
            type="email"
            label="Email"
            v-model="formData.email"
            class="q-mb-sm"
          />
          <q-input
            rounded
            dense
            outlined
            type="password"
            label="Password"
            v-model="formData.password"
            class="q-mb-sm"
          />

          <small style="color: red">{{ errorMsg }}</small>

          <q-btn
            icon="person"
            dense
            label="Login"
            dark
            color="primary"
            @click="login"
            class="full-width"
            :loading="loadLogin"
            rounded
            unelevated
          />
          <div class="text-center">
            <small style="color: #017951"
              ><i>For any queries, please contact your admin.</i></small
            >
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuthStore } from "src/stores/auth-store";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
// import { send_push_notification } from "src/utilities/web_push_sub";
// import { useProductStore } from "src/stores/product-store";

// const product_store = useProductStore();
// const tab = ref("login");
const loadLogin = ref(false);
const errorMsg = ref("");

const quasarPlugins = useQuasar();
const router = useRouter();
const user_store = useAuthStore();

// Form data
const formData = reactive({
  name: "",
  email: "",
  password: "",
});

// Methods
// Login
const login = async () => {
  const userLogin = {
    email: formData.email.trim(),
    password: formData.password.trim(),
  };
  if (userLogin.email && userLogin.password) {
    loadLogin.value = true;
    const res = await user_store.login(userLogin);

    if (res.status === "success") {
      redirectUser(res.message, "green");
    } else {
      loadLogin.value = false;
      displayErrorMsg(res.message);
    }
  } else {
    loadLogin.value = false;
    notifyMsg("Email and password are required", "red");
  }
};

const notifyMsg = (message, color) => {
  quasarPlugins.notify({
    message,
    color,
    position: "top",
  });
};

const displayErrorMsg = (message) => {
  errorMsg.value = message;
  notifyMsg(message, "red");
  setTimeout(() => (errorMsg.value = ""), 10000);
};

const redirectUser = (message, color) => {
  router.push("/dashboard");
  loadLogin.value = false;
  notifyMsg(message, color);
};
</script>

<style scoped>
.desktop_size {
  width: 40%;
}

@media screen and (max-width: 768px) {
  .mobile_size {
    width: 80%;
  }
}
</style>
