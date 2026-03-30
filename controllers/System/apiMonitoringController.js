const { appPool } = require("../../config/db");

const FAILURE_THRESHOLD = 5;

const getSuperAdminUsers = async () => {
  const query = `
    SELECT DISTINCT u."UserId", u."CompanyId"
    FROM "Users" u
    LEFT JOIN "Roles" r ON r."Id" = u."RoleId"
    WHERE u."IsDelete" = FALSE
      AND (
        u."UserTypeId" = 1
        OR LOWER(COALESCE(r."RoleName", '')) LIKE '%super admin%'
        OR LOWER(COALESCE(r."RoleName", '')) LIKE '%superadmin%'
      );
  `;
  const { rows } = await appPool.query(query);
  return rows;
};

const createEscalationNotifications = async ({
  integrationId,
  endpointId,
  failureCount,
  companyId,
  message,
}) => {
  const users = await getSuperAdminUsers();
  if (!users.length) return;

  const integrationQuery = `
    SELECT
      ai."IntegrationName",
      ae."EndpointName"
    FROM "ApiIntegrations" ai
    LEFT JOIN "ApiEndpoints" ae ON ae."Id" = $2
    WHERE ai."Id" = $1
    LIMIT 1;
  `;
  const integrationData = await appPool.query(integrationQuery, [
    integrationId || null,
    endpointId || null,
  ]);

  const integrationName = integrationData.rows[0]?.IntegrationName || "Unknown Integration";
  const endpointName = integrationData.rows[0]?.EndpointName || "Unknown Endpoint";

  const title = `API Failure Escalation (${failureCount})`;
  const finalMessage = `${integrationName} / ${endpointName} failed ${failureCount} times. ${message || ""}`.trim();

  const insertNotification = `
    INSERT INTO "Notifications"
    ("CompanyId", "UserId", "Title", "Message", "Type", "Severity", "EntityType", "EntityId")
    VALUES ($1, $2, $3, $4, 'API_FAILURE_ESCALATION', 'critical', 'ApiEndpoint', $5);
  `;

  for (const user of users) {
    await appPool.query(insertNotification, [
      companyId || user.CompanyId || null,
      user.UserId,
      title,
      finalMessage,
      endpointId || null,
    ]);
  }
};

const recordApiExecution = async (req, res) => {
  const {
    IntegrationId,
    EndpointId,
    RequestId,
    RequestPayload,
    ResponsePayload,
    ResponseStatusCode,
    IsSuccess,
    ErrorMessage,
    DurationMs,
    TriggerType,
    CompanyId,
  } = req.body;

  try {
    const insertQuery = `
      INSERT INTO "ApiExecutionLogs"
      ("IntegrationId", "EndpointId", "RequestId", "RequestPayload", "ResponsePayload",
       "ResponseStatusCode", "IsSuccess", "ErrorMessage", "DurationMs", "TriggeredByUserId", "TriggerType")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;

    const { rows } = await appPool.query(insertQuery, [
      IntegrationId || null,
      EndpointId || null,
      RequestId || null,
      RequestPayload || null,
      ResponsePayload || null,
      ResponseStatusCode || null,
      Boolean(IsSuccess),
      ErrorMessage || null,
      DurationMs || null,
      req.user?.userId || null,
      TriggerType || "Manual",
    ]);

    const logRow = rows[0];

    if (!Boolean(IsSuccess)) {
      const alertInsert = `
        INSERT INTO "ApiFailureAlerts"
        ("ApiExecutionLogId", "AlertType", "AlertSentToUserId", "AlertChannel", "AlertStatus")
        VALUES ($1, 'API_FAILURE', $2, 'InApp', 'Pending')
        RETURNING *;
      `;
      await appPool.query(alertInsert, [logRow.Id, req.user?.userId || null]);

      const failureCountQuery = `
        SELECT COUNT(*)::int AS "FailureCount"
        FROM "ApiExecutionLogs"
        WHERE "IsSuccess" = FALSE
          AND "CreatedAt" >= NOW() - INTERVAL '24 hours'
          AND COALESCE("IntegrationId", 0) = COALESCE($1, 0)
          AND COALESCE("EndpointId", 0) = COALESCE($2, 0);
      `;
      const failureCountResult = await appPool.query(failureCountQuery, [
        IntegrationId || null,
        EndpointId || null,
      ]);
      const failureCount = failureCountResult.rows[0]?.FailureCount || 0;

      if (failureCount >= FAILURE_THRESHOLD && failureCount % FAILURE_THRESHOLD === 0) {
        await createEscalationNotifications({
          integrationId: IntegrationId || null,
          endpointId: EndpointId || null,
          failureCount,
          companyId: CompanyId || null,
          message: ErrorMessage || "Check integration health immediately.",
        });
      }
    }

    res.status(201).json({
      message: "API execution logged successfully",
      data: logRow,
    });
  } catch (error) {
    console.error("Error recording API execution:", error);
    res.status(500).json({ message: "Failed to log API execution" });
  }
};

module.exports = { recordApiExecution };
