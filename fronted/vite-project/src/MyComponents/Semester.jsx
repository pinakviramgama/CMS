import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSemester } from "./semesterContext";

const allowedDepts = ["cse", "aids", "ec", "ic", "civil", "electrical", "mechanical"];

const SemesterPage = () => {
  const navigate = useNavigate();
  const { dept: contextDept, sem: contextSem, setDept, setSem } = useSemester();
  const { dept: paramDept, sem: paramSem } = useParams();

  const dept = paramDept;
  const sem = Number(paramSem);

  const token = localStorage.getItem("token");

  const [role, setRole] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [loadingSubject, setLoadingSubject] = useState(false);

  if (!allowedDepts.includes(dept)) {
    toast.error("Invalid department");
    navigate("/not-found");
    return null;
  }

  // Fetch user role
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchRole = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();
        setRole(data.user.role);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user info");
      }
    };

    fetchRole();
  }, [token, navigate]);

  // Fetch subjects
  useEffect(() => {
    if (!token) return;

    const fetchSubjects = async () => {
      try {
        const res = await fetch(`http://localhost:3000/admin/dept/${dept}/sem/${sem}/get-subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 404) setSubjects([]);
          else throw new Error("Failed to fetch subjects");
          return;
        }
        const data = await res.json();
        setSubjects(data.subjects || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch subjects");
      }
    };

    fetchSubjects();
  }, [dept, sem, token]);

  // Add subject
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return toast.error("Subject name cannot be empty");
    if (!token) return toast.error("Not logged in");

    setLoadingSubject(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/dept/${dept}/sem/${sem}/add-subject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: subjectName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add subject");
      toast.success("Subject added successfully");
      setSubjectName("");
      setShowForm(false);

      // Refresh subjects
      const subjectsRes = await fetch(`http://localhost:3000/admin/dept/${dept}/sem/${sem}/get-subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData.subjects || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add subject");
    } finally {
      setLoadingSubject(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">{dept.toUpperCase()} – Semester {sem}</h2>
      <hr />

      {role === "admin" && (
        <button className="btn btn-primary mb-3" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Subject"}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAddSubject} className="mb-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Enter subject name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
          <button className="btn btn-success" disabled={loadingSubject}>
            {loadingSubject ? "Saving..." : "Save Subject"}
          </button>
        </form>
      )}

      <h4 className="mb-3">Subjects</h4>
      {subjects.length === 0 ? (
        <p className="text-muted">No subjects added yet.</p>
      ) : (
        <div className="row">
          {subjects.map((sub, idx) => {
            const name = sub.name || sub;
            return (
              <div className="col-sm-6 col-md-4 mb-3" key={sub._id || name || idx}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{name}</h5>
                    <p className="card-text text-muted">{dept.toUpperCase()} • Semester {sem}</p>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => navigate(`/admin/${dept}/sem/${sem}/subject/${encodeURIComponent(name)}`)}
                    >
                      Open Subject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SemesterPage;
