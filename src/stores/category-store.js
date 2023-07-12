import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useCategoryStore = defineStore("categories", {
  state: () => ({
    categories: [],
  }),

  actions: {
    async fetchCategories() {
      if (token) {
        const res = await get_call_module("categories", token);
        this.categories = res?.data;
        return this.categories;
      }
    },

    async createCategory(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "categories", token);
        return res;
      }
    },

    async updateCategory(payload) {
      if (token) {
        const res = await post_call_module(payload, "update_category", token);
        return res;
      }
    },

    async deleteCategory(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_category", token);
        return res;
      }
    },
  },
});
