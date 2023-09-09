import { defineStore } from "pinia";
import { get_call_module } from "src/utilities/api_calls/module_calls";

export const useFinishedProductStore = defineStore("finished_products", {
  state: () => ({
    finished_products: [],
  }),

  actions: {
    async fetchFinishedProducts() {
      const res = await get_call_module("finished_products");
      this.finished_products = res?.data;
      return this.finished_products;
    },
  },
});
