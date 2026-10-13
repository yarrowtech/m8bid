const normalizeUser = (user) => {
  if (!user) return user;
  const data = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete data.password;
  data.id = data._id;
  data.role = data.role === "admin" ? "admin" : "user";
  const contributor = { ...(data.access?.investor || data.access?.contributor || {}), enabled: true };
  const raiser = { ...(data.access?.fundraiser || data.access?.raiser || {}), enabled: true };
  data.access = { investor: contributor, fundraiser: raiser, contributor, raiser };
  data.kycStatus = data.kycStatus || contributor.kycStatus || raiser.kycStatus || "NONE";
  data.fundraiserVerification = raiser.kycStatus || "NONE";
  return data;
};

module.exports = { normalizeUser };
