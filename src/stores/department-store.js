import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useDepartmentStore = defineStore("departments", {
  state: () => ({
    departments: [],
  }),

  actions: {
    async fetchDepartments() {
      if (token) {
        const res = await get_call_module("departments", token);
        this.departments = res?.data;
        return this.departments;
      }
    },

    async createDepartment(payload) {
      if (token) {
        console.log(payload);
        const res = await post_call_module(payload, "departments", token);
        console.log(res);
        return res;
      }
    },

    async updateDepartment(payload) {
      if (token) {
        const res = await post_call_module(payload, "update_department", token);
        return res;
      }
    },

    async deleteDepartment(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_department", token);
        return res;
      }
    },
  },
});
