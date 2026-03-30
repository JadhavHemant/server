const bcrypt = require("bcryptjs");
const { appPool } = require("../../config/db");
const { generateTokens } = require("../../utils/tokenUtils");
const fs = require("fs");
const { sendEmail } = require("../../utils/email");
const crypto = require("crypto");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const getHierarchyRows = async (rootUserId, includeRoot = true, companyId = null) => {
  const rootPredicate = includeRoot
    ? 'u."UserId" = $1'
    : 'u."ReportingManagerId" = $1';

  const companyBaseFilter = companyId ? 'AND u."CompanyId" = $2' : "";
  const companyChildFilter = companyId ? 'AND child."CompanyId" = $2' : "";
  const params = companyId ? [rootUserId, companyId] : [rootUserId];

  const query = `
    WITH RECURSIVE "UserHierarchy" AS (
      SELECT
        u."UserId",
        u."Name",
        u."Email",
        u."RoleId",
        u."UserTypeId",
        u."CompanyId",
        u."ReportingManagerId",
        0 AS "Level"
      FROM "Users" u
      WHERE ${rootPredicate}
      ${companyBaseFilter}
      AND u."IsDelete" = FALSE

      UNION ALL

      SELECT
        child."UserId",
        child."Name",
        child."Email",
        child."RoleId",
        child."UserTypeId",
        child."CompanyId",
        child."ReportingManagerId",
        uh."Level" + 1 AS "Level"
      FROM "Users" child
      INNER JOIN "UserHierarchy" uh
        ON child."ReportingManagerId" = uh."UserId"
      WHERE child."IsDelete" = FALSE
      ${companyChildFilter}
    )
    SELECT * FROM "UserHierarchy"
    ORDER BY "Level", "ReportingManagerId", "UserId";
  `;

  const { rows } = await appPool.query(query, params);
  return rows;
};

const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    mobileNumber,
    companyId,
    userTypeId,
    createdBy,
    reportingManagerId,
    departmentId,
    designationId,
    hierarchyLevel,
    address,
    city,
    state,
    country,
    postalCode,
  } = req.body;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long",
    });
  }

  try {
    const existing = await appPool.query('SELECT 1 FROM "Users" WHERE "Email" = $1', [
      email,
    ]);

    if (existing.rows.length) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const result = await appPool.query(
      `
      INSERT INTO "Users"
      (
        "Name","Email","Password","MobileNumber","CompanyId","UserTypeId",
        "CreatedBy","ReportingManagerId","DepartmentId","DesignationId","HierarchyLevel",
        "Address","City","State","Country","PostalCode","userImage"
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *;
      `,
      [
        name,
        email,
        hashedPassword,
        mobileNumber || null,
        companyId || null,
        userTypeId || null,
        createdBy || null,
        reportingManagerId || null,
        departmentId || null,
        designationId || null,
        hierarchyLevel || 0,
        address || null,
        city || null,
        state || null,
        country || null,
        postalCode || null,
        userImage,
      ]
    );

    const user = result.rows[0];
    await sendEmail(
      user.Email,
      "Welcome to Our Service!",
      `Hello ${user.Name},\n\nThank you for registering with us. Your account has been created successfully.`
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.UserId,
        name: user.Name,
        email: user.Email,
        image: user.userImage,
        reportingManagerId: user.ReportingManagerId,
      },
    });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const {
    userId,
    name,
    email,
    password,
    mobileNumber,
    companyId,
    userTypeId,
    reportingManagerId,
    departmentId,
    designationId,
    hierarchyLevel,
    address,
    city,
    state,
    country,
    postalCode,
  } = req.body;

  if (password && !passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long",
    });
  }

  try {
    const existingUserResult = await appPool.query(
      'SELECT * FROM "Users" WHERE "UserId" = $1',
      [userId]
    );

    if (!existingUserResult.rows.length) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    const existingUser = existingUserResult.rows[0];
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : existingUser.Password;

    let updatedImage = existingUser.userImage;
    if (req.file) {
      updatedImage = req.file.path.replace(/\\/g, "/");
      if (existingUser.userImage && fs.existsSync(existingUser.userImage)) {
        fs.unlinkSync(existingUser.userImage);
      }
    }

    const updateQuery = `
      UPDATE "Users" SET
        "Name" = $1,
        "Email" = $2,
        "Password" = $3,
        "MobileNumber" = $4,
        "CompanyId" = $5,
        "UserTypeId" = $6,
        "Address" = $7,
        "City" = $8,
        "State" = $9,
        "Country" = $10,
        "PostalCode" = $11,
        "userImage" = $12,
        "ReportingManagerId" = $13,
        "DepartmentId" = $14,
        "DesignationId" = $15,
        "HierarchyLevel" = $16
      WHERE "UserId" = $17
      RETURNING *;
    `;

    const values = [
      name ?? existingUser.Name,
      email ?? existingUser.Email,
      hashedPassword,
      mobileNumber ?? existingUser.MobileNumber,
      companyId ?? existingUser.CompanyId,
      userTypeId ?? existingUser.UserTypeId,
      address ?? existingUser.Address,
      city ?? existingUser.City,
      state ?? existingUser.State,
      country ?? existingUser.Country,
      postalCode ?? existingUser.PostalCode,
      updatedImage,
      reportingManagerId ?? existingUser.ReportingManagerId,
      departmentId ?? existingUser.DepartmentId,
      designationId ?? existingUser.DesignationId,
      hierarchyLevel ?? existingUser.HierarchyLevel ?? 0,
      userId,
    ];

    const result = await appPool.query(updateQuery, values);
    const user = result.rows[0];

    await sendEmail(
      user.Email,
      "Your Account Information Has Been Updated",
      `Hello ${user.Name},\n\nYour account information has been successfully updated. If you did not make this change, please contact support immediately.`
    );

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.UserId,
        name: user.Name,
        email: user.Email,
        image: user.userImage,
        reportingManagerId: user.ReportingManagerId,
      },
    });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await appPool.query('SELECT * FROM "Users" WHERE "Email" = $1', [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.Password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokens = await generateTokens(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.UserId,
        name: user.Name,
        email: user.Email,
        image: user.userImage,
        reportingManagerId: user.ReportingManagerId,
      },
      ...tokens,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = `
      SELECT
        u."UserId" AS id,
        u."Name" AS name,
        u."Email" AS email,
        u."MobileNumber" AS "mobileNumber",
        u."userImage" AS image,
        u."Address" AS address,
        u."City" AS city,
        u."State" AS state,
        u."Country" AS country,
        u."PostalCode" AS "postalCode",
        u."CompanyId" AS "companyId",
        u."UserTypeId" AS "userTypeId",
        u."RoleId" AS "roleId",
        u."ReportingManagerId" AS "reportingManagerId",
        u."DepartmentId" AS "departmentId",
        u."DesignationId" AS "designationId",
        u."HierarchyLevel" AS "hierarchyLevel",
        m."Name" AS "reportingManagerName",
        u."IsActive" AS "isActive",
        u."Flag" AS flag,
        u."IsDelete" AS "isDelete",
        u."CreatedAt" AS "createdAt",
        u."UpdatedAt" AS "updatedAt"
      FROM "Users" u
      LEFT JOIN "Users" m ON m."UserId" = u."ReportingManagerId"
      WHERE u."UserId" = $1
      AND u."IsDelete" = FALSE
      LIMIT 1;
    `;

    const result = await appPool.query(query, [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, profile: user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page || "1", 10);
    const limit = Number.parseInt(req.query.limit || "10", 10);
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const values = [];
    let whereClause = 'WHERE u."IsDelete" = FALSE';

    if (search) {
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
      whereClause +=
        ` AND (u."Name" ILIKE $1 OR u."Email" ILIKE $2 OR u."MobileNumber" ILIKE $3)`;
    }

    const countQuery = `SELECT COUNT(*) FROM "Users" u ${whereClause}`;
    const countResult = await appPool.query(countQuery, values);
    const totalUsers = Number.parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT
        u.*,
        m."Name" AS "ManagerName"
      FROM "Users" u
      LEFT JOIN "Users" m ON m."UserId" = u."ReportingManagerId"
      ${whereClause}
      ORDER BY u."UserId" DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2};
    `;

    const result = await appPool.query(dataQuery, [...values, limit, offset]);

    const users = result.rows.map((user) => ({
      id: user.UserId,
      name: user.Name,
      email: user.Email,
      mobileNumber: user.MobileNumber,
      companyId: user.CompanyId,
      userTypeId: user.UserTypeId,
      roleId: user.RoleId,
      reportingManagerId: user.ReportingManagerId,
      reportingManagerName: user.ManagerName,
      departmentId: user.DepartmentId,
      designationId: user.DesignationId,
      hierarchyLevel: user.HierarchyLevel,
      createdBy: user.CreatedBy,
      address: user.Address,
      city: user.City,
      state: user.State,
      country: user.Country,
      postalCode: user.PostalCode,
      image: user.userImage,
      isActive: user.IsActive,
      flag: user.Flag,
      isDelete: user.IsDelete,
      createdAt: user.CreatedAt,
      updatedAt: user.UpdatedAt,
    }));

    res.status(200).json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCompanies = async (req, res) => {
  const userId = req.user.userId;
  try {
    const userResult = await appPool.query(
      'SELECT "UserTypeId" FROM "Users" WHERE "UserId" = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (![1].includes(user.UserTypeId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this resource" });
    }
    const result = await appPool.query(
      'SELECT * FROM "Companies" WHERE "IsDelete" = FALSE'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const adminGetCompanies = async (req, res) => {
  const userId = req.user.userId;
  try {
    const userResult = await appPool.query(
      'SELECT "UserTypeId", "CompanyId" FROM "Users" WHERE "UserId" = $1',
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (![1, 2].includes(user.UserTypeId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const companyResult = await appPool.query(
      'SELECT * FROM "Companies" WHERE "Id" = $1 AND "IsDelete" = FALSE',
      [user.CompanyId]
    );
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(companyResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const toggleSoftDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await appPool.query(
      `
      UPDATE "Users"
      SET "IsDelete" = NOT "IsDelete"
      WHERE "UserId" = $1
      RETURNING "IsDelete";
    `,
      [id]
    );
    const isDeleted = result.rows[0]?.IsDelete;
    res.status(200).json({
      message: isDeleted ? "User soft-deleted" : "User restored",
      isDeleted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Toggle failed" });
  }
};

const toggleActivation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await appPool.query(
      `
      UPDATE "Users"
      SET "IsActive" = NOT "IsActive"
      WHERE "UserId" = $1
      RETURNING "IsActive";
    `,
      [id]
    );
    const isActive = result.rows[0]?.IsActive;
    res.status(200).json({
      message: isActive ? "User activated" : "User deactivated",
      isActive,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Activation toggle failed" });
  }
};

const toggleFlag = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await appPool.query(
      `
      UPDATE "Users"
      SET "Flag" = NOT "Flag"
      WHERE "UserId" = $1
      RETURNING "Flag";
    `,
      [id]
    );
    const flag = result.rows[0]?.Flag;
    res.status(200).json({
      message: flag ? "User flagged" : "User unflagged",
      flag,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Flag toggle failed" });
  }
};

const forgotPassword = async (req, res) => {
  const { Email, mobileNumber } = req.body;
  if (!Email || !mobileNumber) {
    return res
      .status(400)
      .json({ message: "Email and mobile number are required" });
  }

  try {
    const result = await appPool.query(
      `SELECT "UserId", "Name", "Email" FROM "Users"
       WHERE "Email" = $1 AND "MobileNumber" = $2 AND "IsDelete" = FALSE`,
      [Email, mobileNumber]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({
        message: "User not found with the provided credentials",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await appPool.query(
      `
      INSERT INTO "PasswordResets" ("UserId", "Token", "ExpiresAt")
      VALUES ($1, $2, $3)
    `,
      [user.UserId, resetToken, resetTokenExpiry]
    );

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const subject = "Password Reset Request";
    const text = `
Hi ${user.Name},
You requested to reset your password. Use the link below:
${resetUrl}
This link will expire in 1 hour.
Regards,
Your Company Team
    `;
    await sendEmail(user.Email, subject, text);

    return res
      .status(200)
      .json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const isValidPassword =
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]{8,}$/.test(
      newPassword
    );
  if (!isValidPassword) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include at least one letter and one number",
    });
  }

  try {
    const result = await appPool.query(
      `
      SELECT "UserId" FROM "PasswordResets"
      WHERE "Token" = $1 AND "ExpiresAt" > NOW()
    `,
      [token]
    );
    const tokenRecord = result.rows[0];
    if (!tokenRecord) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await appPool.query(
      `
      UPDATE "Users"
      SET "Password" = $1, "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE "UserId" = $2
    `,
      [hashedPassword, tokenRecord.UserId]
    );
    await appPool.query('DELETE FROM "PasswordResets" WHERE "Token" = $1', [
      token,
    ]);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getOrgHierarchy = async (req, res) => {
  try {
    const companyId = req.query.companyId ? Number(req.query.companyId) : null;

    const rootsQuery = `
      SELECT "UserId"
      FROM "Users"
      WHERE "ReportingManagerId" IS NULL
      ${companyId ? 'AND "CompanyId" = $1' : ""}
      AND "IsDelete" = FALSE
      ORDER BY "UserId";
    `;

    const rootResult = await appPool.query(rootsQuery, companyId ? [companyId] : []);

    const hierarchy = [];
    for (const root of rootResult.rows) {
      const rows = await getHierarchyRows(root.UserId, true, companyId);
      hierarchy.push(...rows);
    }

    res.status(200).json({ hierarchy });
  } catch (err) {
    console.error("Error fetching hierarchy:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyTeamHierarchy = async (req, res) => {
  try {
    const userId = req.user.userId;
    const hierarchy = await getHierarchyRows(userId, true);
    res.status(200).json({ hierarchy });
  } catch (err) {
    console.error("Error fetching my team hierarchy:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getDirectReports = async (req, res) => {
  try {
    const managerId = Number(req.params.userId);

    const query = `
      SELECT
        "UserId",
        "Name",
        "Email",
        "RoleId",
        "UserTypeId",
        "CompanyId",
        "ReportingManagerId"
      FROM "Users"
      WHERE "ReportingManagerId" = $1
      AND "IsDelete" = FALSE
      ORDER BY "Name";
    `;

    const { rows } = await appPool.query(query, [managerId]);
    res.status(200).json({ reports: rows });
  } catch (err) {
    console.error("Error fetching direct reports:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCompanyOrgChart = async (req, res) => {
  try {
    const companyId = Number(req.params.companyId);

    const rootsQuery = `
      SELECT "UserId"
      FROM "Users"
      WHERE "CompanyId" = $1
      AND "ReportingManagerId" IS NULL
      AND "IsDelete" = FALSE
      ORDER BY "UserId";
    `;

    const rootResult = await appPool.query(rootsQuery, [companyId]);

    const hierarchy = [];
    for (const root of rootResult.rows) {
      const rows = await getHierarchyRows(root.UserId, true, companyId);
      hierarchy.push(...rows);
    }

    res.status(200).json({ hierarchy });
  } catch (err) {
    console.error("Error fetching company org chart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  getCompanies,
  adminGetCompanies,
  toggleSoftDelete,
  toggleActivation,
  toggleFlag,
  updateUser,
  forgotPassword,
  resetPassword,
  getOrgHierarchy,
  getMyTeamHierarchy,
  getDirectReports,
  getCompanyOrgChart,
};
