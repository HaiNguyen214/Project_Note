
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Settings from './Settings';
import Notes from './Notes';          // Nếu đã tạo Notes.jsx ở Sprint 2
import PrivateNotes from './PrivateNotes'; // Nếu đã tạo PrivateNotes.jsx ở Sprint 3

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Thanh điều hướng (Header/Sidebar) */}
        <nav style={{
          display: 'flex',
          gap: '20px',
          padding: '15px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>📝 Ghi chú công khai</Link>
          <Link to="/private" style={{ color: '#fff', textDecoration: 'none' }}>🔒 Ghi chú riêng tư</Link>
          <Link to="/settings" style={{ color: '#fff', textDecoration: 'none' }}>⚙️ Cài đặt</Link>
        </nav>

        {/* Nội dung các trang */}
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Notes />} />
            <Route path="/private" element={<PrivateNotes />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;