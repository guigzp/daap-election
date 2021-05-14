import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

export default class Navigation extends React.Component {
  render() {
    return (
      <Navbar bg='dark' variant='dark'>
        <Navbar.Brand>dApp Vote</Navbar.Brand>
        <Nav className='mr-auto'>
          <Nav.Link href='/'>Votação</Nav.Link>
          <Nav.Link href='/results'>Resultado</Nav.Link>
          <Nav.Link href='/voters'>Eleitores</Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}
