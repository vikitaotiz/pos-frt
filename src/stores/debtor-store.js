import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useDebtorStore = defineStore("debtors", {
  state: () => ({
    debtors: [],
  }),

  actions: {
    async fetchDebtors() {
      if (token) {
        const res = await get_call_module("debtors", token);
        this.debtors = res?.data;
        return this.debtors;
      }
    },

    async createDebtor(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "debtors", token);
        return res;
      }
    },

    async updateDebtor(payload) {
      if (token) {
        const res = await post_call_module(payload, "update_debtor", token);
        return res;
      }
    },

    async deleteDebtor(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_debtor", token);
        return res;
      }
    },
  },
});
