import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useSaleStore = defineStore("sales", {
  state: () => ({
    sales: [],
    bills: [],
  }),

  actions: {
    async fetchSales() {
      if (token) {
        const res = await get_call_module("sales", token);
        this.sales = res?.data;
        return this.sales;
      }
    },

    async fetchBills() {
      if (token) {
        const res = await get_call_module("bills", token);
        this.bills = res?.data;
        return this.bills;
      }
    },

    async fetchSevenDaysSales() {
      if (token) {
        const res = await get_call_module("sales_last_seven_days", token);
        return res?.data;
      }
    },

    async createSale(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "sales", token);
        return res;
      }
    },

    async createSaleOperation(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "create_bill_sales", token);
        return res;
      }
    },

    async createHoldBillOperation(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(
          payload,
          "create_bill_sales_pending",
          token
        );
        return res;
      }
    },

    async updateSale(payload) {
      if (token) {
        const res = await post_call_module(payload, "update_sale", token);
        return res;
      }
    },

    async deleteSale(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_sale", token);
        return res;
      }
    },
  },
});
