import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SemesterContext = createContext();

export const SemesterProvider = ({ children }) => {
  const navigate = useNavigate();

  const [dept, setDept] = useState(localStorage.getItem("dept") || "");
  const [sem, setSem] = useState(localStorage.getItem("sem") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate async load or check for login
    const storedDept = localStorage.getItem("dept");
    const storedSem = localStorage.getItem("sem");

    if (storedDept && storedSem) {
      setDept(storedDept);
      setSem(storedSem);
    }
    setLoading(false);
  }, []);

  const setSemester = (department, semester) => {
    localStorage.setItem("dept", department);
    localStorage.setItem("sem", semester);
    setDept(department);
    setSem(semester);
  };

  const clearSemester = () => {
    localStorage.removeItem("dept");
    localStorage.removeItem("sem");
    setDept("");
    setSem("");
    navigate("/login");
  };

  return (
    <SemesterContext.Provider
      value={{ dept, sem, setSemester, clearSemester, loading }}
    >
      {children}
    </SemesterContext.Provider>
  );
};

export const useSemester = () => useContext(SemesterContext);
