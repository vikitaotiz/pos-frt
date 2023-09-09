<template>
  <div>
    <q-list>
      <q-item-label header class="text-center"> Menu </q-item-label>
      <q-separator color="primary" />
      <div class="q-pa-md">
        <q-item clickable to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Dashboard</q-item-label>
            <q-item-label caption><small>App Reports</small></q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />

        <q-item clickable to="/operations">
          <q-item-section avatar>
            <q-icon name="bubble_chart" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Operations</q-item-label>
            <q-item-label caption><small>Sale Operations</small></q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />

        <q-item clickable to="/bills" exact>
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Bills</q-item-label>
            <q-item-label caption
              ><small>Sold/On Hold Bills</small></q-item-label
            >
          </q-item-section>
        </q-item>
        <q-separator />

        <q-item clickable to="/products">
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Products</q-item-label>
            <q-item-label caption><small>Products</small></q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item clickable to="/categories">
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Categories</q-item-label>
            <q-item-label caption
              ><small>Product Categories</small></q-item-label
            >
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item
          clickable
          to="/accounts"
          v-if="hasPermission(user_store?.user?.user?.roles)"
        >
          <q-item-section avatar>
            <q-icon name="show_chart" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Accounts</q-item-label>
            <q-item-label caption><small>Sales Accounts</small></q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item
          clickable
          to="/inventories"
          v-if="hasPermission(user_store?.user?.user?.roles)"
        >
          <q-item-section avatar>
            <q-icon name="library_books" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Inventory</q-item-label>
            <q-item-label caption
              ><small>Products Inventory</small></q-item-label
            >
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item clickable to="/settings" v-if="isAdmin()">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="heavy">Settings</q-item-label>
            <q-item-label caption><small>App Settings</small></q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-list>

    <div
      v-if="user_store?.user?.token"
      style="text-align: center; margin-top: 40%"
    >
      <q-icon name="person" />
      {{ user_store?.user?.user?.name }}
      <hr />
      <small>
        <q-badge
          color="blue"
          v-for="role in user_store?.user?.user?.roles"
          :key="role.uuid"
          >{{ role.name }}</q-badge
        >
      </small>
      <hr />
      <small>
        <q-badge
          color="purple"
          v-for="department in user_store?.user?.user?.departments"
          :key="department.uuid"
          >{{ department.name }}</q-badge
        >
      </small>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "src/stores/auth-store";

import { hasPermission } from "src/utilities/helpers";
const user_store = useAuthStore();

const isAdmin = () =>
  user_store?.user?.user?.roles.some((role) => role["name"] === "Admin");
</script>
<style scoped>
.heavy {
  font-weight: 700;
}
</style>
