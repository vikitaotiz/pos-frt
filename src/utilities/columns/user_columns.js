const user_columns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "left",
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "email",
    align: "center",
    label: "Email",
    field: "email",
    sortable: true,
  },
  {
    name: "roles",
    align: "center",
    label: "Roles",
    field: "roles",
    sortable: true,
  },
  {
    name: "departments",
    align: "center",
    label: "Departments",
    field: "departments",
    sortable: true,
  },
  {
    name: "active",
    align: "center",
    label: "Status",
    field: "active",
    sortable: true,
  },
  {
    name: "created_at",
    align: "center",
    label: "Created On",
    field: "created_at",
    sortable: true,
  },
  {
    name: "actions",
    align: "center",
    label: "Actions",
    field: "created_at",
  },
];

export { user_columns };
