function addCommunityGiverRole(userData = {}) {
  const roles = new Set(Array.isArray(userData.roles) ? userData.roles : []);
  if (userData.role) roles.add(userData.role);
  if (roles.size === 0) roles.add("client");
  roles.add("giver");
  return { role: userData.role || "client", roles: [...roles] };
}

module.exports = { addCommunityGiverRole };
