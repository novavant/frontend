// pages/user-info.js
import { useEffect } from 'react';
import Head from 'next/head';
import { useUser } from '../contexts/UserContext';
import withAuth from '../utils/withAuth';

function UserInfoPage() {
  const { user, loading, error, refreshUser } = useUser();

  // Auto-refresh handled globally in UserContext; keep manual refresh button.

  return (
    <div className="container">
      <Head>
        <title>User Information</title>
        <meta name="description" content="User information with auto-refresh" />
      </Head>

      <div className="card">
        <h1>User Information</h1>
        <p className="subtitle">Auto-refreshes every 10 seconds</p>

        {loading && <div className="loading">Loading user information...</div>}
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={refreshUser} className="btn">Retry</button>
          </div>
        )}

        {user && (
          <div className="user-info">
            <div className="info-row">
              <span className="label">ID:</span>
              <span className="value">{user.id}</span>
            </div>
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{user.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Phone Number:</span>
              <span className="value">{user.number}</span>
            </div>
            <div className="last-updated">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}

        <button onClick={refreshUser} className="btn refresh-btn">
          Refresh Now
        </button>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 30px;
          width: 100%;
          max-width: 500px;
        }
        
        h1 {
          color: #2c3e50;
          margin-top: 0;
          text-align: center;
        }
        
        .subtitle {
          color: #7f8c8d;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .loading {
          text-align: center;
          color: #3498db;
          font-style: italic;
        }
        
        .error {
          background: #ffecec;
          border: 1px solid #ff6b6b;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          color: #e74c3c;
        }
        
        .user-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .label {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .value {
          color: #34495e;
        }
        
        .last-updated {
          text-align: center;
          margin-top: 15px;
          font-size: 0.9em;
          color: #7f8c8d;
          font-style: italic;
        }
        
        .btn {
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 20px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.3s;
          width: 100%;
        }
        
        .btn:hover {
          background: #2980b9;
        }
        
        .refresh-btn {
          background: #2ecc71;
        }
        
        .refresh-btn:hover {
          background: #27ae60;
        }
      `}</style>
    </div>
  );
}

export default withAuth(UserInfoPage);