    import { useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

    const Signup = () => {
      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [department, setDepartment] = useState("");
      const [semester, setSemester] = useState();
      const [loading, setLoading] = useState(false);

      const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !email || !password || !department || !semester) {
    toast.error("Please fill all fields!");
    return;
  }

  const semNumber = Number(semester);
  if (semNumber < 1 || semNumber > 7) {
    toast.error("Semester must be between 1 and 7!");
    return;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setLoading(true);

  try {
    // 1️⃣ SIGNUP
    const signupRes = await fetch(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          semester: semNumber,
        }),
      }
    );

    const signupData = await signupRes.json();

    if (!signupRes.ok) {
      toast.error(signupData.message || "Signup failed");
      return;
    }

    // 2️⃣ LOGIN
    const loginRes = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      toast.error(loginData.message || "Login failed");
      return;
    }

    // 🔥 THIS WAS MISSING
    localStorage.setItem("token", loginData.token);

    toast.success("Signup & login successful!");
    navigate(`/dept/${department}/sem/${semester}`);

  } catch (err) {
    console.error(err);
    toast.error("Server error");
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
                  <h2 className="mb-4 text-center">Sign Up</h2>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3 text-start">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Form.Group>

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

                    {/* Department Dropdown */}
                    <Form.Group className="mb-3 text-start">
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        >
                          <option value="">Select Department</option>
                          <option value="cse">Computer Engineering</option>
                          <option value="aids">AI & DS</option>
                          <option value="mechanical">Mechanical</option>
                          <option value="ec">EC</option>
                          <option value="ic">IC</option>
                          <option value="civil">Civil</option>
                          <option value="electrical">Electrical</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                      <Form.Label>Semeter</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter sem"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                      />
                    </Form.Group>
                    <Button type="submit" className="w-100" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Sign Up"}
                    </Button>

                    <p className="mt-2 text-center">
                                    Already have an account? <Link to="/login">Login to CMS</Link>
                                  </p>
                  </Form>
                </div>
              </Col>
            </Row>
          </Container>
        </>
      );
    };

    export default Signup;
