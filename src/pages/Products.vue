<template>
  <div class="q-pa-md">
    <!-- Render products table -->
    <div v-if="isLoading">Loading products...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Products"
      :rows="products"
      :columns="product_columns"
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

          <q-td key="category" :props="props">
            {{ props.row.category }}
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
              @click="openEditProductDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              color="red"
              name="delete"
              @click="deleteProduct(props.row)"
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
          @click="openAddNewProductDialog"
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
          @click="exportExcel(products)"
        />
      </template>
    </q-table>

    <!-- Add/Edit Product dialog -->
    <q-dialog v-model="addEditProduct" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="product_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="product_name && !edit_product"
            flat
            label="Add Product"
            color="primary"
            @click="addNewProduct"
          />

          <q-btn
            v-if="product_name && edit_product"
            flat
            label="Edit Product"
            color="primary"
            @click="editSelectedProduct"
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
import { product_columns } from "src/utilities/columns/product_columns";
import { paginations } from "src/utilities/paginations";
import { useProductStore } from "src/stores/product-store";
import { exportTable } from "src/utilities/excel";

// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const product_store = useProductStore();
const pagination = paginations(10);

// Local variables
const addEditProduct = ref(false);
const edit_product = ref(false);
const filter = ref("");
const form_title = ref("");
const product_name = ref("");
const product_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get products method
const {
  data: products,
  isLoading,
  isError,
} = useQuery("products", () => product_store.fetchProducts());

// Delete product method
const deleteProduct = async (product) => {
  const del = confirm(`Continue with the operation. Delete ${product.name} ?`);
  if (del) {
    const res = await product_store.deleteProduct({ uuid: product.uuid });
    if (res.status === "success") {
      queryClient.refetchQueries("products");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new product dialog
const openAddNewProductDialog = () => {
  form_title.value = "Add New Product";
  addEditProduct.value = true;
  edit_product.value = false;
};

// Trigger edit product dialog
const openEditProductDialog = (product) => {
  edit_product.value = true;
  form_title.value = `Edit ${product.name}`;
  product_name.value = product.name;
  product_id.value = product.uuid;
  addEditProduct.value = true;
};

// Create new product method
const addNewProduct = async () => {
  errorMsg.value = "";

  if (product_name.value.trim()) {
    const res = await product_store.createProduct({
      name: product_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("products");
      product_name.value = "";
      addEditProduct.value = false;

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

// Edit product method
const editSelectedProduct = async () => {
  const dt = {
    name: product_name.value.trim(),
    uuid: product_id.value,
  };

  if (dt.name) {
    const res = await product_store.updateProduct(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("products");

      product_name.value = "";
      addEditProduct.value = false;
      edit_product.value = false;
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
  addEditProduct.value = false;
  product_name.value = "";
  product_id.value = "";
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
const exportExcel = (products) => {
  const dt = products.map((val) => {
    return {
      name: val.name,
      products: val.products.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, product_columns, exportFile, $q, "ProductsData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
