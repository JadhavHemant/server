const { appPool } = require("../config/db");

const PRIVILEGED_ROLE_IDS = new Set([1, 2]);

const isPrivilegedUser = (user) => PRIVILEGED_ROLE_IDS.has(Number(user?.roleId));

const getAccessibleUserIds = async ({ userId, companyId = null }) => {
  const params = companyId ? [userId, companyId] : [userId];
  const companyFilter = companyId ? 'AND child."CompanyId" = $2' : "";

  const query = `
    WITH RECURSIVE "UserHierarchy" AS (
      SELECT u."UserId"
      FROM "Users" u
      WHERE u."UserId" = $1
      AND u."IsDelete" = FALSE

      UNION ALL

      SELECT child."UserId"
      FROM "Users" child
      INNER JOIN "UserHierarchy" uh ON child."ReportingManagerId" = uh."UserId"
      WHERE child."IsDelete" = FALSE
      ${companyFilter}
    )
    SELECT DISTINCT "UserId" FROM "UserHierarchy";
  `;

  const { rows } = await appPool.query(query, params);
  return rows.map((row) => Number(row.UserId)).filter(Boolean);
};

const buildHierarchyAccess = async ({ req, alias, ownerColumns = [], values = [] }) => {
  if (isPrivilegedUser(req.user) || !ownerColumns.length) {
    return { clause: "", values };
  }

  const accessibleUserIds = await getAccessibleUserIds({
    userId: req.user.userId,
    companyId: req.user.companyId ?? null,
  });

  if (!accessibleUserIds.length) {
    const nextIndex = values.length + 1;
    return { clause: `FALSE OR ${alias}."Id" = $${nextIndex}`, values: [...values, -1] };
  }

  const nextIndex = values.length + 1;
  const ownerClause = ownerColumns
    .map((column) => `${alias}."${column}" = ANY($${nextIndex}::int[])`)
    .join(" OR ");

  return {
    clause: `(${ownerClause})`,
    values: [...values, accessibleUserIds],
  };
};

module.exports = {
  isPrivilegedUser,
  getAccessibleUserIds,
  buildHierarchyAccess,
};
