import { createContext, useContext, useEffect, useState } from "react";

const SemesterContext = createContext();

export function SemesterProvider({ children }) {
  const [dept, setDept] = useState(localStorage.getItem("dept") || null);
  const [sem, setSem] = useState(localStorage.getItem("sem") || null);

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [name, setName] = useState(localStorage.getItem("name") || null);

  // Save dept/sem to localStorage
  useEffect(() => {
    if (dept) localStorage.setItem("dept", dept);
    if (sem) localStorage.setItem("sem", sem);
  }, [dept, sem]);

  return (
    <SemesterContext.Provider
      value={{
        dept,
        setDept,
        sem,
        setSem,
        token,
        setToken,
        name,
        setName,
      }}
    >
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemester() {
  return useContext(SemesterContext);
}
