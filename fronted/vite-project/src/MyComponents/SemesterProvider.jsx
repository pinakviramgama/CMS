import { createContext, useContext, useEffect, useState } from "react";

const SemesterContext = createContext();

export const useSemester = () => useContext(SemesterContext);

export const SemesterProvider = ({ children }) => {
  const [dept, setDept] = useState(localStorage.getItem("dept") || "cse");
  const [sem, setSem] = useState(Number(localStorage.getItem("sem")) || 1);
  const [role, setRole] = useState(localStorage.getItem("role") || "student");
  const [name, setName] = useState(localStorage.getItem("name") || "USER");

  // sync with localStorage whenever changed
  useEffect(() => {
    localStorage.setItem("dept", dept);
    localStorage.setItem("sem", sem);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name);
  }, [dept, sem, role, name]);

  return (
    <SemesterContext.Provider
      value={{ dept, setDept, sem, setSem, role, setRole, name, setName }}
    >
      {children}
    </SemesterContext.Provider>
  );
};
