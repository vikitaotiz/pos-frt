<template>
  <div class="q-pa-md">
    <q-card dark class="bg-primary q-mb-sm q-pa-none">
      <q-toolbar
        ><q-btn
          dense
          flat
          icon="arrow_back"
          label="Back"
          @click="$router.back()"
        /><q-space />
        <span
          ><q-toggle
            v-model="toggleView"
            checked-icon="check"
            color="orange"
            unchecked-icon="clear"
            :label="`${toggleView ? 'Table View.' : 'Mobile View.'}`"
          />
        </span>
        <span
          class="q-ml-sm"
          v-if="!toggleView && hasPermission(auth_store?.user?.user?.roles)"
        >
          <q-btn
            @click="openAddNewProductDialog"
            dense
            color="orange"
            size="sm"
            icon="add"
            label="Add Product"
            unelevated
          />

          <q-btn
            v-if="products?.length > 0"
            dense
            outline
            icon="archive"
            label="Export Products"
            class="q-ml-sm"
            size="sm"
            @click="exportExcel(products)"
          />
        </span>
      </q-toolbar>
    </q-card>
    <!-- Render products table -->
    <div v-if="isLoading">Loading products...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="All Products"
      :rows="products"
      :columns="product_columns"
      separator="cell"
      row-key="name"
      :filter="filter"
      dense
      :grid="toggleView"
    >
      <template v-slot:body="props">
        <q-tr
          :props="props"
          :class="`${
            props.row.quantity <= props.row.min_quantity ||
            props.row.quantity < 1
              ? 'blink-bg'
              : ''
          }`"
        >
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>
          <q-td key="measurement" :props="props">
            {{ props.row.measurement }}
            <small
              ><q-badge>: {{ props.row.quantity }}</q-badge></small
            >
          </q-td>

          <q-td key="min_quantity" :props="props">
            {{ props.row.min_quantity }}
          </q-td>

          <q-td key="buying_price" :props="props">
            {{ props.row.buying_price }}
          </q-td>

          <q-td key="selling_price" :props="props">
            {{ props.row.selling_price }}
          </q-td>

          <q-td key="department" :props="props">
            {{ props.row.department }}
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

          <q-td
            key="actions"
            :props="props"
            v-if="hasPermission(auth_store?.user?.user?.roles)"
          >
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
          placeholder="Search product"
          class="q-mr-md"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>

    <!-- Add/Edit Product dialog -->
    <q-dialog v-model="addEditProduct" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="name" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-if="!edit_product && hasPermission(auth_store?.user?.user?.roles)"
            outlined
            dense
            label="Initial Quantity"
            v-model="quantity"
            type="number"
            min="1"
            oninput="validity.valid||(value='')"
          />

          <q-banner v-else class="bg-primary text-white">
            <q-toolbar>
              <small
                ><b
                  >Product Quantity should be adjusted from inventories.</b
                ></small
              >
              <q-space />
              <q-btn label="INVENTORIES" outline size="sm" to="/inventories" />
            </q-toolbar>
          </q-banner>
        </q-card-section>

        <div style="background-color: rgb(197, 238, 206); padding: 3px">
          <q-input
            v-if="hasPermission(auth_store?.user?.user?.roles)"
            outlined
            dense
            label="Minimum Quantity"
            v-model="min_quantity"
            type="number"
            min="0"
            oninput="validity.valid||(value='');"
            class="q-ma-md"
            filled
            hint="Minimum Quantity that will prompt for product restock..."
          >
            <template v-slot:prepend>
              <q-icon name="blur_on" />
            </template>
          </q-input>
        </div>

        <div class="row q-col-gutter-sm q-mb-sm q-pa-md">
          <q-input
            outlined
            dense
            label="Buying Price (Per Unit)"
            v-model="buying_price"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
            class="col-6"
          />
          <q-input
            outlined
            dense
            label="Selling Price (Per Unit)"
            v-model="selling_price"
            type="number"
            min="1"
            oninput="validity.valid||(value='');"
            class="col-6"
          />
        </div>

        <div class="row q-col-gutter-sm q-mb-sm q-pa-md">
          <q-select
            dense
            outlined
            v-model="category_id"
            :options="data_categories"
            option-value="uuid"
            option-label="name"
            label="Select Product Category"
            class="col-6"
          />
          <q-select
            dense
            outlined
            v-model="measurement_id"
            :options="data_measurements"
            option-value="uuid"
            option-label="name"
            label="Select Product Measurement"
            class="col-6"
          />
        </div>

        <q-card-section class="q-pt-none">
          <q-select
            dense
            outlined
            v-model="department_id"
            :options="data_departments"
            option-value="uuid"
            option-label="name"
            label="Select Product Department"
          />
        </q-card-section>

        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="name && !edit_product"
            flat
            label="Add Product"
            color="primary"
            @click="addNewProduct"
            :loading="loadingProductBtn"
          />

          <q-btn
            v-if="name && edit_product"
            flat
            label="Edit Product"
            color="primary"
            @click="editSelectedProduct"
            :loading="loadingProductBtn"
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
import { useProductStore } from "src/stores/product-store";
import { exportTable } from "src/utilities/excel";
import { useCategoryStore } from "src/stores/category-store";
import { useMeasurementStore } from "src/stores/measurement-store";
import { useDepartmentStore } from "src/stores/department-store";
import { useAuthStore } from "src/stores/auth-store";
import { hasPermission } from "src/utilities/helpers";

const auth_store = useAuthStore();
// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const product_store = useProductStore();
const category_store = useCategoryStore();
const measurement_store = useMeasurementStore();
const department_store = useDepartmentStore();

// Local variables
const addEditProduct = ref(false);
const edit_product = ref(false);
const loadingProductBtn = ref(false);
const toggleView = ref(false);
const filter = ref("");
const form_title = ref("");
const product_uuid = ref("");
const errorMsg = ref("");

const name = ref("");
const quantity = ref(0);
const min_quantity = ref(0);
const buying_price = ref(1);
const selling_price = ref(1);

// Vue query initial data load - Get products method
const {
  data: products,
  isLoading,
  isError,
} = useQuery("products", () => product_store.fetchProducts());

const measurement_id = ref("");
let data_measurements = ref([]);
const category_id = ref("");
let data_categories = ref([]);
const department_id = ref("");
let data_departments = ref([]);

// Vue query initial data load - Get categories method
useQuery("categories", () => category_store.fetchCategories(), {
  onSuccess: (data) => {
    data_categories.value = data.map((el) => {
      return {
        uuid: el.uuid,
        name: el.name,
      };
    });
  },
});

// Vue query initial data load - Get measurements method
useQuery("measurements", () => measurement_store.fetchMeasurements(), {
  onSuccess: (data) => {
    data_measurements.value = data.map((el) => {
      return {
        uuid: el.uuid,
        name: el.name,
      };
    });
  },
});

// Vue query initial data load - Get departments method
useQuery("departments", () => department_store.fetchDepartments(), {
  onSuccess: (data) => {
    data_departments.value = data.map((el) => {
      return {
        uuid: el.uuid,
        name: el.name,
      };
    });
  },
});

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
  edit_product.value = false;
  if (category_store.categories.length === 0) {
    notifyUser(
      "You need to create at least one CATEGORY in order to create products!",
      "orange",
      "top"
    );
  } else {
    form_title.value = "Add New Product";
    addEditProduct.value = true;
  }
};

// Trigger edit product dialog
const openEditProductDialog = (dat) => {
  edit_product.value = true;
  form_title.value = `Edit ${dat.name}`;

  product_uuid.value = dat.uuid;
  addEditProduct.value = true;
  name.value = dat.name;
  quantity.value = dat.quantity;
  min_quantity.value = dat.min_quantity;
  buying_price.value = dat.buying_price;
  selling_price.value = dat.selling_price;

  measurement_id.value = data_measurements.value.find(
    (el) => el.name === dat.measurement
  );
  category_id.value = data_categories.value.find(
    (el) => el.name === dat.category
  );
  department_id.value = data_departments.value.find(
    (el) => el.name === dat.department
  );
};

// Create new product method
const addNewProduct = async () => {
  errorMsg.value = "";
  loadingProductBtn.value = true;

  const prod = {
    name: name.value.trim(),
    quantity: quantity.value,
    min_quantity: Number(min_quantity.value),

    selling_price: selling_price.value,
    buying_price: buying_price.value,

    category_uuid: category_id.value.uuid,
    department_uuid: department_id.value.uuid,
    measurement_uuid: measurement_id.value.uuid,
  };

  if (
    prod.name &&
    prod.quantity &&
    prod.min_quantity &&
    prod.selling_price &&
    prod.buying_price &&
    prod.category_uuid &&
    prod.department_uuid &&
    prod.measurement_uuid
  ) {
    const res = await product_store.createProduct(prod);

    if (res.status === "success") {
      queryClient.refetchQueries("products");
      queryClient.refetchQueries("finished_products");
      clearInputs();

      notifyUser(res.message, "green", "top");
    } else {
      errorMsg.value = res.message;
      notifyUser(res.message, "red", "top-right");
    }
  } else {
    errorMsg.value = "All fields are required!";
    loadingProductBtn.value = false;
    notifyUser("All fields are required!", "red", "top-right");
  }
};

// Edit product method
const editSelectedProduct = async () => {
  errorMsg.value = "";
  loadingProductBtn.value = true;

  const prod = {
    product_uuid: product_uuid.value,
    name: name.value.trim(),
    quantity: quantity.value,
    min_quantity: Number(min_quantity.value),

    selling_price: selling_price.value,
    buying_price: buying_price.value,

    category_uuid: category_id.value.uuid,
    department_uuid: department_id.value.uuid,
    measurement_uuid: measurement_id.value.uuid,
  };

  if (
    prod.name &&
    prod.quantity &&
    prod.selling_price &&
    prod.buying_price &&
    prod.category_uuid &&
    prod.department_uuid &&
    prod.measurement_uuid
  ) {
    const res = await product_store.updateProduct(prod);

    if (res.status === "success") {
      queryClient.refetchQueries("products");
      queryClient.refetchQueries("finished_products");
      clearInputs();
      notifyUser(res.message, "green", "top");
    } else notifyUser(res.message, "red", "top-right");
  } else {
    errorMsg.value = "All fields are required!";
    notifyUser("All fields are required!", "red", "top-right");
  }
};

// Close Add/Edit dialog
const closeAddEditDialog = () => clearInputs();

// Shared notification method
const notifyUser = (message, color, position) => {
  $q.notify({
    message,
    color,
    position,
  });
};

const clearInputs = () => {
  name.value = "";
  selling_price.value = 1;
  buying_price.value = 1;
  category_id.value = "";
  department_id.value = "";
  measurement_id.value = "";
  quantity.value = 1;
  min_quantity.value = 0;

  addEditProduct.value = false;
  loadingProductBtn.value = false;
  edit_product.value = false;
  form_title.value = "";
  errorMsg.value = "";
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

.blink-bg {
  color: #fff;
  animation: blinkingBackground 5s infinite;
}
@keyframes blinkingBackground {
  0% {
    background-color: rgb(4, 187, 187);
  }
  /* 25% {
    background-color: #1056c0;
  } */
  50% {
    background-color: rgb(244, 106, 56);
  }
  /* 75% {
    background-color: #254878;
  } */
  100% {
    background-color: rgb(4, 187, 187);
  }
}
</style>
