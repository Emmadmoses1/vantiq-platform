import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

const AdminLayout = () => (
  <div className="flex h-screen overflow-hidden" style={{ background: '#06080f' }}>
    <Sidebar />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      <Outlet />
    </motion.div>
  </div>
);

export default AdminLayout;
