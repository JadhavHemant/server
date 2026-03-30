const { createCrudRouter } = require("./createCrudRouter");
const {
  accountController,
  contactController,
  leadController,
  opportunityController,
  presalesController,
  caseController,
} = require("../../controllers/CrmApi/entityControllers");

module.exports = {
  accountRoutes: createCrudRouter(accountController),
  contactRoutes: createCrudRouter(contactController),
  leadRoutes: createCrudRouter(leadController),
  opportunityRoutes: createCrudRouter(opportunityController),
  presalesRoutes: createCrudRouter(presalesController),
  caseRoutes: createCrudRouter(caseController),
};
