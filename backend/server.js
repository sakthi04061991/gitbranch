import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// Replace this with your frontend repo absolute path
const repoPath = "/var/www/html/ERP";

app.get("/api/git/diff/", (req, res) => {
  const folder = req.params.folder;

  exec(`git diff `, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    //const diffArray = stdout ? stdout.split("\n") : ["No changes"];
    //res.json({ diff: diffArray });
    if (!stdout) return res.json({ diffFiles: [] });
    //const diffArray = stdout ? stdout.split("\n") : ["No changes"];
    // Split by "diff --git" to separate each file
    const filesDiff = stdout
      .split(/^diff --git /gm) // split by each file diff
      .filter(Boolean) // remove empty elements
      .map((diffText) => "diff --git " + diffText); // add diff keyword back
    res.json({ diffFiles: filesDiff });
  });
});

app.post("/api/git/add", (req, res) => {
  const { filePath } = req.body;

  if (!filePath) return res.status(400).json({ error: "filePath is required" });

  exec(`git add ${filePath}`, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ message: `File ${filePath} added successfully` });
  });
});

app.get("/api/git/branch", (req, res) => {
  exec(`git rev-parse --abbrev-ref HEAD`, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });

    const branch = stdout.trim();
    res.json({ branch });
  });
});


app.post("/api/git/checkout", (req, res) => {
  const { filePath } = req.body;

  if (!filePath) return res.status(400).json({ error: "filePath is required" });

  exec(`git checkout ${filePath}`, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ message: `File ${filePath} checkouted successfully` });
  });
});

// Commit API
app.post("/api/git/commit", (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Commit message is required" });

  exec(`git commit -m "${message}"`, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) {
      // If no staged changes, git returns error, handle gracefully
      if (stderr.includes("nothing to commit")) {
        return res.json({ message: "Nothing to commit" });
      }
      else{
        return res.json({ message: "Nothing to commit" });
      }
      return res.status(500).json({ error: stderr || err.message });
    }

    res.json({ message: stdout || `Committed with message: "${message}"` });
  });
});

app.post("/api/git/push", (req, res) => {
  // Optionally, you can get branch name from frontend
  const branch = req.body.branch || "main"; // default to main
  exec(`git push origin ${branch}`, { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ message: stdout || `Pushed to branch ${branch} successfully` });
  });
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
