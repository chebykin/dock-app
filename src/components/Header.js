import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand>Dock Demo App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav"/>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Link to="/credentials" className="nav-link">Credentials</Link>
          <Link to="/presentations" className="nav-link">Presentations</Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
