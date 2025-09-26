import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function GitDiffViewer() {
  const [folder, setFolder] = useState("");
  const [diffFiles, setDiffFiles] = useState([]);
   const [commitMsg, setCommitMsg] = useState("");
   const [addedFiles, setAddedFiles] = useState([]);
     const [branch, setBranch] = useState("");


   const getBranch = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/git/branch");
      const data = await res.json();
      setBranch(data.branch);
    } catch (err) {
      setBranch("Error fetching branch");
    }
  };

  useEffect(() => {
    getBranch();
  }, []);

  const getDiff = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/git/diff/`);
      const data = await res.json();
      console.log(data.diffFiles)
      setDiffFiles(data.diffFiles); // each element is a file diff
    } catch (err) {
      setDiffFiles(["Error fetching diff"]);
    }
  };

  const getLineStyle = (line) => {
    if (/^\+(?!\+\+)/.test(line)) return "text-green-400";
    if (line.startsWith("+") && !line.startsWith("+++")){
      return "text-green-400";
    }
    if (line.startsWith("-") && !line.startsWith("---")){
      return "text-red-400";
    }
    if (line.startsWith("@@")){
      return "text-blue-400";
    }
    if (
      line.startsWith("diff") ||
      line.startsWith("index") ||
      line.startsWith("---") ||
      line.startsWith("+++")
    ){
      return "text-yellow-300";
    }
    return "text-gray-300";
  };

  // Extract file path from diff string
  const getFilePath = (diffText) => {
    const firstLine = diffText.split("\n")[0]; // e.g., diff --git a/index.php b/index.php
    const parts = firstLine.split(" ");
    if (parts.length >= 4) {
      return parts[2].replace("a/", ""); // original file path
    }
    return "unknown";
  };

  const commitChanges = async () => {
    if (!commitMsg) return alert("Enter a commit message");
    try {
      const res = await fetch("http://localhost:5000/api/git/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commitMsg }),
      });
      const data = await res.json();
      alert(data.message);
      setCommitMsg("");
    } catch (err) {
      alert("Error committing changes");
    }
  };
  const PushBranch = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/git/push",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: "HEAD" }),
      });
      const data = await res.json();
      alert(data.message || "File added successfully");
    } 
    catch (err) {
      alert("Error adding file");
    }
  }
  const addCommit = async (filePath) => {
    try {
      const res = await fetch("http://localhost:5000/api/git/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();
      setAddedFiles((prev) => [...prev, filePath]);
      alert(data.message || "File added successfully");
    } catch (err) {
      alert("Error adding file");
    }
  };

  const addcheckout = async (filePath) => {
    try {
      const res = await fetch("http://localhost:5000/api/git/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();
      setAddedFiles((prev) => [...prev, filePath]);
      alert(data.message || "Checkouted successfully");
    } catch (err) {
      alert("Error adding file");
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Branch: <b>{branch ? branch: ''}</b></h2>

      <div className="flex gap-2 mb-4">
        {/* <input
          type="text"
          placeholder="Enter folder name"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="border p-2 m-2 rounded w-full"
        /> */}
        <button
          onClick={getDiff}
          className="btn btn-primary p-2"
        >
          Check your changes
        </button>
      </div>

      <div className="space-y-4">
        {diffFiles.length > 0 &&
          diffFiles.map((fileDiff, idx) => {
            const filePath = getFilePath(fileDiff);
            if (addedFiles.includes(filePath)) return null;
            return (
              <div key={idx}  className="bg-black text-green-400 mt-4 p-4 rounded">
                <div className="customfilepath">
                  <span className="customfilepath_title">{filePath}</span>
                  <button
                    className="btn btn-success m-1"
                    onClick={() => addCommit(filePath)}
                  >
                    Add
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => addcheckout(filePath)}
                  >
                    checkout
                  </button>
                </div>
                {/* <textarea
                  className="textarea"
                  value={fileDiff}
                  readOnly
                /> */}
                 {/* <pre className="bg-black p-4 rounded overflow-auto max-h-[600px] font-mono">
                    <div key={idx} className={getLineStyle(fileDiff)}>
                    {fileDiff}
                  </div>
                  </pre> */}
                  <div className="overflow-auto max-h-[300px] font-mono">
                {fileDiff.split('\n').map((line, lineIdx) => {
                  const trimmed = line.trimStart();

                  let colorClass = "text-gray-300"; // default
                  if (trimmed.startsWith("+") && !trimmed.startsWith("+++")) colorClass = "text-green-400";
                  else if (trimmed.startsWith("-") && !trimmed.startsWith("---")) colorClass = "text-red-400";
                  else if (trimmed.startsWith("@@")) colorClass = "text-blue-400";
                  else if (["diff", "index", "---", "+++"].some(prefix => trimmed.startsWith(prefix))) colorClass = "text-yellow-300";

                  return (
                    <div key={lineIdx} className={colorClass}>
                      {line}
                    </div>
                  );
                })}
              </div>
              </div>
            );
          })}
      </div>
       {/* Commit Section */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Commit message"
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          className="border p-2 m-2 rounded w-full"
        />
        <button
          onClick={commitChanges}
          className="btn btn-primary px-4 py-2 rounded"
        >
          Commit
        </button>
      </div>
      <div>
        <button
          onClick={PushBranch}
          className="btn btn-primary m-2 rounded"
        >
          Git Push Branch
        </button>
      </div>
    </div>
  );
}
