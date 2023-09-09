<template>
  <div class="row q-col-gutter-sm q-mb-sm">
    <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
      <q-card flat style="border-radius: 8px">
        <div class="text-center q-pa-xs">
          <b style="color: #017951"><q-icon name="grain" /> Today</b>
        </div>
        <q-separator color="primary" />
        <div class="desktop_stats q-pa-sm">
          <div class="q-pa-xs">
            <q-card dark class="shadow-2 total_grad card_border">
              <q-card-section class="text-center">
                Total Sales
                <q-btn size="xs" flat label="view more" to="/sales" />
                <hr />
                <h6 class="q-ma-sm small_text">
                  {{ account_store?.total_daily_sales }}
                </h6>
              </q-card-section>
            </q-card>
          </div>
          <div class="q-pa-xs">
            <q-card dark class="shadow-2 expense_grad card_border">
              <q-card-section class="text-center">
                Total Expense
                <q-btn size="xs" flat label="view more" to="/inventories" />
                <hr />
                <h6 class="q-ma-sm small_text">
                  {{ account_store?.total_daily_expense }}
                </h6>
              </q-card-section>
            </q-card>
          </div>
          <div class="q-pa-xs">
            <q-card
              dark
              :class="`${
                convertToNumber(account_store?.total_daily_sales) -
                  convertToNumber(account_store?.total_daily_expense) >
                0
                  ? 'shadow-2 bg-blue card_border'
                  : 'shadow-2 bg-red card_border'
              }`"
            >
              <q-card-section class="text-center">
                <span
                  v-if="
                    convertToNumber(account_store?.total_daily_sales) -
                      convertToNumber(account_store?.total_daily_expense) >
                    0
                  "
                >
                  Profit
                </span>
                <span v-else>Loss</span>
                <hr />
                <h6 class="q-ma-sm small_text">
                  {{
                    (
                      convertToNumber(account_store?.total_daily_sales) -
                      convertToNumber(account_store?.total_daily_expense)
                    ).toLocaleString()
                  }}
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

            <q-item dark class="q-my-sm expense_grad card_border">
              <q-item-section avatar>
                <q-icon name="blur_on" />
              </q-item-section>
              <q-item-section>Expense</q-item-section>
              <q-item-section side>
                <b>{{ account_store?.total_daily_expense }}</b>
              </q-item-section>
            </q-item>

            <q-item
              dark
              :class="`${
                convertToNumber(account_store?.total_daily_sales) -
                  convertToNumber(account_store?.total_daily_expense) >
                0
                  ? 'bg-blue card_border'
                  : 'bg-red card_border'
              }`"
            >
              <q-item-section avatar>
                <q-icon name="blur_on" />
              </q-item-section>
              <q-item-section
                ><span
                  v-if="
                    convertToNumber(account_store?.total_daily_sales) -
                      convertToNumber(account_store?.total_daily_expense) >
                    0
                  "
                >
                  Profit
                </span>
                <span v-else>Loss</span></q-item-section
              >
              <q-item-section side>
                <b>{{
                  (
                    convertToNumber(account_store?.total_daily_sales) -
                    convertToNumber(account_store?.total_daily_expense)
                  ).toLocaleString()
                }}</b>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card>
    </div>
    <div class="col-lg-9 col-md-9 col-sm-12 col-xs-12 desktop_stats">
      <q-card style="border-radius: 8px">
        <div class="text-center q-pa-sm">
          <b style="color: #017951"><q-icon name="grain" /> Last Seven Days</b>
        </div>
        <q-separator color="primary" />
        <Line />
      </q-card>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["account_store"]);
import Line from "components/charts/echarts/Line.vue";

const convertToNumber = (num) => {
  if (num) return Number(num.split(",").join(""));
};
</script>

<style scoped>
.total_grad {
  background: linear-gradient(90deg, #1cb5e0 0%, #000851 100%);
}

.expense_grad {
  background: linear-gradient(90deg, #d53369 0%, #daae51 100%);
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
