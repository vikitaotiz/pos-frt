import { defineStore } from "pinia";
import {
  get_call_module,
  // post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useDeletedRecordStore = defineStore("deleted_records", {
  state: () => ({
    deleted_records: [],
  }),

  actions: {
    async fetchDeletedRecords() {
      if (token) {
        const res = await get_call_module("deleted_records", token);
        this.deleted_records = res;
        return this.deleted_records;
      }
    },

    // async createCategory(payload) {
    //   payload.uuid = user?.user?.uuid;

    //   if (token) {
    //     const res = await post_call_module(payload, "deleted_records", token);
    //     return res;
    //   }
    // },

    // async updateCategory(payload) {
    //   if (token) {
    //     const res = await post_call_module(payload, "update_category", token);
    //     return res;
    //   }
    // },

    // async deleteCategory(payload) {
    //   if (token) {
    //     const res = await post_call_module(payload, "delete_category", token);
    //     return res;
    //   }
    // },
  },
});
