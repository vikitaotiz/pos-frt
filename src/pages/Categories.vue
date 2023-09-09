<template>
  <div class="q-pa-md">
    <!-- Render categories table -->
    <div v-if="isLoading">Loading categories...</div>
    <div v-else-if="isError">An error has occurred: {{ isError }}</div>
    <q-table
      v-else
      title="Categories"
      :rows="categories"
      :columns="category_columns"
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

          <q-td key="products" :props="props">
            {{ props.row.products.length }}
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
              @click="openEditCategoryDialog(props.row)"
              style="cursor: pointer"
              size="20px"
              class="q-mr-md"
            />
            <q-icon
              v-if="props.row.products.length === 0"
              color="red"
              name="delete"
              @click="deleteCategory(props.row)"
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

        <q-btn-group v-if="hasPermission(auth_store?.user?.user?.roles)">
          <q-btn
            @click="openAddNewCategoryDialog"
            round
            dense
            color="primary"
            icon="add"
            label="Add"
          />

          <q-btn
            v-if="categories?.length > 0"
            dense
            flat
            color="primary"
            icon-right="archive"
            label="Export"
            class="q-ml-sm"
            no-caps
            @click="exportExcel(categories)"
          />
        </q-btn-group>
      </template>
    </q-table>

    <!-- Add/Edit Category dialog -->
    <q-dialog v-model="addEditCategory" persistent>
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form_title }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined dense label="Name" v-model="category_name" />
        </q-card-section>
        <div class="text-center error_msg">
          <small>{{ errorMsg }}</small>
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" @click="closeAddEditDialog" />
          <q-space />
          <q-btn
            v-if="category_name && !edit_category"
            flat
            label="Add Category"
            color="primary"
            @click="addNewCategory"
            :loading="loadingCategoryBtn"
          />

          <q-btn
            v-if="category_name && edit_category"
            flat
            label="Edit Category"
            color="primary"
            @click="editSelectedCategory"
            :loading="loadingCategoryBtn"
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
import { category_columns } from "src/utilities/columns/category_columns";
import { useCategoryStore } from "src/stores/category-store";
import { exportTable } from "src/utilities/excel";
import { useAuthStore } from "src/stores/auth-store";
import { hasPermission } from "src/utilities/helpers";

const auth_store = useAuthStore();
// Global and store initialization
const $q = useQuasar();
const queryClient = useQueryClient();
const category_store = useCategoryStore();

// Local variables
const addEditCategory = ref(false);
const loadingCategoryBtn = ref(false);
const edit_category = ref(false);
const filter = ref("");
const form_title = ref("");
const category_name = ref("");
const category_id = ref("");
const errorMsg = ref("");

// Vue query initial data load - Get categories method
const {
  data: categories,
  isLoading,
  isError,
} = useQuery("categories", () => category_store.fetchCategories());

// Delete category method
const deleteCategory = async (category) => {
  const del = confirm(`Continue with the operation. Delete ${category.name} ?`);
  if (del) {
    const res = await category_store.deleteCategory({ uuid: category.uuid });
    if (res.status === "success") {
      queryClient.refetchQueries("categories");
      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  }
};

// Trigger add new category dialog
const openAddNewCategoryDialog = () => {
  form_title.value = "Add New Category";
  addEditCategory.value = true;
  edit_category.value = false;
};

// Trigger edit category dialog
const openEditCategoryDialog = (category) => {
  edit_category.value = true;
  form_title.value = `Edit ${category.name}`;
  category_name.value = category.name;
  category_id.value = category.uuid;
  addEditCategory.value = true;
};

// Create new category method
const addNewCategory = async () => {
  loadingCategoryBtn.value = true;
  errorMsg.value = "";

  if (category_name.value.trim()) {
    const res = await category_store.createCategory({
      name: category_name.value.trim(),
    });
    if (res.status === "success") {
      queryClient.refetchQueries("categories");
      category_name.value = "";
      addEditCategory.value = false;
      loadingCategoryBtn.value = false;

      notifyUser(res.message, "green", "top");
    } else {
      loadingCategoryBtn.value = false;

      errorMsg.value = res.message;
      notifyUser(res.message, "red", "top-right");
    }
  } else {
    errorMsg.value = "Name is required!";
    notifyUser("Name is required!", "red", "top-right");
  }
};

// Edit category method
const editSelectedCategory = async () => {
  loadingCategoryBtn.value = true;

  const dt = {
    name: category_name.value.trim(),
    uuid: category_id.value,
  };

  if (dt.name) {
    const res = await category_store.updateCategory(dt);
    if (res.status === "success") {
      queryClient.refetchQueries("categories");

      category_name.value = "";
      addEditCategory.value = false;
      edit_category.value = false;
      form_title.value = "";
      loadingCategoryBtn.value = false;

      notifyUser(res.message, "green", "top");
    } else notifyUser("There was an error", "red", "top-right");
  } else {
    loadingCategoryBtn.value = false;

    errorMsg.value = "Name is required!";
    notifyUser("Name is required!", "red", "top-right");
  }
};

// Close Add/Edit dialog
const closeAddEditDialog = () => {
  addEditCategory.value = false;
  category_name.value = "";
  category_id.value = "";
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
const exportExcel = (categories) => {
  const dt = categories.map((val) => {
    return {
      name: val.name,
      products: val.products.length,
      created_at: val.created_at,
    };
  });
  exportTable(dt, category_columns, exportFile, $q, "CategoriesData");
};
</script>

<style scope>
.error_msg {
  color: red;
}
</style>
