import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useInventoryStore = defineStore("inventories", {
  state: () => ({
    inventories: [],
  }),

  actions: {
    async fetchInventories() {
      if (token) {
        const res = await get_call_module("inventories", token);
        this.inventories = res?.data;
        return this.inventories;
      }
    },

    async createInventory(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "inventories", token);
        return res;
      }
    },

    async updateInventory(payload) {
      if (token) {
        const res = await post_call_module(payload, "update_inventory", token);
        return res;
      }
    },

    async deleteInventory(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_inventory", token);
        return res;
      }
    },
  },
});
