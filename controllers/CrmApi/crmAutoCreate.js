const nonEmpty = (value) => {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const splitFullName = (fullName) => {
  const safeName = nonEmpty(fullName);
  if (!safeName) {
    return { firstName: null, lastName: null };
  }

  const parts = safeName.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const insertAccount = async ({ client, payload, fallbackName }) => {
  const accountName = nonEmpty(payload.AutoAccountName) || nonEmpty(fallbackName);
  if (!accountName) {
    return null;
  }

  const query = `
    INSERT INTO "Accounts" (
      "CompanyId",
      "Name",
      "Website",
      "Description",
      "IndustryId",
      "CreatedBy",
      "IsActive",
      "IsDeleted",
      "Flag"
    )
    VALUES ($1, $2, $3, $4, $5, $6, TRUE, FALSE, FALSE)
    RETURNING "Id";
  `;

  const values = [
    payload.CompanyId ?? null,
    accountName,
    nonEmpty(payload.AutoAccountWebsite) || nonEmpty(payload.Website),
    nonEmpty(payload.AutoAccountDescription) || nonEmpty(payload.Description),
    payload.IndustryId ?? null,
    payload.CreatedBy ?? null,
  ];

  const { rows } = await client.query(query, values);
  return rows[0]?.Id ?? null;
};

const insertContact = async ({ client, payload, accountId }) => {
  const derived = splitFullName(payload.AutoContactName);
  const firstName = nonEmpty(payload.AutoContactFirstName) || derived.firstName;
  const lastName = nonEmpty(payload.AutoContactLastName) || derived.lastName;
  const email = nonEmpty(payload.AutoContactEmail);
  const phone = nonEmpty(payload.AutoContactPhone);
  const title = nonEmpty(payload.AutoContactTitle);

  if (!firstName && !lastName && !email && !phone) {
    return null;
  }

  const query = `
    INSERT INTO "Contacts" (
      "CompanyId",
      "AccountId",
      "FirstName",
      "LastName",
      "Email",
      "Phone",
      "Title",
      "CreatedBy",
      "IsActive",
      "IsDeleted",
      "Flag"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, FALSE, FALSE)
    RETURNING "Id";
  `;

  const values = [
    payload.CompanyId ?? null,
    accountId ?? null,
    firstName,
    lastName,
    email,
    phone,
    title,
    payload.CreatedBy ?? null,
  ];

  const { rows } = await client.query(query, values);
  return rows[0]?.Id ?? null;
};

const withAutoCreatedParties = async ({ payload, client, fallbackAccountName }) => {
  const nextPayload = { ...payload };

  if (!nextPayload.AccountId) {
    nextPayload.AccountId = await insertAccount({
      client,
      payload: nextPayload,
      fallbackName: fallbackAccountName,
    });
  }

  if (!nextPayload.ContactId) {
    nextPayload.ContactId = await insertContact({
      client,
      payload: nextPayload,
      accountId: nextPayload.AccountId,
    });
  }

  return nextPayload;
};

module.exports = {
  withAutoCreatedParties,
};
