function AdminFooter() {
  return (
    <footer className="admin-footer">
      <div className="container">
        <div className="row gy-4">

          {/* BRAND */}
          <div className="col-lg-4 col-md-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="HireSmart Logo" style={{ height: '30px', width: 'auto' }} />
              <h6 className="footer-title" style={{ margin: 0 }}>
                HireSmart
              </h6>
            </div>
            <p className="footer-text">
              An AI-assisted platform designed to streamline internships,
              placements, recruiter management, and student career growth.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="col-lg-2 col-md-6">
            <h6 className="footer-title">Admin Links</h6>
            <ul className="footer-links">
              <li>Dashboard</li>
              <li>Manage Users</li>
              <li>Recruiters</li>
              <li>Jobs & Internships</li>
              <li>Reports</li>
            </ul>
          </div>

          {/* SYSTEM INFO */}
          <div className="col-lg-3 col-md-6">
            <h6 className="footer-title">System Info</h6>
            <ul className="footer-info">
              <li>⚙ MERN Stack</li>
              <li>🔐 JWT Authentication</li>
              <li>📊 Admin Analytics</li>
              <li>🤖 AI-Ready Architecture</li>
              <li>📦 Version 1.0</li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="col-lg-3 col-md-6">
            <h6 className="footer-title">Support</h6>
            <ul className="footer-info">
              <li>📧 admin@placement.ai</li>
              <li>📞 +91 98765 43210</li>
              <li>🏢 Admin Panel</li>
              <li>🕒 24/7 System Access</li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Smart Internship & Placement System
          </span>
          <span>
            Designed for Academic & Industry Use
          </span>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;
