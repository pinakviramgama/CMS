import { Button, Container, Form, FormControl, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSemester } from "./semesterContext";
const Header = () => {
  const navigate = useNavigate();
  const { dept, sem, setToken, setName } = useSemester();

  const token = localStorage.getItem("token"); // use localStorage directly
  const name = localStorage.getItem("name");
const handleLogout = () => {
  localStorage.clear();   // remove token and name
  setToken(null);         // context token
  setName(null);          // context name
  setDept(null);          // optional: reset dept
  setSem(null);           // optional: reset sem
  navigate("/login");
};


  const currentDept = dept || "mechanical";
  const currentSem = sem || 2;

  return (
    <Navbar bg="light" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={`/dept/${currentDept}/sem/${currentSem}`}>CMS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={`/dept/${currentDept}/sem/${currentSem}`}>Home</Nav.Link>
            <NavDropdown title="Account" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to={`/dept/${currentDept}/sem/${currentSem}/profile`}>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item disabled>
                {token ? `Logged in as ${name?.toUpperCase()}` : "Not logged in"}
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <Form className="d-flex me-3">
            <FormControl type="search" name="search" placeholder="Search" className="me-2" />
            <Button variant="outline-success">Search</Button>
          </Form>

          {token ? (
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button variant="primary" onClick={() => navigate("/login")}>Login</Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
