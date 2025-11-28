// src/components/Layout.js
import React from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useLocation} from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({children, theme='default'}) => {
  const location = useLocation();

  return (
    <div className={`layout theme-${theme}`}>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -10}}
          transition={{duration: 0.6, ease: 'easeInOut'}}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Layout;
