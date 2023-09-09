import { defineStore } from "pinia";
import {
  get_call_module,
  post_call_module,
} from "src/utilities/api_calls/module_calls";
import { storedUser } from "src/utilities/stored_user";

const user = storedUser();
const token = user?.token;

export const useMeasurementStore = defineStore("measurements", {
  state: () => ({
    measurements: [],
  }),

  actions: {
    async fetchMeasurements() {
      if (token) {
        const res = await get_call_module("measurements", token);
        this.measurements = res?.data;
        return this.measurements;
      }
    },

    async createMeasurement(payload) {
      payload.uuid = user?.user?.uuid;

      if (token) {
        const res = await post_call_module(payload, "measurements", token);
        return res;
      }
    },

    async updateMeasurement(payload) {
      if (token) {
        const res = await post_call_module(
          payload,
          "update_measurement",
          token
        );
        return res;
      }
    },

    async deleteMeasurement(payload) {
      if (token) {
        const res = await post_call_module(
          payload,
          "delete_measurement",
          token
        );
        return res;
      }
    },
  },
});
