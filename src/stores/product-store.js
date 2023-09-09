import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useProductStore = defineStore("products", {
  state: () => ({
    products: [],
  }),

  actions: {
    async fetchProducts() {
      if (token) {
        const res = await get_call_module("products", token);
        this.products = res?.data;
        return this.products;
      }
    },

    async createProduct(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "products", token);
        return res;
      }
    },

    async updateProduct(payload) {
      payload.user_uuid = user?.user?.uuid;
      if (token) {
        const res = await post_call_module(payload, "update_product", token);
        return res;
      }
    },

    async deleteProduct(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_product", token);
        return res;
      }
    },
  },
});
