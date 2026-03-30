const { appPool } = require("../../config/db");

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getSuperAdminDashboard = async (req, res) => {
  try {
    const { companyId } = req.query;
    const params = [];
    const leadsFilter = companyId ? `AND "CompanyId" = $1` : "";
    const oppFilter = companyId ? `AND "CompanyId" = $1` : "";
    const salesFilter = companyId ? `AND "CompanyId" = $1` : "";
    const apiFilter = companyId ? `AND ai."CompanyId" = $1` : "";

    if (companyId) params.push(Number(companyId));

    const summaryQuery = `
      SELECT
        (SELECT COUNT(*)::int FROM "Companies" WHERE "IsDelete" = FALSE) AS "TotalCompanies",
        (SELECT COUNT(*)::int FROM "Users" WHERE "IsDelete" = FALSE) AS "TotalUsers",
        (SELECT COUNT(*)::int FROM "Users" WHERE "IsDelete" = FALSE AND "IsActive" = TRUE) AS "ActiveUsers",
        (SELECT COUNT(*)::int FROM "Leads" WHERE "IsDeleted" = FALSE ${leadsFilter}) AS "ActiveLeads",
        (SELECT COUNT(*)::int FROM "Opportunities" WHERE "IsDeleted" = FALSE ${oppFilter}) AS "ActiveOpportunities",
        (
          SELECT COALESCE(SUM("NetAmount"), 0)::numeric(18,2)
          FROM "SalesOrders"
          WHERE "IsDeleted" = FALSE
          ${salesFilter}
        ) AS "TotalRevenue",
        (
          SELECT COUNT(*)::int
          FROM "ApiExecutionLogs" l
          LEFT JOIN "ApiIntegrations" ai ON ai."Id" = l."IntegrationId"
          WHERE l."IsSuccess" = FALSE
          AND l."CreatedAt" >= NOW() - INTERVAL '7 days'
          ${apiFilter}
        ) AS "ApiFailuresLast7Days",
        (
          SELECT COUNT(*)::int
          FROM "ApiExecutionLogs" l
          LEFT JOIN "ApiIntegrations" ai ON ai."Id" = l."IntegrationId"
          WHERE l."CreatedAt" >= NOW() - INTERVAL '7 days'
          ${apiFilter}
        ) AS "ApiCallsLast7Days";
    `;

    const apiHealthQuery = `
      SELECT
        DATE(l."CreatedAt") AS "Date",
        COUNT(*)::int AS "TotalCalls",
        COUNT(*) FILTER (WHERE l."IsSuccess" = TRUE)::int AS "SuccessCalls",
        COUNT(*) FILTER (WHERE l."IsSuccess" = FALSE)::int AS "FailedCalls"
      FROM "ApiExecutionLogs" l
      LEFT JOIN "ApiIntegrations" ai ON ai."Id" = l."IntegrationId"
      WHERE l."CreatedAt" >= NOW() - INTERVAL '14 days'
      ${apiFilter}
      GROUP BY DATE(l."CreatedAt")
      ORDER BY DATE(l."CreatedAt");
    `;

    const recentAlertsQuery = `
      SELECT
        a."Id",
        a."AlertType",
        a."AlertStatus",
        a."AlertChannel",
        a."CreatedAt",
        l."ErrorMessage",
        l."ResponseStatusCode",
        ai."IntegrationName",
        ae."EndpointName"
      FROM "ApiFailureAlerts" a
      LEFT JOIN "ApiExecutionLogs" l ON l."Id" = a."ApiExecutionLogId"
      LEFT JOIN "ApiIntegrations" ai ON ai."Id" = l."IntegrationId"
      LEFT JOIN "ApiEndpoints" ae ON ae."Id" = l."EndpointId"
      WHERE 1=1
      ${apiFilter}
      ORDER BY a."CreatedAt" DESC
      LIMIT 10;
    `;

    const [summaryResult, apiHealthResult, alertsResult] = await Promise.all([
      appPool.query(summaryQuery, params),
      appPool.query(apiHealthQuery, params),
      appPool.query(recentAlertsQuery, params),
    ]);

    res.json({
      summary: summaryResult.rows[0] || {},
      apiHealth: apiHealthResult.rows || [],
      recentAlerts: alertsResult.rows || [],
    });
  } catch (error) {
    console.error("Error loading super admin dashboard:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

const getEmployeeActivity = async (req, res) => {
  try {
    const { companyId } = req.query;
    const startDate = parseDate(req.query.startDate);
    const endDate = parseDate(req.query.endDate);

    const params = [];
    const userFilters = ['u."IsDelete" = FALSE'];

    if (companyId) {
      params.push(companyId);
      userFilters.push(`u."CompanyId" = $${params.length}`);
    }

    const buildDateFilter = (alias, field) => {
      const filters = [];

      if (startDate) {
        params.push(startDate);
        filters.push(`${alias}."${field}" >= $${params.length}`);
      }
      if (endDate) {
        params.push(endDate);
        filters.push(`${alias}."${field}" <= $${params.length}`);
      }

      return filters.length ? ` AND ${filters.join(" AND ")}` : "";
    };

    const leadsDateFilter = buildDateFilter("l", "CreatedAt");
    const oppDateFilter = buildDateFilter("o", "CreatedAt");
    const salesDateFilter = buildDateFilter("s", "CreatedAt");

    const query = `
      WITH lead_agg AS (
        SELECT
          l."CreatedBy" AS "UserId",
          COUNT(*)::int AS "LeadsCreated"
        FROM "Leads" l
        WHERE l."IsDeleted" = FALSE
        ${leadsDateFilter}
        GROUP BY l."CreatedBy"
      ),
      opp_agg AS (
        SELECT
          o."CreatedBy" AS "UserId",
          COUNT(*)::int AS "OpportunitiesCreated"
        FROM "Opportunities" o
        WHERE o."IsDeleted" = FALSE
        ${oppDateFilter}
        GROUP BY o."CreatedBy"
      ),
      sales_agg AS (
        SELECT
          s."CreatedBy" AS "UserId",
          COUNT(*)::int AS "SalesOrdersCreated",
          COALESCE(SUM(s."NetAmount"), 0)::numeric(18,2) AS "RevenueGenerated"
        FROM "SalesOrders" s
        WHERE s."IsDeleted" = FALSE
        ${salesDateFilter}
        GROUP BY s."CreatedBy"
      )
      SELECT
        u."UserId",
        u."Name",
        u."Email",
        u."CompanyId",
        COALESCE(l."LeadsCreated", 0) AS "LeadsCreated",
        COALESCE(o."OpportunitiesCreated", 0) AS "OpportunitiesCreated",
        COALESCE(s."SalesOrdersCreated", 0) AS "SalesOrdersCreated",
        COALESCE(s."RevenueGenerated", 0)::numeric(18,2) AS "RevenueGenerated"
      FROM "Users" u
      LEFT JOIN lead_agg l ON l."UserId" = u."UserId"
      LEFT JOIN opp_agg o ON o."UserId" = u."UserId"
      LEFT JOIN sales_agg s ON s."UserId" = u."UserId"
      WHERE ${userFilters.join(" AND ")}
      ORDER BY "RevenueGenerated" DESC, "LeadsCreated" DESC, u."Name" ASC;
    `;

    const { rows } = await appPool.query(query, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("Error loading employee activity report:", error);
    res.status(500).json({ message: "Failed to load employee activity report" });
  }
};

const getRecentNotifications = async (req, res) => {
  try {
    const { limit = 20, companyId } = req.query;
    const params = [Number(limit)];
    const companyFilter = companyId ? `WHERE n."CompanyId" = $2` : "";
    if (companyId) params.push(Number(companyId));

    const query = `
      SELECT
        n."Id",
        n."Title",
        n."Message",
        n."Type",
        n."Severity",
        n."IsRead",
        n."CreatedAt",
        u."Name" AS "UserName"
      FROM "Notifications" n
      LEFT JOIN "Users" u ON u."UserId" = n."UserId"
      ${companyFilter}
      ORDER BY n."CreatedAt" DESC
      LIMIT $1;
    `;

    const { rows } = await appPool.query(query, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("Error loading notifications:", error);
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

module.exports = {
  getSuperAdminDashboard,
  getEmployeeActivity,
  getRecentNotifications,
};
