import { createContext, useContext, useState } from "react";

const SemesterContext = createContext();

export const SemesterProvider = ({ children }) => {
  // Original user info from login (never change)
  const [originalDept] = useState(localStorage.getItem("dept"));
  const [originalSem] = useState(parseInt(localStorage.getItem("sem"), 10));
  const [name] = useState(localStorage.getItem("name"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Currently viewed dept/sem (can change for navigation)
  const [dept, setDept] = useState(originalDept);
  const [sem, setSem] = useState(originalSem);

  return (
    <SemesterContext.Provider
      value={{
        dept,
        sem,
        setDept,
        setSem,
        name,
        token,
        setToken,
        originalDept,
        originalSem
      }}
    >
      {children}
    </SemesterContext.Provider>
  );
};

export const useSemester = () => useContext(SemesterContext);
