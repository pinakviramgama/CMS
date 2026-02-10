import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PendingApprovals() {
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [pendingLinks, setPendingLinks] = useState([]);

  const token = localStorage.getItem("token");
  const [role, setRole] = useState(null);

   const API =import.meta.env.VITE_API_URL || "https://cms-4-74hb.onrender.com";

  const navigate = useNavigate();

  /* ========================= FETCH ROLE ========================= */
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return setRole("student");

      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setRole(data.user?.role || "student");
      } catch (err) {
        console.error(err);
        setRole("student");
      }
    };

    fetchMe();
  }, [token]);

  /* ========================= ADMIN ONLY ========================= */
  useEffect(() => {
    if (role && role !== "admin") {
      toast.error("Admin access only");
      navigate("/");
    }
  }, [role, navigate]);
/* ===================== FETCH PENDING MATERIALS ===================== */
const fetchPendingMaterials = async () => {
  try {
    const res = await fetch(`${API}/pending-materials`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    // ✅ Only keep pending ones
    const pendingOnly = (data || []).filter((item) => item.status === "pending");
    setPendingMaterials(pendingOnly);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch pending materials");
  }
};

/* ===================== FETCH PENDING LINKS ===================== */
const fetchPendingLinks = async () => {
  try {
    const res = await fetch(`${API}/pending-links`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const pendingOnly = (data || []).filter((item) => item.status === "pending");

    setPendingLinks(pendingOnly);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch pending links");
  }
};

  /* ===================== LOAD BOTH ===================== */
  useEffect(() => {
    if (role === "admin") {
      fetchPendingMaterials();
      fetchPendingLinks();
    }
  }, [role]);

  /* ===================== APPROVE / REJECT MATERIAL ===================== */
  const approveMaterial = async (id) => {
    try {
      const res = await fetch(
        `${API}/pending-materials/${id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Material approved!");
      setPendingMaterials((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };
const rejectMaterial = async (id) => {
  const reason = prompt("Reason for rejection?");
  if (!reason) return toast.warn("Reason required");

  try {
    const res = await fetch(`${API}/pending-materials/${id}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast.info("Material rejected");
    setPendingMaterials((prev) => prev.filter((p) => p._id !== id));
  } catch (err) {
    toast.error(err.message);
  }
};

  /* ===================== APPROVE / REJECT LINK ===================== */
  const approveLink = async (id) => {
    try {
      const res = await fetch(
        `${API}/pending-links/${id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Link approved!");
      setPendingLinks((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rejectLink = async (id) => {
    const reason = prompt("Reason for rejection?");
    if (!reason) return toast.warn("Reason required");

    try {
      const res = await fetch(
        `${API}/pending-links/${id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.info("Link rejected");
      setPendingLinks((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ===================== EMPTY CASE ===================== */
  if (
    pendingMaterials.length === 0 &&
    pendingLinks.length === 0
  ) {
    return (
      <p className="text-center mt-4">
        No pending materials or links 🎉
      </p>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Pending Approvals (PDF + Links)</h2>

      {/* ===================== PENDING MATERIALS ===================== */}
      <h4 className="mt-4">📌 Pending PDFs</h4>
      <div className="row">
        {pendingMaterials.map((item) => (
          <div key={item._id} className="col-md-4 mb-3">
            <div className="card shadow-sm p-3">
              <h6>{item.title}</h6>

              <p>
                <strong>Dept:</strong> {item.dept} |{" "}
                <strong>Sem:</strong> {item.sem}
              </p>

              <p><strong> Subject:</strong> {item.subject}</p>
              <p><strong> Type:</strong> {item.type}</p>
              <p><strong> Request by: </strong> {item?.uploadedBy?.name}</p>

              <a
                href={
                  item.fileUrl.startsWith("http")
                    ? item.fileUrl
                    : `${API}${item.fileUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-primary me-2"
              >
                View PDF
              </a>

              <button
                className="btn btn-sm btn-success me-2"
                onClick={() => approveMaterial(item._id)}
              >
                Approve
              </button>

              <button
                className="btn btn-sm btn-danger px-3"
                onClick={() => rejectMaterial(item._id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== PENDING LINKS ===================== */}
      <h4 className="mt-5">🔗 Pending Links</h4>
      <div className="row">
        {pendingLinks.map((link) => (
          <div key={link._id} className="col-md-4 mb-3">
            <div className="card shadow-sm p-3">
              <h6>{link.title}</h6>

              <p>
                <strong>Dept:</strong> {link.dept} |{" "}
                <strong>Sem:</strong> {link.sem}
              </p>

              <p>
                <strong>Subject:</strong> {link.subjectName}
              </p>

               <p>
                <strong>Request by :</strong> {link?.uploadedBy?.name}
              </p>

              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-primary me-2"
              >
                Open Link
              </a>

              <button
                className="btn btn-sm btn-success me-2"
                onClick={() => approveLink(link._id)}
              >
                Approve
              </button>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => rejectLink(link._id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingApprovals;
