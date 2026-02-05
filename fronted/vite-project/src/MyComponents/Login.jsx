import { useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSemester } from "./semesterContext"; // ✅ Import context
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Destructure only what exists in your context
  const { setDept, setSem, setToken, setName } = useSemester();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful!");

        // ✅ Save to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.name);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("dept", data.department);
        localStorage.setItem("sem", data.sem);
        localStorage.setItem("role", data.role);

        // ✅ Update context
        setToken && setToken(data.token);
        setName && setName(data.name);
        setDept && setDept(data.department);
        setSem && setSem(data.sem);

        // ✅ Navigate to semester page
        toast.success("Login Successful")
        navigate(`/dept/${data.department}/sem/${data.sem}`);
      } else {
        toast.error(data.message || "Login failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error! Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Container className="mt-5">
        <Row className="justify-content-md-center">
          <Col md={6}>
            <div className="card p-4 shadow">
              <h2 className="mb-4 text-center">Login</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : "Login"}
                </Button>

                <p className="mt-2 text-center">
                Don't have an account? <Link to="/signup">Register Now to CMS</Link>
              </p>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Login;
