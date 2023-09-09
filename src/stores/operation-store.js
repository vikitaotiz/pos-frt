import { defineStore } from "pinia";

export const useOperationStore = defineStore("operation", {
  state: () => ({
    selected_products: [],
  }),

  actions: {},
});
