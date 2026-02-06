import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSemester } from "./semesterContext";

function Profile() {
  const navigate = useNavigate();
  const { dept, sem, setDept, setSem } = useSemester();

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role") || "student";

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [type, setType] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [materials, setMaterials] = useState({ pyqs: [], midsem: [], references: [] });
  const [uploadHistory, setUploadHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

   const API =import.meta.env.VITE_API_URL || "https://cms-4-74hb.onrender.com";

  /* ===================== INIT CONTEXT FROM LOCALSTORAGE ===================== */
  useEffect(() => {
    const storedDept = localStorage.getItem("dept");
    const storedSem = localStorage.getItem("sem");
    if ((!dept || !sem) && storedDept && storedSem) {
      setDept(storedDept);
      setSem(parseInt(storedSem, 10));
    }
  }, [dept, sem, setDept, setSem]);

  /* ===================== FETCH LOGGED IN USER ===================== */
  const fetchMe = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return console.log("Not authorized");

      // Redirect if URL sem mismatch
      const urlSem = window.location.pathname.split("/")[4]; // /dept/:dept/sem/:sem/profile
      if (Number(urlSem) !== data.user.sem) {
        setSem(data.user.sem);
        navigate(`/dept/${dept}/sem/${data.user.sem}/profile`, { replace: true });
      }
    } catch (err) {
      console.error("FetchMe error:", err);
    }
  };

  /* ===================== FETCH SUBJECTS ===================== */
  const fetchSubjects = async () => {
    if (!dept || !sem) return;
    try {
      const res = await fetch(`${API}/admin/dept/${dept}/sem/${sem}/get-subjects`);
      const data = await res.json();
      const subjectArray = Array.isArray(data)
        ? data
        : Array.isArray(data.subjects)
        ? data.subjects
        : [];
      setSubjects(subjectArray);
      if (subjectArray.length > 0) setSelectedSubject(subjectArray[0].name || subjectArray[0]);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  /* ===================== FETCH MATERIALS ===================== */
  const fetchMaterials = async () => {
    if (!dept || !sem || !selectedSubject) return;
    try {
      const res = await fetch(
        `${API}/admin/${dept}/sem/${sem}/subject/${selectedSubject}`
      );
      const data = await res.json();
      setMaterials({
        pyqs: data.pyqs || [],
        midsem: data.midsem || [],
        references: data.references || [],
      });
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    }
  };

  /* ===================== FETCH UPLOAD HISTORY ===================== */
  const fetchUploadHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/student/uploads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data);

      setUploadHistory(data);
    } catch (err) {
      console.error("Failed to fetch upload history:", err);
    }
  };
const handleSemesterChange = async (newSem) => {
  if (!token) return alert("Not logged in");

  try {
    // 1️⃣ Update semester in backend
    const res = await fetch(`${API}/api/auth/update-semester`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ semester: newSem }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Semester update failed ❌");

    // 2️⃣ Update context
    setSem(newSem);

    // 3️⃣ Update localStorage (optional: only if you want persistence on refresh)
    localStorage.setItem("sem", newSem);

    // 4️⃣ Update URL so header & navigation links reflect it
    navigate(`/dept/${dept}/sem/${newSem}/profile`);

    alert("Semester updated successfully ✅");

  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
};


  /* ===================== HANDLE PDF UPLOAD ===================== */
  const handleUpload = async () => {
    if (!pdfFile || !type || !selectedSubject) return alert("Select subject, PDF, and type");

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("type", type);

    try {
      const res = await fetch(
        `${API}/pending-material/upload/${dept}/${sem}/${selectedSubject}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Upload failed");

      alert("PDF submitted for admin approval ✅");
      setPdfFile(null);
      setType("");
      fetchUploadHistory();
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    }
  };

  /* ===================== USE EFFECTS ===================== */
  useEffect(() => { fetchMe(); }, []);
  useEffect(() => { fetchSubjects(); fetchUploadHistory(); }, [dept, sem]);
  useEffect(() => { fetchMaterials(); }, [selectedSubject]);


const renderUploadHistory = (list) => {
  if (!list.length) return <p className="text-muted">No uploads yet</p>;

  const items = showAllHistory ? list : list.slice(0, 5);

  return (
    <div>
      <ul className="list-group">
        {items.map((p) => (
          <li
            key={p._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {/* Left side: title, type, rejection reason */}
            <div>
              <strong>{p.title}</strong> ({p.type})
              {p.status === "rejected" && p.rejectionReason && (
                <div className="text-danger small">Reason: {p.rejectionReason}</div>
              )}
            </div>

            {/* Right side: semester + status */}
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">Sem {p.sem || "N/A"}</span>
              <span
                className={`badge rounded-pill ${
                  p.status === "pending"
                    ? "bg-warning text-dark"
                    : p.status === "approved"
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {p.status.toUpperCase()}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {list.length > 5 && (
        <button
          className="btn btn-link mt-2"
          onClick={() => setShowAllHistory(!showAllHistory)}
        >
          {showAllHistory ? "Show Less" : `Show All (${list.length})`}
        </button>
      )}
    </div>
  );
};


  if (!dept || !sem) return <p>Loading profile...</p>;

  return (
    <>
      <h1>Profile Page</h1>
      <p>Name: {name?.toUpperCase()}</p>
      <p>Email: {email}</p>

      {role === "student" && (
        <div className="card p-3 mb-4">
          <h5>Change Semester</h5>
          <select
            className="form-select"
            value={sem}
            onChange={(e) => handleSemesterChange(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {role === "student" && (
        <div className="card p-3 mb-4">
          <h5>Submit PDF for Approval</h5>
          <select
            className="form-select mb-2"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((sub) => (
              <option key={sub.name || sub} value={sub.name || sub}>
                {sub.name || sub}
              </option>
            ))}
          </select>

          <select
            className="form-select mb-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="pyqs">PYQs</option>
            <option value="midsem">Mid Sem</option>
            <option value="references">Reference</option>
          </select>

          <input
            type="file"
            accept="application/pdf"
            className="form-control mb-2"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
          <button className="btn btn-success" onClick={handleUpload}>
            Submit
          </button>
        </div>
      )}

      {role === "student" && (
        <div className="mb-4">
          <h5>Your Upload History</h5>
          {renderUploadHistory(uploadHistory)}
        </div>
      )}
    </>
  );
}

export default Profile;
