import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer>
      <div className="footer-left">Alpha v0.0.00001</div>
      <div className="footer-center">
        <a
          href="https://x.com/mrLumatic"
          target="_blank"
          rel="noopener noreferrer"
        >
          X-Twitter
        </a>{' '}
        <a
          href="https://www.linkedin.com/in/lukaszmatuszewski/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Linkedin
        </a>{' '}
        <a
          href="https://github.com/LucasMatuszewski/DEV-Games"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
      <div className="footer-right">
        &copy; {new Date().getFullYear()} Lucas Matuszewski
      </div>
    </footer>
  );
}

export default Footer;
