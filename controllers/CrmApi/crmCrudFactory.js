const { appPool } = require("../../config/db");
const { buildHierarchyAccess } = require("../../utils/hierarchyAccess");

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const getDatabaseErrorMessage = (error, tableName) => {
  if (error.code === "23502") {
    const column = error.column || "required field";
    return `${column} is required to create ${tableName}`;
  }

  if (error.code === "23503") {
    return `A related record was not found while saving ${tableName}`;
  }

  if (error.code === "23505") {
    return `${tableName} already contains a record with the same value`;
  }

  return `Failed to create ${tableName} record`;
};

const buildSelectColumns = (config) => {
  if (config.selectColumns?.length) {
    return config.selectColumns.join(", ");
  }

  return `${config.alias || "t"}.*`;
};

const pickFieldValues = (fields, payload) => fields.map((field) => payload[field] ?? null);

const fetchRecordById = async ({ client, tableName, alias, joins, selectColumns, idColumn, id }) => {
  const query = `
    SELECT ${selectColumns}
    FROM "${tableName}" ${alias}
    ${joins}
    WHERE ${alias}."${idColumn}" = $1
    LIMIT 1;
  `;

  const { rows } = await client.query(query, [id]);
  return rows[0] || null;
};

const applyAuditFields = ({ payload, req, fields, isCreate }) => {
  const nextPayload = { ...payload };
  const userId = req.user?.userId ?? null;

  if (fields.includes("CreatedBy")) {
    if (isCreate) {
      nextPayload.CreatedBy = userId;
    } else if ("CreatedBy" in nextPayload) {
      delete nextPayload.CreatedBy;
    }
  }

  if (fields.includes("UpdatedBy")) {
    nextPayload.UpdatedBy = userId;
  }

  return nextPayload;
};

const createCrudController = (config) => {
  const tableName = config.tableName;
  const idColumn = config.idColumn || "Id";
  const alias = config.alias || "t";
  const orderBy = config.orderBy || `"${idColumn}" DESC`;
  const fields = config.fields || [];
  const searchColumns = config.searchColumns || [];
  const defaultFilters = config.defaultFilters || [];
  const joins = config.joins || "";
  const selectColumns = buildSelectColumns(config);
  const beforeCreate = config.beforeCreate;
  const accessControl = config.accessControl || null;

  const list = async (req, res) => {
    const limit = toInt(req.query.limit, 25);
    const offset = toInt(req.query.offset, 0);
    const search = req.query.search?.trim();
    const conditions = [...defaultFilters];
    let values = [];

    if (search && searchColumns.length) {
      const searchIndex = values.push(`%${search}%`);
      conditions.push(
        `(${searchColumns.map((column) => `${column} ILIKE $${searchIndex}`).join(" OR ")})`
      );
    }

    if (accessControl?.ownerColumns?.length) {
      const scopedAccess = await buildHierarchyAccess({
        req,
        alias,
        ownerColumns: accessControl.ownerColumns,
        values,
      });
      values = scopedAccess.values;
      if (scopedAccess.clause) {
        conditions.push(scopedAccess.clause);
      }
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const listQuery = `
      SELECT ${selectColumns}
      FROM "${tableName}" ${alias}
      ${joins}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2};
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS "total"
      FROM "${tableName}" ${alias}
      ${joins}
      ${whereClause};
    `;

    try {
      const [listResult, countResult] = await Promise.all([
        appPool.query(listQuery, [...values, limit, offset]),
        appPool.query(countQuery, values),
      ]);

      res.json({
        data: listResult.rows,
        pagination: {
          total: countResult.rows[0]?.total || 0,
          limit,
          offset,
        },
      });
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      res.status(500).json({ message: `Failed to fetch ${tableName}` });
    }
  };

  const getById = async (req, res) => {
    try {
      let values = [req.params.id];
      const conditions = [`${alias}."${idColumn}" = $1`];

      if (defaultFilters.length) {
        conditions.push(...defaultFilters);
      }

      if (accessControl?.ownerColumns?.length) {
        const scopedAccess = await buildHierarchyAccess({
          req,
          alias,
          ownerColumns: accessControl.ownerColumns,
          values,
        });
        values = scopedAccess.values;
        if (scopedAccess.clause) {
          conditions.push(scopedAccess.clause);
        }
      }

      const query = `
        SELECT ${selectColumns}
        FROM "${tableName}" ${alias}
        ${joins}
        WHERE ${conditions.join(" AND ")}
        LIMIT 1;
      `;

      const { rows } = await appPool.query(query, values);

      if (!rows.length) {
        return res.status(404).json({ message: `${tableName} record not found` });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(`Error fetching ${tableName} by id:`, error);
      res.status(500).json({ message: `Failed to fetch ${tableName} record` });
    }
  };

  const create = async (req, res) => {
    const client = await appPool.connect();

    try {
      await client.query("BEGIN");

      const basePayload = applyAuditFields({
        payload: req.body,
        req,
        fields,
        isCreate: true,
      });
      const payload = beforeCreate
        ? await beforeCreate({ payload: basePayload, req, client })
        : basePayload;

      const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");
      const columns = fields.map((field) => `"${field}"`).join(", ");
      const values = pickFieldValues(fields, payload);

      const query = `
        INSERT INTO "${tableName}" (${columns})
        VALUES (${placeholders})
        RETURNING "${idColumn}";
      `;

      const insertResult = await client.query(query, values);
      const createdId = insertResult.rows[0]?.[idColumn];
      const createdRecord = await fetchRecordById({
        client,
        tableName,
        alias,
        joins,
        selectColumns,
        idColumn,
        id: createdId,
      });

      await client.query("COMMIT");
      res.status(201).json(createdRecord);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Error creating ${tableName}:`, error);
      res.status(400).json({ message: getDatabaseErrorMessage(error, tableName) });
    } finally {
      client.release();
    }
  };

  const update = async (req, res) => {
    const payload = applyAuditFields({
      payload: req.body,
      req,
      fields,
      isCreate: false,
    });
    const updateFields = fields.filter((field) => Object.prototype.hasOwnProperty.call(payload, field));

    if (!updateFields.length) {
      return res.status(400).json({ message: `No fields provided to update ${tableName}` });
    }

    try {
      const setClause = updateFields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
      let values = updateFields.map((field) => payload[field] ?? null);
      values.push(req.params.id);
      const conditions = [`"${idColumn}" = $${values.length}`];

      if (accessControl?.ownerColumns?.length) {
        const scopedAccess = await buildHierarchyAccess({
          req,
          alias: tableName,
          ownerColumns: accessControl.ownerColumns,
          values,
        });
        values = scopedAccess.values;
        if (scopedAccess.clause) {
          conditions.push(scopedAccess.clause.replaceAll(`${tableName}.`, ""));
        }
      }

      const query = `
        UPDATE "${tableName}"
        SET ${setClause}
        WHERE ${conditions.join(" AND ")}
        RETURNING *;
      `;

      const { rows } = await appPool.query(query, values);

      if (!rows.length) {
        return res.status(404).json({ message: `${tableName} record not found` });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      res.status(400).json({ message: error.code === "23503"
        ? `A related record was not found while updating ${tableName}`
        : `Failed to update ${tableName} record` });
    }
  };

  const remove = async (req, res) => {
    try {
      let values = [req.params.id];
      const conditions = [`"${idColumn}" = $1`];

      if (accessControl?.ownerColumns?.length) {
        const scopedAccess = await buildHierarchyAccess({
          req,
          alias: tableName,
          ownerColumns: accessControl.ownerColumns,
          values,
        });
        values = scopedAccess.values;
        if (scopedAccess.clause) {
          conditions.push(scopedAccess.clause.replaceAll(`${tableName}.`, ""));
        }
      }

      const query = `DELETE FROM "${tableName}" WHERE ${conditions.join(" AND ")} RETURNING *;`;
      const { rows } = await appPool.query(query, values);

      if (!rows.length) {
        return res.status(404).json({ message: `${tableName} record not found` });
      }

      res.json({ message: `${tableName} record deleted`, record: rows[0] });
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      res.status(500).json({ message: `Failed to delete ${tableName} record` });
    }
  };

  return { list, getById, create, update, remove };
};

module.exports = { createCrudController };
