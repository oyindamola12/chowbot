const sessions = {};

function getSession(user) {
  if (!sessions[user]) {
    sessions[user] = {
      step: "start",
      restaurant: null,
      cart: []
    };
  }
  return sessions[user];
}

function resetSession(user) {
  delete sessions[user];
}

module.exports = { getSession, resetSession };