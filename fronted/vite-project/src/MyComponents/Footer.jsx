import { Col, Container, Row } from "react-bootstrap";
import { FaInstagram, FaLinkedin } from "react-icons/fa"; // react-icons
import { Link } from "react-router-dom";

const Footer = () => {
  const originalSem = 1;

  const socialLinks = [
    { icon: <FaInstagram />, url: "https://www.instagram.com/syntaxwithsoul/" },
    { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/gecr-ai230200143075/" }
  ];

  return (
    <footer className="bg-dark text-light pt-4 pb-3">
      <Container>
        <Row>
          <Col md={3}>
            <h5>GTU Material</h5>
            <p className="small">
              Centralized platform for GTU students to access PYQs,
              mid-sem & end-sem papers department-wise and semester-wise.
            </p>
          </Col>

          <Col md={3}>
            <h5>Departments</h5>
            {["cse","aids","ec","ic","civil","electrical","mechanical"].map((d) => (
              <div key={d}>
                <Link
                  to={`/dept/${d}/sem/${originalSem}`}
                  className="text-light text-decoration-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {d.toUpperCase()}
                </Link>
              </div>
            ))}
          </Col>

          <Col md={3}>
            <h5>Quick Links</h5>
            <div>
              <Link
                to={`/dept/${originalSem}`}
                className="text-light text-decoration-none"
                onClick={(e) => e.stopPropagation()}
              >
                Home
              </Link>
            </div>
            <div><Link to="/pyqs" className="text-light text-decoration-none">PYQs</Link></div>
            <div><Link to="/midsem" className="text-light text-decoration-none">Mid-Sem</Link></div>
            <div><Link to="/endsem" className="text-light text-decoration-none">End-Sem</Link></div>
          </Col>

          <Col md={3}>
            <h5>Connect with Us</h5>
            <div className="d-flex gap-3 mt-2">
              {socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light fs-4"
                  style={{ transition: "transform 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </Col>
        </Row>

        <hr className="border-secondary" />
        <div className="text-center small">
          © {new Date().getFullYear()} GTU Material. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
