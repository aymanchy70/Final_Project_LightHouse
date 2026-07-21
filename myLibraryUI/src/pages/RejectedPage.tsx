import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import useAuth from '../hooks/useAuth';
import { applyMembershipApi, getMembershipTypesLocal } from '../api/memberApi';
import { useNavigate } from 'react-router-dom';

const C = { bg: '#F9F6F0', primary: '#C0392B', dark: '#2C3E50', muted: '#95A5A6', border: '#E8DCD0' };

const RejectedPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { checkMemberStatus } = useAuth();
  const [reapplying, setReapplying] = useState<boolean>(false);
  const [error,      setError]      = useState<string>('');

  const handleReapply = async (): Promise<void> => {
    setReapplying(true);
    setError('');
    try {
      const types = getMembershipTypesLocal();
      await applyMembershipApi({ membershipTypeId: types[0].id, fullName: 'Reapplication' });
      await checkMemberStatus();
      navigate('/dashboard');
    } catch {
      setError('Reapplication failed. Please try again.');
    } finally {
      setReapplying(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div style={{
          background: 'white', border: `1px solid ${C.border}`,
          borderRadius: '16px', padding: '48px 40px',
          maxWidth: '520px', width: '100%', textAlign: 'center',
          boxShadow: '0 4px 20px rgba(44,62,80,0.08)',
        }}>
          {/* Icon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(192,57,43,0.08)', border: `2px solid rgba(192,57,43,0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', margin: '0 auto 24px',
          }}>❌</div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: C.dark, margin: '0 0 12px' }}>
            Application Not Approved
          </h1>
          <p style={{ fontSize: '0.95rem', color: C.muted, margin: '0 0 8px', lineHeight: 1.7 }}>
            Unfortunately, your membership application was not approved this time.
          </p>
          <p style={{ fontSize: '0.9rem', color: C.muted, margin: '0 0 32px', lineHeight: 1.7 }}>
            This may be due to incomplete information or eligibility criteria. You are welcome to reapply with updated details.
          </p>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)',
            borderRadius: '20px', padding: '8px 20px', marginBottom: '32px',
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: C.primary }}>Application Rejected</span>
          </div>

          {error && (
            <p style={{ fontSize: '0.85rem', color: C.primary, marginBottom: '16px' }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleReapply}
              disabled={reapplying}
              style={{
                padding: '10px 24px', borderRadius: '8px',
                background: C.primary, color: 'white',
                border: 'none', fontSize: '0.875rem', fontWeight: 600,
                cursor: reapplying ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: reapplying ? 0.7 : 1,
              }}
            >{reapplying ? 'Submitting…' : 'Reapply for Membership'}</button>

            <a href="/" style={{
              padding: '10px 24px', borderRadius: '8px',
              background: 'transparent', color: C.dark,
              border: `1px solid ${C.border}`, fontSize: '0.875rem',
              fontWeight: 600, textDecoration: 'none',
            }}>Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectedPage;
