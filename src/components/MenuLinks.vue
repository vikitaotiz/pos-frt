<template>
  <div>
    <q-list>
      <q-item-label header class="text-center"> Menu </q-item-label>
      <q-separator color="primary" />

      <q-item clickable to="/dashboard">
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Dashboard</q-item-label>
          <q-item-label caption><small>App Reports</small></q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />

      <q-item clickable to="/operations">
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Operations</q-item-label>
          <q-item-label caption><small>Sale Operations</small></q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />

      <q-item clickable to="/bills">
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Bills</q-item-label>
          <q-item-label caption><small>Sold/On Hold Bills</small></q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />

      <q-item clickable to="/products">
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Products</q-item-label>
          <q-item-label caption><small>Products</small></q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />
      <q-item clickable to="/categories">
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Categories</q-item-label>
          <q-item-label caption><small>Product Categories</small></q-item-label>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable to="/settings" v-if="isAdmin()">
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Settings</q-item-label>
          <q-item-label caption><small>App Settings</small></q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { useAuthStore } from "src/stores/auth-store";

const user_store = useAuthStore();

const isAdmin = () =>
  user_store?.user?.user?.roles.some(
    (role) => role["name"] === "Administrator"
  );
</script>
