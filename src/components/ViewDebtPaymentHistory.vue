<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="paymentHistory">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ debt_records }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
const paymentHistory = ref(false);

const props = defineProps(["debt_records", "paymentHistoryDialog"]);

paymentHistory.value = props.paymentHistoryDialog;
</script>
