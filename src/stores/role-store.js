import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useRoleStore = defineStore("roles", {
  state: () => ({
    roles: [],
  }),

  actions: {
    async fetchRoles() {
      if (token) {
        const res = await get_call_module("roles", token);
        this.roles = res?.data;
        return this.roles;
      }
    },

    async createRole(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "roles", token);
        return res;
      }
    },

    async updateRole(payload) {
      if (token) {
        const res = await post_call_module(payload, "update_role", token);
        return res;
      }
    },

    async deleteRole(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_role", token);
        return res;
      }
    },
  },
});
