<template>
  <q-card flat class="card_border">
    <div class="text-center q-pa-sm">
      <b style="color: #017951"><q-icon name="grain" /> Today Sales</b>
    </div>
    <q-separator color="primary" />
    <div class="desktop_stats row q-pa-sm">
      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="shadow-2 total_grad card_border">
          <q-card-section class="text-center">
            Total
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_sales }}
            </h6>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="shadow-2 cash_grad card_border">
          <q-card-section class="text-center">
            Cash
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_cash_sales }}
            </h6>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="shadow-2 mpesa_grad card_border">
          <q-card-section class="text-center">
            Mpesa
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_mpesa_sales }}
            </h6>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="shadow-2 mpesa_cash_grad card_border">
          <q-card-section class="text-center">
            Mpesa & Cash
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_mpesa_cash_sales }}
            </h6>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="shadow-2 debts_grad card_border">
          <q-card-section class="text-center">
            Debts
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_debt_sales }}
            </h6>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card dark class="shadow-2 card_grad card_border">
          <q-card-section class="text-center">
            Card
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_card_sales }}
            </h6>
          </q-card-section>
        </q-card>
      </div>

      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4"
        v-if="account_store?.total_daily_pending_sales > 0"
      >
        <q-card dark class="shadow-2 pending_grad card_border">
          <q-card-section class="text-center">
            No. of Pending Bills
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_pending_sales }}
            </h6>
          </q-card-section>
        </q-card>
      </div>

      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4"
        v-if="account_store?.total_daily_pending_sales > 0"
      >
        <q-card dark class="shadow-2 purchases_grad card_border">
          <q-card-section class="text-center">
            Purchases/Inventory
            <q-separator color="white" inset />
            <h6 class="q-ma-sm small_text">
              {{ account_store?.total_daily_expense }}
            </h6>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="mobile_stats q-pa-sm">
      <q-list>
        <q-item dark class="q-my-sm total_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>Total</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_sales }}</b>
          </q-item-section>
        </q-item>
        <q-item dark class="q-my-sm cash_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>Cash</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_cash_sales }}</b>
          </q-item-section>
        </q-item>
        <q-item dark class="q-my-sm mpesa_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>Mpesa</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_mpesa_sales }}</b>
          </q-item-section>
        </q-item>
        <q-item dark class="q-my-sm mpesa_cash_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>Mpesa & Cash</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_mpesa_cash_sales }}</b>
          </q-item-section>
        </q-item>
        <q-item dark class="q-my-sm debts_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>Debts</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_debt_sales }}</b>
          </q-item-section>
        </q-item>
        <q-item dark class="q-my-sm card_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>Card</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_card_sales }}</b>
          </q-item-section>
        </q-item>
        <q-item dark class="q-my-sm pending_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>No. of Pending Bills</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_pending_sales }}</b>
          </q-item-section>
        </q-item>
        <q-item dark class="q-my-sm purchases_grad card_border">
          <q-item-section avatar>
            <q-icon name="blur_on" />
          </q-item-section>
          <q-item-section>Purchases/Inventory</q-item-section>
          <q-item-section side>
            <b>{{ account_store?.total_daily_expense }}</b>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>

<script setup>
import { useQuery } from "vue-query";
import { useAccountStore } from "src/stores/account-store";

const account_store = useAccountStore();

useQuery("account_stats_today", () => account_store.fetchTodaySalesStats());
// useQuery("account_stats_all", () => account_store.fetchAllSalesStats());
</script>

<style scoped>
.total_grad {
  background: linear-gradient(90deg, #1cb5e0 0%, #000851 100%);
}

.cash_grad {
  background: linear-gradient(90deg, #9ebd13 0%, #008552 100%);
}
.mpesa_grad {
  background: linear-gradient(90deg, #fc466b 0%, #3f5efb 100%);
}

.mpesa_cash_grad {
  background: linear-gradient(90deg, #3f2b96 0%, #a8c0ff 100%);
}

.debts_grad {
  background: linear-gradient(90deg, #d53369 0%, #daae51 100%);
}

.card_grad {
  background: linear-gradient(90deg, #fdbb2d 0%, #3a1c71 100%);
}

.pending_grad {
  background: linear-gradient(90deg, #d53369 0%, #daae51 100%);
}

.purchases_grad {
  background: linear-gradient(90deg, #efd5ff 0%, #515ada 100%);
}
.card_border {
  border-radius: 8px;
}

.mobile_stats {
  display: none;
}
.small_text {
  font-size: 17px;
}

@media screen and (max-width: 768px) {
  .desktop_stats {
    display: none;
  }

  .mobile_stats {
    display: block;
  }
}
</style>
