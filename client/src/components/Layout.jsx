// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => (
  <>
    <Navbar />
    <main className="pt-28 px-4 min-h-screen bg-white">
      <Outlet />
    </main>
  </>
);

export default Layout;
