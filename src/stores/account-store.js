import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useAccountStore = defineStore("accounts", {
  state: () => ({
    total_daily_sales: 0,
    total_daily_card_sales: 0,
    total_daily_debt_sales: 0,
    total_daily_cash_sales: 0,
    total_daily_mpesa_cash_sales: 0,
    total_daily_mpesa_sales: 0,
    total_daily_pending_sales: 0,
    total_daily_expense: 0,

    total_sales: 0,
    total_card_sales: 0,
    total_debt_sales: 0,
    total_cash_sales: 0,
    total_mpesa_cash_sales: 0,
    total_mpesa_sales: 0,
    total_pending_sales: 0,
    total_expense: 0,
  }),

  actions: {
    async fetchSalesExpense() {
      if (token) {
        const res = await get_call_module("sales_expense", token);
        return Number(res?.data).toLocaleString();
      }
    },

    async fetchTodaySalesStats() {
      if (token) {
        const res = await get_call_module("sales_stats", token);
        this.total_daily_sales = Number(
          res?.total_daily_sales
        ).toLocaleString();
        this.total_daily_card_sales = Number(
          res?.total_daily_card_sales
        ).toLocaleString();
        this.total_daily_debt_sales = Number(
          res?.total_daily_debt_sales
        ).toLocaleString();
        this.total_daily_cash_sales = Number(
          res?.total_daily_cash_sales
        ).toLocaleString();
        this.total_daily_expense = Number(
          res?.total_daily_expense
        ).toLocaleString();
        this.total_daily_mpesa_cash_sales = Number(
          res?.total_daily_mpesa_cash_sales
        ).toLocaleString();
        this.total_daily_mpesa_sales = Number(
          res?.total_daily_mpesa_sales
        ).toLocaleString();
        this.total_daily_pending_sales = Number(
          res?.total_daily_pending_sales
        ).toLocaleString();
      }
    },

    async fetchAllSalesStats() {
      if (token) {
        const res = await get_call_module("all_sales_stats", token);
        this.total_sales = Number(res?.total_sales).toLocaleString();
        this.total_card_sales = Number(res?.total_card_sales).toLocaleString();
        this.total_debt_sales = Number(res?.total_debt_sales).toLocaleString();
        this.total_cash_sales = Number(res?.total_cash_sales).toLocaleString();
        this.total_mpesa_cash_sales = Number(
          res?.total_mpesa_cash_sales
        ).toLocaleString();
        this.total_mpesa_sales = Number(
          res?.total_mpesa_sales
        ).toLocaleString();
        this.total_pending_sales = Number(
          res?.total_pending_sales
        ).toLocaleString();
        this.total_expense = Number(res?.total_expense).toLocaleString();
      }
    },

    async fetchTodayProductSales() {
      if (token) {
        const res = await get_call_module("today_product_sales", token);
        this.product_sales = res;
        return this.product_sales;
      }
    },

    async fetchAccounts() {
      if (token) {
        const res = await get_call_module("accounts", token);
        this.roles = res?.data;
        return this.roles;
      }
    },

    async createAccount(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "accounts", token);
        return res;
      }
    },

    async updateAccount(payload) {
      payload.user_uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "update_accounts", token);
        return res;
      }
    },
  },
});
