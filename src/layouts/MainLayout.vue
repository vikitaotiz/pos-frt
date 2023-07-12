<template>
  <q-layout view="lHh Lpr lFf" class="bg-color">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="user_store?.user?.token"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Sales App </q-toolbar-title>

        <div>
          <span v-if="user_store?.user?.token">
            {{ user_store?.user?.user?.name }}
            <q-btn
              flat
              label="Logout"
              @click="logout"
              :loading="logoutLoading"
            />
          </span>
          <span v-else> Sales v{{ $q.version }} </span>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="user_store?.user?.token"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="210"
    >
      <MenuLinks />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from "quasar";
import MenuLinks from "src/components/MenuLinks.vue";
import { useAuthStore } from "src/stores/auth-store";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
const user_store = useAuthStore();

const leftDrawerOpen = ref(false);
const logoutLoading = ref(false);

const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value);

const logout = async () => {
  logoutLoading.value = true;
  const res = await user_store.logout();
  if (res.status === "success") {
    $q.notify({
      message: res.message,
      color: "green",
      position: "top",
    });
    logoutLoading.value = false;
    router.push("/");
  }
};
</script>
<style scoped>
.bg-color {
  background-color: aliceblue;
}
</style>
