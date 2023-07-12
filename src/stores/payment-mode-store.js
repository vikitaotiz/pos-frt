import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const usePaymentModeStore = defineStore("payment_modes", {
  state: () => ({
    payment_modes: [],
  }),

  actions: {
    async fetchPaymentModes() {
      if (token) {
        const res = await get_call_module("payment_modes", token);
        this.payment_modes = res?.data;
        return this.payment_modes;
      }
    },

    async createPaymentMode(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "payment_modes", token);
        return res;
      }
    },

    async updatePaymentMode(payload) {
      if (token) {
        const res = await post_call_module(
          payload,
          "update_payment_mode",
          token
        );
        return res;
      }
    },

    async deletePaymentMode(payload) {
      if (token) {
        const res = await post_call_module(
          payload,
          "delete_payment_mode",
          token
        );
        return res;
      }
    },
  },
});
