// const bcrypt = require("bcryptjs");
// const { appPool } = require('../../config/db');
// const { generateTokens } = require('../../utils/tokenUtils');
// const fs = require('fs');
// const path = require('path');
// const { use } = require('../../routes/Company/companiesRoutes');
// const { sendEmail } = require('../../utils/email');
// const crypto = require('crypto');

// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// const registerUser = async (req, res) => {
//   const {
//     name, email, password, mobileNumber,
//     companyId, userTypeId, createdBy,
//     address, city, state, country, postalCode
//   } = req.body;

//   if (!passwordRegex.test(password)) {
//     return res.status(400).json({
//       message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long'
//     });
//   }
//   try {
//     const existing = await appPool.query('SELECT * FROM "Users" WHERE "Email" = $1', [email]);
//     if (existing.rows.length) {
//       if (req.file) fs.unlinkSync(req.file.path);
//       return res.status(409).json({ message: 'Email already registered' });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userImage = req.file ? req.file.path.replace(/\\/g, '/') : null;
//     const result = await appPool.query(`INSERT INTO "Users" ("Name", "Email", "Password", "MobileNumber", "CompanyId", "UserTypeId","CreatedBy", "Address", "City", "State", "Country", "PostalCode", "userImage") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)RETURNING *`,
//       [name, email, hashedPassword, mobileNumber, companyId, userTypeId, createdBy, address, city, state, country, postalCode, userImage]);
//     const user = result.rows[0];
//     const subject = 'Welcome to Our Service!';
//     const text = `Hello ${user.Name},\n\nThank you for registering with us. Your account has been created successfully.`;
//     await sendEmail(user.Email, subject, text);
//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         id: user.UserId,
//         name: user.Name,
//         email: user.Email,
//         image: user.userImage
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     if (req.file) fs.unlinkSync(req.file.path);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const updateUser = async (req, res) => {
//   const {
//     userId, name, email, password, mobileNumber,
//     companyId, userTypeId, address, city, state, country, postalCode
//   } = req.body;
//   if (password && !passwordRegex.test(password)) {
//     return res.status(400).json({
//       message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long'
//     });
//   }
//   try {
//     const existingUserResult = await appPool.query('SELECT * FROM "Users" WHERE "UserId" = $1', [userId]);
//     if (!existingUserResult.rows.length) {
//       if (req.file) fs.unlinkSync(req.file.path);
//       return res.status(404).json({ message: 'User not found' });
//     }
//     const existingUser = existingUserResult.rows[0];
//     const hashedPassword = password ? await bcrypt.hash(password, 10) : existingUser.Password;
//     let updatedImage = existingUser.userImage;
//     if (req.file) {
//       updatedImage = req.file.path.replace(/\\/g, '/');
//       if (existingUser.userImage && fs.existsSync(existingUser.userImage)) {
//         fs.unlinkSync(existingUser.userImage);
//       }
//     }

//     const updateQuery = `UPDATE "Users" SET "Name" = $1,"Email" = $2,"Password" = $3,"MobileNumber" = $4,"CompanyId" = $5, "UserTypeId" = $6,"Address" = $7, "City" = $8, "State" = $9,"Country" = $10, "PostalCode" = $11, "userImage" = $12 WHERE "UserId" = $13 RETURNING *`;

//     const values = [
//       name ?? existingUser.Name,
//       email ?? existingUser.Email,
//       hashedPassword,
//       mobileNumber ?? existingUser.MobileNumber,
//       companyId ?? existingUser.CompanyId,
//       userTypeId ?? existingUser.UserTypeId,
//       address ?? existingUser.Address,
//       city ?? existingUser.City,
//       state ?? existingUser.State,
//       country ?? existingUser.Country,
//       postalCode ?? existingUser.PostalCode,
//       updatedImage,
//       userId
//     ];

//     const result = await appPool.query(updateQuery, values);
//     const user = result.rows[0];
//     const subject = 'Your Account Information Has Been Updated';
//     const text = `Hello ${user.Name},\n\nYour account information has been successfully updated. If you did not make this change, please contact support immediately.`;
//     await sendEmail(user.Email, subject, text);
//     res.status(200).json({
//       message: 'User updated successfully',
//       user: {
//         id: user.UserId,
//         name: user.Name,
//         email: user.Email,
//         image: user.userImage
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     if (req.file) fs.unlinkSync(req.file.path);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const result = await appPool.query('SELECT * FROM "Users" WHERE "Email" = $1', [email]);
//     const user = result.rows[0];
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const match = await bcrypt.compare(password, user.Password);
//     if (!match) return res.status(401).json({ message: 'Invalid credentials' });

//     const tokens = await generateTokens(user);

//     res.status(200).json({
//       message: 'Login successful',
//       user: {
//         id: user.UserId,
//         name: user.Name,
//         email: user.Email,
//         image: user.userImage
//       },
//       ...tokens
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// const getProfile = async (req, res) => {
//   const userId = req.user.userId; // userId extracted from JWT middleware

//   try {
//     // ✅ Select only safe columns — exclude password
//     const query = `
//       SELECT 
//         "UserId" AS id,
//         "Name" AS name,
//         "Email" AS email,
//         "MobileNumber" AS mobileNumber,
//         "userImage" AS image,
//         "Address" AS address,
//         "City" AS city,
//         "State" AS state,
//         "Country" AS country,
//         "PostalCode" AS postalCode,
//         "CompanyId" AS companyId,
//         "UserTypeId" AS userTypeId,
//         "IsActive" AS isActive,
//         "Flag" AS flag,
//         "IsDelete" AS isDelete,
//         "CreatedAt" AS createdAt,
//         "UpdatedAt" AS updatedAt
//       FROM "Users"
//       WHERE "UserId" = $1 AND "IsDelete" = FALSE
//       LIMIT 1;
//     `;

//     const result = await appPool.query(query, [userId]);
//     const user = result.rows[0];

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       profile: user,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching user profile:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// const getAllUsers = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';
//     const offset = (page - 1) * limit;

//     let whereClause = '';
//     let values = [];

//     if (search) {
//       values.push(`%${search}%`);
//       values.push(`%${search}%`);
//       values.push(`%${search}%`);
//       whereClause = `WHERE "Name" ILIKE $1 OR "Email" ILIKE $2 OR "MobileNumber" ILIKE $3`;
//     }

//     // Count query
//     const countQuery = `SELECT COUNT(*) FROM "Users" ${whereClause}`;
//     const countResult = await appPool.query(countQuery, values);
//     const totalUsers = parseInt(countResult.rows[0].count);

//     // Decide order based on search presence
//     const orderBy = search ? `"UserId" ASC` : `"UserId" DESC`;

//     // Data query
//     const dataQuery = `
//       SELECT * FROM "Users"
//       ${whereClause}
//       ORDER BY ${orderBy}
//       LIMIT $${values.length + 1} OFFSET $${values.length + 2}
//     `;
//     values.push(limit);
//     values.push(offset);

//     const result = await appPool.query(dataQuery, values);
//     const users = result.rows;

//     if (users.length === 0) {
//       return res.status(404).json({ message: 'No users found' });
//     }

//     const formattedUsers = users.map((user) => ({
//       id: user.UserId,
//       name: user.Name,
//       email: user.Email,
//       mobileNumber: user.MobileNumber,
//       companyId: user.CompanyId,
//       userTypeId: user.UserTypeId,
//       createdBy: user.CreatedBy,
//       address: user.Address,
//       city: user.City,
//       state: user.State,
//       country: user.Country,
//       postalCode: user.PostalCode,
//       image: user.userImage,
//       isActive: user.IsActive,
//       flag: user.Flag,
//       isDelete: user.IsDelete,
//       createdAt: user.CreatedAt,
//       updatedAt: user.UpdatedAt
//     }));

//     res.status(200).json({
//       page,
//       limit,
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limit),
//       users: formattedUsers
//     });

//   } catch (err) {
//     console.error('Error fetching all users:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };






// const getCompanies = async (req, res) => {
//   const userId = req.user.userId;
//   try {
//     const userResult = await appPool.query('SELECT "UserTypeId" FROM "Users" WHERE "UserId" = $1', [userId]);
//     const user = userResult.rows[0];
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     if (![1].includes(user.UserTypeId)) {
//       return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
//     }
//     const result = await appPool.query('SELECT * FROM "Companies" WHERE "IsDelete" = FALSE');
//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const adminGetCompanies = async (req, res) => {
//   const userId = req.user.userId;
//   try {
//     const userResult = await appPool.query(
//       'SELECT "UserTypeId", "CompanyId" FROM "Users" WHERE "UserId" = $1',
//       [userId]
//     );
//     const user = userResult.rows[0];
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     if (![1, 2].includes(user.UserTypeId)) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     const companyResult = await appPool.query(
//       'SELECT * FROM "Companies" WHERE "Id" = $1 AND "IsDelete" = FALSE',
//       [user.CompanyId]
//     );
//     if (companyResult.rows.length === 0) {
//       return res.status(404).json({ message: 'Company not found' });
//     }
//     res.status(200).json(companyResult.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const toggleSoftDelete = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await appPool.query(`
//       UPDATE "Users"
//       SET "IsDelete" = NOT "IsDelete"
//       WHERE "UserId" = $1
//       RETURNING "IsDelete"
//     `, [id]);
//     const isDeleted = result.rows[0].IsDelete;
//     res.status(200).json({
//       message: isDeleted ? 'User soft-deleted' : 'User restored',
//       isDeleted
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Toggle failed' });
//   }
// };

// const toggleActivation = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await appPool.query(`
//       UPDATE "Users"
//       SET "IsActive" = NOT "IsActive"
//       WHERE "UserId" = $1
//       RETURNING "IsActive"
//     `, [id]);
//     const isActive = result.rows[0].IsActive;
//     res.status(200).json({
//       message: isActive ? 'User activated' : 'User deactivated',
//       isActive
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Activation toggle failed' });
//   }
// };

// const toggleFlag = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await appPool.query(`
//       UPDATE "Users"
//       SET "Flag" = NOT "Flag"
//       WHERE "UserId" = $1
//       RETURNING "Flag"
//     `, [id]);
//     const flag = result.rows[0].Flag;
//     res.status(200).json({
//       message: flag ? 'User flagged' : 'User unflagged',
//       flag
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Flag toggle failed' });
//   }
// };

// const forgotPassword = async (req, res) => {
//   const { Email, mobileNumber } = req.body;
//   if (!Email || !mobileNumber) {
//     return res.status(400).json({ message: 'Email and mobile number are required' });
//   }

//   try {
//     const result = await appPool.query(
//       `SELECT "UserId", "Name", "Email" FROM "Users" WHERE "Email" = $1 AND "MobileNumber" = $2 AND "IsDelete" = FALSE`,
//       [Email, mobileNumber]
//     );
//     const user = result.rows[0];
//     if (!user) {
//       return res.status(404).json({ message: 'User not found with the provided credentials' });
//     }
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
//     await appPool.query(`
//       INSERT INTO "PasswordResets" ("UserId", "Token", "ExpiresAt")
//       VALUES ($1, $2, $3)
//     `, [user.UserId, resetToken, resetTokenExpiry]);
//     const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
//     const subject = 'Password Reset Request';
//     const text = `
// Hi ${user.Name},
// You requested to reset your password. Use the link below:
// ${resetUrl}
// This link will expire in 1 hour.
// Regards,
// Your Company Team
//     `;
//     await sendEmail(user.Email, subject, text);
//     return res.status(200).json({ message: 'Password reset link sent to your email' });
//   } catch (error) {
//     console.error('Forgot Password Error:', error.message);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
  

// const resetPassword = async (req, res) => {
//   const { token, newPassword, confirmPassword } = req.body;

//   if (!token || !newPassword || !confirmPassword) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }
//   if (newPassword !== confirmPassword) {
//     return res.status(400).json({ message: 'Passwords do not match' });
//   }
//   const isValidPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]{8,}$/.test(newPassword);
//   if (!isValidPassword) {
//     return res.status(400).json({
//       message: 'Password must be at least 8 characters long and include at least one letter and one number',
//     });
//   }
//   try {
//     const result = await appPool.query(`
//       SELECT "UserId" FROM "PasswordResets"
//       WHERE "Token" = $1 AND "ExpiresAt" > NOW()
//     `, [token]);
//     const tokenRecord = result.rows[0];
//     if (!tokenRecord) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     await appPool.query(`
//       UPDATE "Users" SET "Password" = $1, "UpdatedAt" = CURRENT_TIMESTAMP WHERE "UserId" = $2
//     `, [hashedPassword, tokenRecord.UserId]);
//     await appPool.query(`DELETE FROM "PasswordResets" WHERE "Token" = $1`, [token]);
//     return res.status(200).json({ message: 'Password reset successfully' });
//   } catch (error) {
//     console.error('Reset Password Error:', error.message);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// module.exports = { registerUser, loginUser, getProfile,getAllUsers, getCompanies, adminGetCompanies, toggleSoftDelete, toggleActivation, toggleFlag, updateUser, forgotPassword, resetPassword };





const bcrypt = require("bcryptjs");
const { appPool } = require("../../config/db");
const { generateTokens } = require("../../utils/tokenUtils");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../../utils/email");
const crypto = require("crypto");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// REGISTER
const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    mobileNumber,
    companyId,
    userTypeId,
    createdBy,
    address,
    city,
    state,
    country,
    postalCode,
    reportingManagerId, // NEW
  } = req.body;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long",
    });
  }

  try {
    const existing = await appPool.query(
      'SELECT * FROM "Users" WHERE "Email" = $1',
      [email]
    );
    if (existing.rows.length) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const result = await appPool.query(
      `INSERT INTO "Users"
       ("Name","Email","Password","MobileNumber","CompanyId","UserTypeId",
        "CreatedBy","ReportingManagerId","Address","City","State","Country",
        "PostalCode","userImage")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        name,
        email,
        hashedPassword,
        mobileNumber,
        companyId,
        userTypeId,
        createdBy,
        reportingManagerId || null,
        address,
        city,
        state,
        country,
        postalCode,
        userImage,
      ]
    );

    const user = result.rows[0];

    const subject = "Welcome to Our Service!";
    const text = `Hello ${user.Name},\n\nThank you for registering with us. Your account has been created successfully.`;
    await sendEmail(user.Email, subject, text);

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

// UPDATE
const updateUser = async (req, res) => {
  const {
    userId,
    name,
    email,
    password,
    mobileNumber,
    companyId,
    userTypeId,
    address,
    city,
    state,
    country,
    postalCode,
    reportingManagerId, // NEW
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
        "ReportingManagerId" = $13
      WHERE "UserId" = $14
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
      userId,
    ];

    const result = await appPool.query(updateQuery, values);
    const user = result.rows[0];

    const subject = "Your Account Information Has Been Updated";
    const text = `Hello ${user.Name},\n\nYour account information has been successfully updated. If you did not make this change, please contact support immediately.`;
    await sendEmail(user.Email, subject, text);

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

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await appPool.query(
      'SELECT * FROM "Users" WHERE "Email" = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.Password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

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

// PROFILE (includes manager info)
const getProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const query = `
      SELECT 
        u."UserId" AS id,
        u."Name" AS name,
        u."Email" AS email,
        u."MobileNumber" AS mobileNumber,
        u."userImage" AS image,
        u."Address" AS address,
        u."City" AS city,
        u."State" AS state,
        u."Country" AS country,
        u."PostalCode" AS postalCode,
        u."CompanyId" AS companyId,
        u."UserTypeId" AS userTypeId,
        u."ReportingManagerId" AS reportingManagerId,
        m."Name" AS reportingManagerName,
        u."IsActive" AS isActive,
        u."Flag" AS flag,
        u."IsDelete" AS isDelete,
        u."CreatedAt" AS createdAt,
        u."UpdatedAt" AS updatedAt
      FROM "Users" u
      LEFT JOIN "Users" m
        ON m."UserId" = u."ReportingManagerId"
      WHERE u."UserId" = $1 AND u."IsDelete" = FALSE
      LIMIT 1;
    `;

    const result = await appPool.query(query, [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PAGINATED LIST (includes manager name)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = '';
    const values = [];

    if (search) {
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
      whereClause =
        'WHERE u."Name" ILIKE $1 OR u."Email" ILIKE $2 OR u."MobileNumber" ILIKE $3';
    }

    const countQuery = `SELECT COUNT(*) FROM "Users" u ${whereClause}`;
    const countResult = await appPool.query(countQuery, values);
    const totalUsers = parseInt(countResult.rows[0].count, 10);

    const orderBy = search ? 'u."UserId" ASC' : 'u."UserId" DESC';

    const dataQuery = `
      SELECT
        u.*,
        m."Name" AS "ManagerName"
      FROM "Users" u
      LEFT JOIN "Users" m
        ON m."UserId" = u."ReportingManagerId"
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2};
    `;
    values.push(limit, offset);

    const result = await appPool.query(dataQuery, values);
    const users = result.rows;

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    const formattedUsers = users.map((user) => ({
      id: user.UserId,
      name: user.Name,
      email: user.Email,
      mobileNumber: user.MobileNumber,
      companyId: user.CompanyId,
      userTypeId: user.UserTypeId,
      createdBy: user.CreatedBy,
      reportingManagerId: user.ReportingManagerId,
      reportingManagerName: user.ManagerName,
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
      users: formattedUsers,
    });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// COMPANIES (unchanged logic)
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

// TOGGLE FLAGS (unchanged)
const toggleSoftDelete = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await appPool.query(
      `
      UPDATE "Users"
      SET "IsDelete" = NOT "IsDelete"
      WHERE "UserId" = $1
      RETURNING "IsDelete"
    `,
      [id]
    );
    const isDeleted = result.rows[0].IsDelete;
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
      RETURNING "IsActive"
    `,
      [id]
    );
    const isActive = result.rows[0].IsActive;
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
      RETURNING "Flag"
    `,
      [id]
    );
    const flag = result.rows[0].Flag;
    res.status(200).json({
      message: flag ? "User flagged" : "User unflagged",
      flag,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Flag toggle failed" });
  }
};

// FORGOT / RESET PASSWORD (unchanged)
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
    await appPool.query(`DELETE FROM "PasswordResets" WHERE "Token" = $1`, [
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

// HIERARCHICAL STRUCTURE (example: full org tree)
const getOrgHierarchy = async (req, res) => {
  try {
    const result = await appPool.query(
      `
      WITH RECURSIVE org AS (
        SELECT
          u."UserId",
          u."Name",
          u."ReportingManagerId",
          1 AS level
        FROM "Users" u
        WHERE u."ReportingManagerId" IS NULL

        UNION ALL

        SELECT
          c."UserId",
          c."Name",
          c."ReportingManagerId",
          org.level + 1
        FROM "Users" c
        JOIN org ON c."ReportingManagerId" = org."UserId"
      )
      SELECT * FROM org ORDER BY level, "Name";
    `
    ); /* recursive CTE for hierarchy [web:29][web:38] */

    res.status(200).json({ hierarchy: result.rows });
  } catch (err) {
    console.error("Error fetching hierarchy:", err);
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
};
