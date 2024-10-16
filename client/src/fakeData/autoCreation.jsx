export const autoCreation = [
  {
    id: 1,
    type: "create",
    level: "program",
    title: "Journey - Company Name - Benefits Guide",
    detailType: false,
    children: [
      {
        id: 2,
        type: "create",
        level: "project",
        title: "Company Name - BG - BEN007 Benefits Reminders",
        detailType: "obj",
        details: {
          sku: "BEN007",
          element: "Digital Doc",
          production_tool: "Asset Creation",
        },
        children: [
          {
            id: 3,
            type: "create",
            level: "tasks",
            title: "",
            detailType: "arr",
            details: [
              "Asset Creation",
              [
                "Draft 1",
                [
                  "Writing Phase #1",
                  "Asset Phase #1",
                  "Design Phase #1",
                  "Customer Review",
                ],
                "Draft 2",
                [
                  "Writing Phase #2",
                  "Asset Phase #2",
                  "Design Phase #2",
                  "Customer Approval",
                ],
              ],
            ],
          },
        ],
      },
    ],
  },
];
