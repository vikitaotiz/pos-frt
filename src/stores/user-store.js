import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useUserStore = defineStore("users", {
  state: () => ({
    users: [],
  }),

  actions: {
    async fetchUsers() {
      if (token) {
        const res = await get_call_module("users", token);
        this.users = res?.data;
        return this.users;
      }
    },

    async createUser(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "users", token);
        return res;
      }
    },

    async updateUser(payload) {
      if (token) {
        const res = await post_call_module(payload, "update_user", token);
        return res;
      }
    },

    async deleteUser(payload) {
      if (token) {
        const res = await post_call_module(payload, "delete_user", token);
        return res;
      }
    },
  },
});
