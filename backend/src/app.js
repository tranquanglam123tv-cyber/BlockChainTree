const express = require("express");
const cors = require("cors");
const registryRouter = require("./registry");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", registryRouter);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
}

module.exports = app;
