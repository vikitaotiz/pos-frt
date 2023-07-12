<template>
  <div class="q-pa-sm">
    <div class="row q-col-gutter-sm q-ml-xs q-mr-sm q-py-sm">
      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/roles">
          <q-card class="module_link">
            <q-card-section class="text-center"> Roles </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/departments">
          <q-card class="module_link">
            <q-card-section class="text-center"> Departments </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/sales">
          <q-card class="module_link">
            <q-card-section class="text-center"> Sales </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/inventories">
          <q-card class="module_link">
            <q-card-section class="text-center"> Inventories </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/users">
          <q-card class="module_link">
            <q-card-section class="text-center"> Users </q-card-section>
          </q-card>
        </router-link>
      </div>

      <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
        <router-link to="/payment_modes">
          <q-card class="module_link">
            <q-card-section class="text-center"> Payment Mode </q-card-section>
          </q-card>
        </router-link>
      </div>
    </div>
  </div>
</template>
