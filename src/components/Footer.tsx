"use client";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-content-wrapper">
        {/* Navigation Links */}
        <nav className="footer-nav">
          <a href="#" className="footer-link">
            Home
          </a>
          <a href="#" className="footer-link">
            FAQs
          </a>
          <a href="#" className="footer-link">
            Testimonials
          </a>
          <a href="#" className="footer-link">
            Partners
          </a>
        </nav>

        {/* Social Media Icons */}
        <div className="footer-social">
          <a href="#" className="social-icon" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a href="#" className="social-icon" aria-label="LinkedIn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10V18M8 6V6.01M16 10V18M12 10V18M12 10C12 9.46957 12.2107 8.96086 12.5858 8.58579C12.9609 8.21071 13.4696 8 14 8C14.5304 8 15.0391 8.21071 15.4142 8.58579C15.7893 8.96086 16 9.46957 16 10V18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a href="#" className="social-icon" aria-label="Twitter">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.95791 14.8821 3.29451C14.0247 3.63111 13.2884 4.23141 12.773 5.01672C12.2575 5.80203 11.9877 6.73308 12 7.68V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Separator Line */}
        <div className="footer-divider"></div>

        {/* Copyright */}
        <p className="footer-copyright">Copyright StudentHub</p>
      </div>
    </footer>
  );
}
