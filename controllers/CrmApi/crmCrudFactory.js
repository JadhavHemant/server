const { appPool } = require("../../config/db");

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const buildSelectColumns = (config) => {
  if (config.selectColumns?.length) {
    return config.selectColumns.join(", ");
  }

  return `${config.alias || "t"}.*`;
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

  const list = async (req, res) => {
    const limit = toInt(req.query.limit, 25);
    const offset = toInt(req.query.offset, 0);
    const search = req.query.search?.trim();
    const conditions = [...defaultFilters];
    const values = [];

    if (search && searchColumns.length) {
      const searchIndex = values.push(`%${search}%`);
      conditions.push(
        `(${searchColumns.map((column) => `${column} ILIKE $${searchIndex}`).join(" OR ")})`
      );
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
    const query = `
      SELECT ${selectColumns}
      FROM "${tableName}" ${alias}
      ${joins}
      WHERE ${alias}."${idColumn}" = $1
      LIMIT 1;
    `;

    try {
      const { rows } = await appPool.query(query, [req.params.id]);

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
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");
    const columns = fields.map((field) => `"${field}"`).join(", ");
    const values = fields.map((field) => req.body[field] ?? null);

    const query = `
      INSERT INTO "${tableName}" (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;

    try {
      const { rows } = await appPool.query(query, values);
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      res.status(500).json({ message: `Failed to create ${tableName} record` });
    }
  };

  const update = async (req, res) => {
    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
    const values = fields.map((field) => req.body[field] ?? null);
    values.push(req.params.id);

    const query = `
      UPDATE "${tableName}"
      SET ${setClause}
      WHERE "${idColumn}" = $${values.length}
      RETURNING *;
    `;

    try {
      const { rows } = await appPool.query(query, values);

      if (!rows.length) {
        return res.status(404).json({ message: `${tableName} record not found` });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      res.status(500).json({ message: `Failed to update ${tableName} record` });
    }
  };

  const remove = async (req, res) => {
    const query = `DELETE FROM "${tableName}" WHERE "${idColumn}" = $1 RETURNING *;`;

    try {
      const { rows } = await appPool.query(query, [req.params.id]);

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
