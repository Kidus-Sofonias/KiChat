import React from 'react';


const Footer = () => {
  return (
    <footer className="footer bg-light text-center text-muted py-3">
      <div>&copy; {new Date().getFullYear()} KiChat. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
