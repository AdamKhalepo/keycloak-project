const parseToken = (raw) => {
  if (!raw || typeof raw !== "string") return null;

  try {
    raw = JSON.parse(raw);
    const token = raw.id_token ? raw.id_token : raw.access_token;
    const content = token.split(".")[1];
    console.log("ID token");
    console.log(raw.id_token);
    console.log("Access token");
    console.log(raw.access_token);

    return JSON.parse(Buffer.from(content, "base64").toString("utf-8"));
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  parseToken,
};
