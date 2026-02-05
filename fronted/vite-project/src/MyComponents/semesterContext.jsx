import { createContext, useContext, useEffect, useState } from "react";

const SemesterContext = createContext();

export function SemesterProvider({ children }) {
  const [dept, setDept] = useState(null);
  const [sem, setSem] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [name, setName] = useState(localStorage.getItem("name"));
  const [loading, setLoading] = useState(true);

  // Restore dept/sem from localStorage if present
  useEffect(() => {
    const savedDept = localStorage.getItem("dept");
    const savedSem = localStorage.getItem("sem");
    if (savedDept && savedSem) {
      setDept(savedDept);
      setSem(parseInt(savedSem));
    }
    setLoading(false);
  }, []);

  // Sync token and name with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (name) localStorage.setItem("name", name);
    else localStorage.removeItem("name");
  }, [token, name]);

  // Optional: sync dept/sem to localStorage too
  useEffect(() => {
    if (dept) localStorage.setItem("dept", dept);
    else localStorage.removeItem("dept");

    if (sem) localStorage.setItem("sem", sem);
    else localStorage.removeItem("sem");
  }, [dept, sem]);

  return (
    <SemesterContext.Provider value={{ dept, setDept, sem, setSem, token, setToken, name, setName, loading }}>
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemester() {
  return useContext(SemesterContext);
}
