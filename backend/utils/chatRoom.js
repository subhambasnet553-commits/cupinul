function getRoomId(userIdA, userIdB) {
  return [userIdA.toString(), userIdB.toString()].sort().join("_");
}

module.exports = { getRoomId };
