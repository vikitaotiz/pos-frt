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
    uncleared_bills: [],
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

    async fetchUnclearedBills() {
      if (token) {
        const res = await get_call_module("uncleared_bills", token);
        this.uncleared_bills = res?.data;
        return this.uncleared_bills;
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

    async updateSaleOperation(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "update_bill_sales", token);
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

    async addProductToBill(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(
          payload,
          "add_product_to_bill",
          token
        );
        return res;
      }
    },

    async payUnclearedBill(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(
          payload,
          "pay_uncleared_bill",
          token
        );
        return res;
      }
    },

    async fetchBillsInDateRange(payload) {
      if (token) {
        const res = await post_call_module(payload, "get_older_bills", token);
        return res;
      }
    },

    async fetchSalesInDateRange(payload) {
      if (token) {
        const res = await post_call_module(payload, "get_older_sales", token);
        return res;
      }
    },

    async removeProductFromBill(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(
          payload,
          "remove_product_from_bill",
          token
        );
        return res?.data;
      }
    },

    async deleteBill(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "remove_bill", token);
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
