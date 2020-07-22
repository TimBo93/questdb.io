let guidelines

if (process.env.NODE_ENV === "development") {
  guidelines = {
    label: "Guidelines (DEV ONLY)",
    type: "category",
    items: [
      {
        type: "category",
        label: "Templates",
        items: [
          "__guidelines/template/guide",
          "__guidelines/template/function",
          "__guidelines/template/sql",
        ],
      },
      "__guidelines/naming-convention",
      "__guidelines/content-hierarchy",
      "__guidelines/lexicon",
      "__guidelines/markdown",
      "__guidelines/sql-code-blocks",
      "__guidelines/influences",
    ],
  }
}

module.exports = {
  docs: [
    guidelines,
    {
      id: "introduction",
      type: "doc",
    },
    {
      label: "Guides",
      type: "category",
      items: [
        {
          type: "category",
          label: "Setting up QuestDB",
          items: ["guide/docker", "guide/homebrew", "guide/binaries"],
        },
        {
          type: "category",
          label: "Using QuestDB",
          items: [
            "guide/web-console",
            "guide/postgres-wire",
            "guide/rest",
            "guide/crud",
            "guide/my-first-database",
          ],
        },
      ],
    },
    {
      label: "Concepts",
      type: "category",
      items: [
        "concept/storage-model",
        "concept/designated-timestamp",
        "concept/sql-extensions",
        "concept/partitions",
        "concept/symbol",
        "concept/indexes",
        "concept/sql-execution-order",
      ],
    },
    {
      label: "Packages",
      type: "category",
      items: ["packages/docker", "packages/homebrew", "packages/binaries"],
    },
    {
      label: "API",
      type: "category",
      items: ["api/influxdb-line-protocol", "api/java", "api/rest"],
    },
    {
      label: "Reference",
      type: "category",
      items: [
        {
          type: "category",
          label: "Configuration",
          items: [
            "reference/root-directory-structure",
            "reference/server-configuration",
            "reference/web-console",
          ],
        },
        {
          type: "category",
          label: "Functions",
          items: [
            "reference/function/aggregation",
            "reference/function/date-time",
            "reference/function/meta",
            "reference/function/numeric",
            "reference/function/random-value-generator",
            "reference/function/row-generator",
            "reference/function/text",
            "reference/function/timestamp-generator",
          ],
        },
        {
          type: "category",
          label: "SQL",
          items: [
            "concept/sql-execution-order",
            "reference/sql/datatypes",
            "reference/sql/alter-table-add-column",
            "reference/sql/alter-table-alter-column-add-index",
            "reference/sql/alter-table-drop-column",
            "reference/sql/alter-table-drop-partition",
            "reference/sql/backup",
            "reference/sql/case",
            "reference/sql/cast",
            "reference/sql/copy",
            "reference/sql/create-table",
            "reference/sql/distinct",
            "reference/sql/fill",
            "reference/sql/drop",
            "reference/sql/insert",
            "reference/sql/join",
            "reference/sql/latest-by",
            "reference/sql/limit",
            "reference/sql/order-by",
            "reference/sql/rename",
            "reference/sql/sample-by",
            "reference/sql/select",
            "reference/sql/show",
            "reference/sql/timestamp",
            "reference/sql/truncate",
            "reference/sql/union",
            "reference/sql/where",
          ],
        },
      ],
    },
  ].filter(Boolean),
}