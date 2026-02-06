import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SubjectPage = () => {
  const { dept, sem, subjectName } = useParams();

  const [role, setRole] = useState(null); // admin / student
  const [showUpload, setShowUpload] = useState(false);
  const [webUpload, setWebUpload] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [type, setType] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [materials, setMaterials] = useState({
    pyqs: [],
    midsem: [],
    references: [],
  });
  const [webLinks, setWebLinks] = useState([]);
  const [pendingLinks, setPendingLinks] = useState([]);
  const [expandedTitles, setExpandedTitles] = useState({});

  const token = localStorage.getItem("token");

   const API =import.meta.env.VITE_API_URL || "https://cms-4-74hb.onrender.com";

  /* ==================== FETCH ROLE ==================== */
  useEffect(() => {
    const fetchRole = async () => {
      if (!token) return setRole("student");
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRole(data.user?.role || "student");
      } catch {
        setRole("student");
      }
    };
    fetchRole();
  }, [token]);

  /* ==================== FETCH MATERIALS ==================== */
  const fetchMaterials = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${API}/admin/${dept}/sem/${sem}/subject/${subjectName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log(data);

      setMaterials({
        pyqs: data.pyqs || [],
        midsem: data.midsem || [],
        references: data.references || [],
      });
      setWebLinks(data.links || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ==================== FETCH PENDING LINKS ==================== */
  const fetchPendingLinks = async () => {
    if (!token) return;
    try {
      const url =
        role === "admin"
          ? `${API}/pending-links`
          : `${API}/student/pending-links/${dept}/${sem}/${subjectName}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPendingLinks(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (role) {
      fetchMaterials();
      fetchPendingLinks();
    }
  }, [role, dept, sem, subjectName]);

  /* ==================== ADMIN PDF UPLOAD ==================== */
  const handleAdminUpload = async () => {
    if (!pdfFile || !type) return alert("Select PDF and type");
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("type", type);

      const res = await fetch(
        // /pending-material/upload/:dept/:sem/:subjectName"
        `${API}//${dept}/sem/${sem}/subject/${subjectName}/upload`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      alert("PDF uploaded!");
      setPdfFile(null);
      setType("");
      setShowUpload(false);
      fetchMaterials();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ==================== STUDENT PDF UPLOAD ==================== */
  const handleStudentUpload = async () => {
    if (!pdfFile || !type) return alert("Select PDF and type");
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("type", type);

      const res = await fetch(
        // /pending-material/upload/:dept/:sem/:subjectName"
        `${API}/pending-material/upload/${dept}/${sem}/${subjectName}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      alert("PDF submitted for admin approval!");
      setPdfFile(null);
      setType("");
      setShowUpload(false);
    } catch (err) {
      alert(err.message);
    }
  };

  /* ==================== DELETE PDF ==================== */
  const handleDeletePdf = async (pdf, type) => {
    if (!window.confirm("Delete this PDF?")) return;
    try {
      const res = await fetch(
        `${API}/admin/dept/${dept}/sem/${sem}/subject/${subjectName}/delete-material`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type, fileUrl: pdf.fileUrl }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Deleted!");
      setMaterials((prev) => ({
        ...prev,
        [type]: prev[type].filter((p) => p.fileUrl !== pdf.fileUrl),
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  /* ==================== ADD / DELETE LINK ==================== */
  const handleAddLink = async () => {
    if (!linkTitle || !linkUrl) return alert("Title & URL required");
    try {
      const res = await fetch(
        `${API}/admin/dept/${dept}/sem/${sem}/subject/${subjectName}/add-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: linkTitle, url: linkUrl }),
        }
      );
      if (!res.ok) throw new Error("Add link failed");
      setLinkTitle("");
      setLinkUrl("");
      setWebUpload(false);
      fetchMaterials();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      const res = await fetch(
        `${API}/admin/dept/${dept}/sem/${sem}/subject/${subjectName}/links/${linkId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Delete failed");
      setWebLinks((prev) => prev.filter((l) => l._id !== linkId));
    } catch (err) {
      alert(err.message);
    }
  };

  /* ==================== STUDENT REQUEST LINK ==================== */
  const handleRequestLink = async () => {
    if (!requestTitle || !requestUrl) return alert("Title & URL required");
    try {
      const res = await fetch(
        `${API}/student/pending-link/${dept}/${sem}/${subjectName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: requestTitle, url: requestUrl }),
        }
      );
      const data = await res.json();
      console.log(data);

      if (!res.ok) throw new Error(data.message);

      setRequestTitle("");
      setRequestUrl("");
      fetchPendingLinks();
      alert("Submitted for approval!");
    } catch (err) {
      alert(err.message);
    }
    fetchLinkHistory()
  };

const [linkHistory, setLinkHistory] = useState([]);
const fetchLinkHistory = async () => {
  try {
    const res = await fetch(`${API}/student/link-history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("Response Status:", res.status);

    const data = await res.json();
    console.log("History Data:", data);

    setLinkHistory(data);
  } catch (err) {
    console.log("Fetch Error:", err);
  }
};

  useEffect(() => {
  console.log("Fetching Link History...");
  fetchLinkHistory();
}, []);

  const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate();

  // Add suffix (st, nd, rd, th)
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}${suffix} ${month} ${year} at ${time}`;
};

  /* ==================== RENDER PDF LIST ==================== */
  const renderPdfList = (list, type) =>
    list.length === 0 ? (
      <p className="text-muted">No PDFs</p>
    ) : (
      <div className="row">
        {list.map((pdf) => {
          const maxLength = 25;
          const isExpanded = expandedTitles[pdf._id] || false;
          const displayTitle =
            pdf.title.length > maxLength && !isExpanded
              ? pdf.title.slice(0, maxLength) + "..."
              : pdf.title;
          return (
            <div className="col-md-3 mb-3" key={pdf._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="text-center mb-2">
                    <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: "2rem", color: "#e63946" }}></i>
                  </div>
                  <h6 className="card-title" style={{ wordBreak: "break-word" }}>
                    {displayTitle}
                    {pdf.title.length > maxLength && (
                      <span
                        className="text-primary ms-1"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setExpandedTitles((prev) => ({ ...prev, [pdf._id]: !prev[pdf._id] }))
                        }
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                      </span>
                    )}
                  </h6>
                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary flex-grow-1"
                      onClick={() =>
                        window.open(pdf.fileUrl.startsWith("http") ? pdf.fileUrl : `${API}${pdf.fileUrl}`, "_blank")
                      }
                    >
                      View
                    </button>
                    {role === "admin" && (
                      <button className="btn btn-sm btn-danger flex-grow-1" onClick={() => handleDeletePdf(pdf, type)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

  return (
    <div className="container mt-4">
      <h2>{dept.toUpperCase()} – Semester {sem}</h2>
      <h4 className="text-muted">Subject: {subjectName}</h4>
      <hr />

      {/* PDF Upload */}
      {role === "admin" && (
        <>
          <button className="btn btn-primary mb-3" onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? "Cancel" : "Add PDF"}
          </button>
          {showUpload && (
            <div className="card p-3 mb-4">
              <select className="form-select mb-2" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Select Material Type</option>
                <option value="pyqs">PYQs</option>
                <option value="midsem">Mid Sem</option>
                <option value="references">Reference</option>
              </select>
              <input type="file" accept="application/pdf" className="form-control mb-2" onChange={(e) => setPdfFile(e.target.files[0])} />
              <button className="btn btn-success" onClick={handleAdminUpload}>Upload PDF</button>
            </div>
          )}
        </>
      )}

      {role === "student" && (
        <>
          <button className="btn btn-primary mb-3" onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? "Cancel" : "Submit PDF for Approval"}
          </button>
          {showUpload && (
            <div className="card p-3 mb-4">
              <select className="form-select mb-2" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Select Material Type</option>
                <option value="pyqs">PYQs</option>
                <option value="midsem">Mid Sem</option>
                <option value="references">Reference</option>
              </select>
              <input type="file" accept="application/pdf" className="form-control mb-2" onChange={(e) => setPdfFile(e.target.files[0])} />
              <button className="btn btn-success" onClick={handleStudentUpload}>Submit PDF</button>
            </div>
          )}
        </>
      )}

      <h5>PYQs</h5>
      <hr />
      {renderPdfList(materials.pyqs, "pyqs")}
      <h5>Mid Sem</h5>
      <hr />
      {renderPdfList(materials.midsem, "midsem")}
      <h5>References</h5>
      <hr />
      {renderPdfList(materials.references, "references")}

      {/* WEB LINKS */}
      <h5>Materials on Web</h5>
      <hr />
      {role === "admin" && (
        <button className="btn btn-primary mb-3" onClick={() => setWebUpload(!webUpload)}>
          {webUpload ? "Cancel" : "Add Link"}
        </button>
      )}
      {webUpload && role === "admin" && (
        <div className="card p-3 mb-3">
          <input type="text" placeholder="Title" className="form-control mb-2" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
          <input type="text" placeholder="URL" className="form-control mb-2" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          <button className="btn btn-success" onClick={handleAddLink}>Add Link</button>
        </div>
      )}
      {webLinks.length === 0 ? <p className="text-muted">No links added yet</p> : (
        <ul className="list-group mb-4">
          {webLinks.map((link) => (
            <li key={link._id} className="list-group-item d-flex align-items-center" style={{ gap: "12px" }}>
              <div className="flex-grow-1 text-truncate"><strong>{link.title}</strong></div>
              <a href={link.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary px-3">Open</a>
              {role === "admin" && <button className="btn btn-sm btn-outline-danger px-3" onClick={() => handleDeleteLink(link._id)}>Delete</button>}
            </li>
          ))}
        </ul>
      )}

{/* PENDING LINKS */}
<h5>Pending & History of Link Requests</h5>
<hr />

{/* Student Request Form */}
{role === "student" && (
  <div className="card p-3 mb-3">
    <input
      type="text"
      placeholder="Title"
      className="form-control mb-2"
      value={requestTitle}
      onChange={(e) => setRequestTitle(e.target.value)}
    />

    <input
      type="url"
      placeholder="URL"
      className="form-control mb-2"
      value={requestUrl}
      onChange={(e) => setRequestUrl(e.target.value)}
    />

    <button
      className="btn btn-success"
      onClick={handleRequestLink}
    >
      Request Approval
    </button>
  </div>
)}

<hr />

{/* ADMIN VIEW → Pending Requests */}
    <ul className="list-group mb-4">
      {linkHistory.map((link) => (
        <li
          key={link._id}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{link.title}</strong>

            <span
              className={`badge ms-2 ${
                link.status === "pending"
                  ? "bg-warning"
                  : link.status === "approved"
                  ? "bg-success"
                  : "bg-danger"
              }`}
            >
              {link.status}
            </span>

<div className="text-muted small">
  Submitted on : {formatDate(link.createdAt)}
</div>


            {link.status === "rejected" && link.rejectionReason && (
              <div className="text-danger small">
                Reason: {link.rejectionReason}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>


    </div>
  );
};

export default SubjectPage;
