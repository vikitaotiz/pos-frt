import { storedUser } from "src/utilities/stored_user";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        name: "auth",
      },
      {
        path: "/dashboard",
        component: () => import("pages/Dashboard.vue"),
        name: "dashboard",
      },
      {
        path: "/users",
        component: () => import("pages/Users.vue"),
        name: "users",
      },
      {
        path: "/roles",
        component: () => import("pages/Roles.vue"),
        name: "roles",
      },
      {
        path: "/departments",
        component: () => import("pages/Departments.vue"),
        name: "departments",
      },
      {
        path: "/categories",
        component: () => import("pages/Categories.vue"),
        name: "categories",
      },
      {
        path: "/products",
        component: () => import("pages/Products.vue"),
        name: "products",
      },
      {
        path: "/operations",
        component: () => import("pages/Operations.vue"),
        name: "operations",
      },
      {
        path: "/sales",
        component: () => import("pages/Sales.vue"),
        name: "sales",
      },
      {
        path: "/inventories",
        component: () => import("pages/Inventories.vue"),
        name: "inventories",
      },
      {
        path: "/users",
        component: () => import("pages/Users.vue"),
        name: "users",
      },
      {
        path: "/bills",
        component: () => import("pages/Bills.vue"),
        name: "bills",
      },
      {
        path: "/payment_modes",
        component: () => import("pages/PaymentModes.vue"),
        name: "payment_modes",
      },

      {
        path: "/accounts",
        component: () => import("pages/Accounts.vue"),
        name: "accounts",
      },
      {
        path: "/logout_page",
        component: () => import("pages/LogoutPage.vue"),
        name: "logout_page",
      },
      {
        path: "/settings",
        component: () => import("pages/Settings.vue"),
        name: "settings",
        beforeEnter: (to, from) => {
          const stored_user = storedUser();

          const isAdmin = stored_user?.user?.roles.some(
            (role) => role["name"] === "Admin"
          );

          if (isAdmin) return true;
          else return false;
        },
      },

      {
        path: "/trash",
        component: () => import("pages/SystemTrash.vue"),
        name: "trash",
      },

      {
        path: "/clear_bills",
        component: () => import("pages/ClearBills.vue"),
        name: "clear_bills",
      },

      {
        path: "/measurements",
        component: () => import("pages/Measurements.vue"),
        name: "measurements",
      },

      {
        path: "/debtors",
        component: () => import("pages/Debtors.vue"),
        name: "debtors",
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },

  {
    path: "/verify_bill",
    component: () => import("pages/VerifyBill.vue"),
    name: "verify_bill",
  },
];

export default routes;
