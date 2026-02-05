import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignupGuard = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      toast.error("You are already logged in");
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  if (token) return null;

  return children;
};

export default SignupGuard;
