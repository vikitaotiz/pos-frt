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
    access_granted: false,
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
      payload.user_uuid = user?.user?.uuid;

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

    async confirmAdmin(payload) {
      if (token) {
        const res = await post_call_module(payload, "confirm_admin", token);
        return res;
      }
    },

    async verifyAccessToken(payload) {
      if (token) {
        const res = await post_call_module(
          payload,
          "verify_access_token",
          token
        );
        this.access_granted = res.access_granted;
        return res;
      }
    },
  },
});
