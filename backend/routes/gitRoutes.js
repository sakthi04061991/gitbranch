// backend/routes/gitRoutes.js
const  express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

router.get("/diff/:folder", (req, res) => {
  const folder = req.params.folder;

  // Run git diff only for that folder
  exec(`git diff ${folder}`, { cwd: "/path/to/your/repo" }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }
    res.json({ diff: stdout || "No changes" });
  });
});

export default router;
