const { createCrudController } = require("./crmCrudFactory");

const taskTypeController = createCrudController({
  tableName: "TaskTypes",
  fields: ["Name", "DefaultDurationMinutes"],
  searchColumns: ['t."Name"'],
  orderBy: 't."CreatedAt" DESC',
});

const salesStageController = createCrudController({
  tableName: "SalesStages",
  fields: ["Name"],
  searchColumns: ['t."Name"'],
});

const industryController = createCrudController({
  tableName: "Industries",
  fields: ["Name"],
  searchColumns: ['t."Name"'],
});

const followupTypeController = createCrudController({
  tableName: "FollowupTypes",
  fields: ["Name"],
  searchColumns: ['t."Name"'],
});

const leadSourceController = createCrudController({
  tableName: "LeadSources",
  fields: ["Name"],
  searchColumns: ['t."Name"'],
});

module.exports = {
  taskTypeController,
  salesStageController,
  industryController,
  followupTypeController,
  leadSourceController,
};
