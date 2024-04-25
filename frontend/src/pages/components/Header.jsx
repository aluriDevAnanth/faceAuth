import React, { useContext } from 'react'
import AuthCon from '../../context/AuthPro';
import Cookies from 'js-cookie'
import { Container, Nav, Navbar, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Header() {
  const { setAuth, setUser } = useContext(AuthCon);

  return (
    <div>
      <Navbar expand="lg" data-bs-theme="dark" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand href="#"><Link style={{ textDecoration: 'none', color: 'white' }} to='/'>Face Auth</Link></Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >
            </Nav>
            <Nav className='ms-auto'>
              <div className="dropdown dropstart">
                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Account Options
                </button>
                <ul className="dropdown-menu">
                  <li> <Link className='dropdown-item' to='/settings'>Settings</Link> </li>
                  <li><a className="dropdown-item" onClick={() => {
                    setAuth(null);
                    setUser(null);
                    localStorage.removeItem('dis');
                    Cookies.remove('token');
                  }}>LogOut  </a></li>
                </ul>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div >
  )
}
