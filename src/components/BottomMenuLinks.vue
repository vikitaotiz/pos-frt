<template>
  <div>
    <q-tabs dense>
      <q-route-tab to="/dashboard" icon="dashboard" label="Dashboard" />

      <q-route-tab to="/operations" label="Operations" icon="bubble_chart" />

      <q-route-tab to="/bills" label="Bills" icon="description" />

      <q-route-tab to="/products" label="Products" icon="list" />

      <q-route-tab to="/categories" label="Categories" icon="list" />

      <q-route-tab
        to="/accounts"
        label="Accounts"
        icon="show_chart"
        v-if="hasPermission(user_store?.user?.user?.roles)"
      />

      <q-route-tab
        to="/inventories"
        label="Inventory"
        icon="library_books"
        v-if="hasPermission(user_store?.user?.user?.roles)"
      />

      <q-route-tab
        to="/settings"
        v-if="isAdmin()"
        label="Settings"
        icon="settings"
      />
    </q-tabs>
  </div>
</template>

<script setup>
import { useAuthStore } from "src/stores/auth-store";
import { hasPermission } from "src/utilities/helpers";

const user_store = useAuthStore();

const isAdmin = () =>
  user_store?.user?.user?.roles.some((role) => role["name"] === "Admin");
</script>
