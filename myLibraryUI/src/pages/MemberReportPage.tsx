import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  getMemberStatusApi,
  getMyBorrowingsApi,
  getMyReservationsApi,
  getPaymentsByMemberApi,
  type BorrowingDto,
  type ReservationDto,
  type PaymentDto,
} from '../api/memberApi';
import type { MemberResponseDto } from '../types/member.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const fmtMoney = (n?: number | null): string =>
  n != null ? n.toFixed(2) : '0.00';

const now = (): string =>
  new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ─── Status color ─────────────────────────────────────────────────────────────
const statusColor = (s: string): string => {
  if (s === 'Overdue' || s === 'Rejected')  return '#C0392B';
  if (s === 'Returned' || s === 'Fulfilled') return '#27ae60';
  if (s === 'Pending' || s === 'PendingApproval') return '#d4ac0d';
  return '#2980b9';
};

// ─── Component ────────────────────────────────────────────────────────────────
const MemberReportPage = (): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [member,      setMember]      = useState<MemberResponseDto | null>(null);
  const [borrowings,  setBorrowings]  = useState<BorrowingDto[]>([]);
  const [reservations,setReservations]= useState<ReservationDto[]>([]);
  const [payments,    setPayments]    = useState<PaymentDto[]>([]);
  const [loading,     setLoading]     = useState<boolean>(true);
  const [error,       setError]       = useState<string>('');
  const [generatedAt] = useState<string>(now());

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }

    const fetchAll = async (): Promise<void> => {
      try {
        const memberData = await getMemberStatusApi();
        setMember(memberData);

        const [borrows, reservs, pays] = await Promise.all([
          getMyBorrowingsApi(),
          getMyReservationsApi(),
          memberData.memberId ? getPaymentsByMemberApi(memberData.memberId) : Promise.resolve([]),
        ]);

        setBorrowings(borrows);
        setReservations(reservs);
        setPayments(pays);
      } catch {
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isAuthenticated, navigate]);

  // ── Print handler ───────────────────────────────────────────────────────────
  const handlePrint = (): void => window.print();

  // ── Computed values ─────────────────────────────────────────────────────────
  const activeBorrowings   = borrowings.filter(b => b.status === 'Borrowed').length;
  const overdueBorrowings  = borrowings.filter(b => b.status === 'Overdue').length;
  const returnedBorrowings = borrowings.filter(b => b.status === 'Returned').length;

  const pendingRes   = reservations.filter(r => r.status === 'Pending').length;
  const fulfilledRes = reservations.filter(r => r.status === 'Fulfilled').length;

  const totalPaid    = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const outstanding  = member?.outstandingFine ?? 0;

  // ── Styles (document look) ──────────────────────────────────────────────────
  const S = {
    page: {
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: '13px',
      color: '#111',
      lineHeight: 1.5,
    } as React.CSSProperties,

    sectionHeader: {
      background: '#2C3E50', color: 'white',
      padding: '5px 10px', fontWeight: 'bold',
      fontSize: '12px', letterSpacing: '0.04em',
    } as React.CSSProperties,

    table: {
      width: '100%', borderCollapse: 'collapse' as const,
      fontSize: '12px', marginBottom: '16px',
      fontFamily: 'Arial, sans-serif',
    } as React.CSSProperties,

    th: {
      padding: '5px 8px', border: '1px solid #ccc',
      background: '#f0f0f0', fontWeight: 'bold',
      color: '#333', textAlign: 'left' as const,
    } as React.CSSProperties,

    td: {
      padding: '5px 8px', border: '1px solid #ccc', color: '#222',
    } as React.CSSProperties,

    tdAlt: {
      padding: '5px 8px', border: '1px solid #ccc',
      color: '#222', background: '#fafafa',
    } as React.CSSProperties,

    tdTotal: {
      padding: '5px 10px', border: '1px solid #ccc',
      background: '#f5f5f5', fontWeight: 'bold', color: '#333',
      textAlign: 'right' as const,
    } as React.CSSProperties,
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #C0392B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#95A5A6', fontFamily: 'Arial, sans-serif' }}>Loading report data…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</p>
        <p style={{ color: '#C0392B', fontWeight: 600 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '8px', background: '#2C3E50', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#e0e0e0', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>

      {/* ── Print styles ─────────────────────────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body * { visibility: hidden !important; }
          #report-printable, #report-printable * { visibility: visible !important; }
          #report-printable { position: absolute; left: 0; top: 0; width: 100%; }
          #report-toolbar { display: none !important; }
        }
      `}</style>

      {/* ── Toolbar (hidden on print) ─────────────────── */}
      <div id="report-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px', maxWidth: '760px', margin: '0 auto 16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '13px' }}
        >← Back</button>
        <button
          onClick={handlePrint}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '13px' }}
        >🖨️ Print</button>
        <button
          onClick={handlePrint}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', background: '#C0392B', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
        >📄 Save as PDF</button>
      </div>

      {/* ── A4 Document ─────────────────────────────── */}
      <div
        id="report-printable"
        ref={printRef}
        style={{
          ...S.page,
          background: 'white',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '40px 48px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}
      >
        {/* ── HEADER ───────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #2C3E50', paddingBottom: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: '#2C3E50', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '22px' }}>📚</span>
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C3E50', margin: '0 0 2px' }}>Lighthouse </p>
              <p style={{ fontSize: '11px', color: '#666', margin: 0, fontFamily: 'Arial, sans-serif' }}>Dhaka, Bangladesh &nbsp;|&nbsp; lighthouse@library.gov.bd</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
            <p style={{ fontSize: '10px', color: '#888', margin: '0 0 2px' }}>Generated on</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#2C3E50', margin: '0 0 6px' }}>{generatedAt}</p>
            <p style={{ fontSize: '10px', color: '#888', margin: '0 0 2px' }}>Report ID</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#2C3E50', margin: 0 }}>
              RPT-{member?.memberId ?? '000'}-{new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2C3E50', margin: 0 }}>
            Member Activity Report
          </p>
        </div>

        {/* ── MEMBER INFO ───────────────────────────── */}
        <div style={{ border: '1px solid #ccc', marginBottom: '16px' }}>
          <div style={S.sectionHeader}>MEMBER INFORMATION</div>
          <table style={{ ...S.table, marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ ...S.td, color: '#555', width: '18%' }}>Name</td>
                <td style={{ ...S.td, fontWeight: 'bold', width: '32%' }}>{member?.fullName || '—'}</td>
                <td style={{ ...S.td, color: '#555', width: '18%' }}>Member ID</td>
                <td style={{ ...S.td, fontWeight: 'bold', width: '32%' }}>MBR-{member?.memberId ?? '—'}</td>
              </tr>
              <tr>
                <td style={{ ...S.tdAlt, color: '#555' }}>Membership</td>
                <td style={S.tdAlt}>{member?.membershipTypeName || '—'}</td>
                <td style={{ ...S.tdAlt, color: '#555' }}>Status</td>
                <td style={{ ...S.tdAlt, fontWeight: 'bold', color: statusColor(member?.membershipStatus ?? '') }}>
                  {member?.membershipStatus || '—'}
                </td>
              </tr>
              <tr>
                <td style={{ ...S.td, color: '#555' }}>Phone</td>
                <td style={S.td}>{member?.phone || '—'}</td>
                <td style={{ ...S.td, color: '#555' }}>Member Since</td>
                <td style={S.td}>{fmt(member?.membershipStartDate)}</td>
              </tr>
              <tr>
                <td style={{ ...S.tdAlt, color: '#555' }}>Address</td>
                <td style={S.tdAlt}>{member?.address || '—'}</td>
                <td style={{ ...S.tdAlt, color: '#555' }}>Expiry Date</td>
                <td style={S.tdAlt}>{fmt(member?.membershipExpiryDate) || 'No expiry'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── SUMMARY TABLE ─────────────────────────── */}
        <div style={{ border: '1px solid #ccc', marginBottom: '16px' }}>
          <div style={S.sectionHeader}>ACTIVITY SUMMARY</div>
          <table style={{ ...S.table, marginBottom: 0 }}>
            <thead>
              <tr>
                {['Category', 'Total', 'Active / Pending', 'Completed', 'Overdue / Due'].map(h => (
                  <th key={h} style={{ ...S.th, textAlign: 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...S.td, fontWeight: 'bold' }}>Borrowings</td>
                <td style={{ ...S.td, textAlign: 'center', fontWeight: 'bold' }}>{borrowings.length}</td>
                <td style={{ ...S.td, textAlign: 'center', color: '#2980b9', fontWeight: 'bold' }}>{activeBorrowings}</td>
                <td style={{ ...S.td, textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>{returnedBorrowings}</td>
                <td style={{ ...S.td, textAlign: 'center', color: '#C0392B', fontWeight: 'bold' }}>{overdueBorrowings}</td>
              </tr>
              <tr>
                <td style={{ ...S.tdAlt, fontWeight: 'bold' }}>Reservations</td>
                <td style={{ ...S.tdAlt, textAlign: 'center', fontWeight: 'bold' }}>{reservations.length}</td>
                <td style={{ ...S.tdAlt, textAlign: 'center', color: '#d4ac0d', fontWeight: 'bold' }}>{pendingRes}</td>
                <td style={{ ...S.tdAlt, textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>{fulfilledRes}</td>
                <td style={{ ...S.tdAlt, textAlign: 'center', color: '#999' }}>—</td>
              </tr>
              <tr>
                <td style={{ ...S.td, fontWeight: 'bold' }}>Fines & Payments</td>
                <td style={{ ...S.td, textAlign: 'center', fontWeight: 'bold' }}>{payments.length} txn</td>
                <td style={{ ...S.td, textAlign: 'center', color: '#999' }}>—</td>
                <td style={{ ...S.td, textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>৳{fmtMoney(totalPaid)}</td>
                <td style={{ ...S.td, textAlign: 'center', color: outstanding > 0 ? '#C0392B' : '#27ae60', fontWeight: 'bold' }}>
                  ৳{fmtMoney(outstanding)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── BORROWINGS ────────────────────────────── */}
        <div style={{ border: '1px solid #ccc', marginBottom: '16px' }}>
          <div style={S.sectionHeader}>BORROWING DETAILS</div>
          <table style={{ ...S.table, marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ ...S.th, textAlign: 'center', width: '5%' }}>SL</th>
                <th style={{ ...S.th, width: '30%' }}>Book Title</th>
                <th style={{ ...S.th, textAlign: 'center', width: '13%' }}>Barcode</th>
                <th style={{ ...S.th, textAlign: 'center', width: '16%' }}>Issue Date</th>
                <th style={{ ...S.th, textAlign: 'center', width: '16%' }}>Due Date</th>
                <th style={{ ...S.th, textAlign: 'center', width: '10%' }}>Fine (৳)</th>
                <th style={{ ...S.th, textAlign: 'center', width: '10%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {borrowings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#999', fontStyle: 'italic' }}>No borrowing records found.</td>
                </tr>
              ) : borrowings.map((b, i) => {
                const row = i % 2 === 0 ? S.td : S.tdAlt;
                return (
                  <tr key={b.borrowingId}>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{i + 1}</td>
                    <td style={{ ...row, overflow: 'hidden', maxWidth: '180px' }}>{b.bookTitle || '—'}</td>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{b.barcode || '—'}</td>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{fmt(b.issueDate)}</td>
                    <td style={{ ...row, textAlign: 'center', color: b.status === 'Overdue' ? '#C0392B' : '#555', fontWeight: b.status === 'Overdue' ? 'bold' : 'normal' }}>
                      {fmt(b.dueDate)}
                    </td>
                    <td style={{ ...row, textAlign: 'center', color: (b.fineAmount ?? 0) > 0 ? '#C0392B' : '#555' }}>
                      {(b.fineAmount ?? 0) > 0 ? fmtMoney(b.fineAmount) : '—'}
                    </td>
                    <td style={{ ...row, textAlign: 'center', fontWeight: 'bold', color: statusColor(b.status) }}>
                      {b.status}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={6} style={S.tdTotal}>Total Borrowings :</td>
                <td style={{ ...S.td, background: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', color: '#2C3E50' }}>
                  {borrowings.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── RESERVATIONS ──────────────────────────── */}
        <div style={{ border: '1px solid #ccc', marginBottom: '16px' }}>
          <div style={S.sectionHeader}>RESERVATION DETAILS</div>
          <table style={{ ...S.table, marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ ...S.th, textAlign: 'center', width: '6%' }}>SL</th>
                <th style={{ ...S.th, width: '44%' }}>Book Title</th>
                <th style={{ ...S.th, textAlign: 'center', width: '20%' }}>Reserved On</th>
                <th style={{ ...S.th, textAlign: 'center', width: '15%' }}>Fulfilled On</th>
                <th style={{ ...S.th, textAlign: 'center', width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#999', fontStyle: 'italic' }}>No reservation records found.</td>
                </tr>
              ) : reservations.map((r, i) => {
                const row = i % 2 === 0 ? S.td : S.tdAlt;
                return (
                  <tr key={r.reservationId}>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{i + 1}</td>
                    <td style={row}>{r.bookTitle || '—'}{r.edition ? ` (${r.edition})` : ''}</td>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{fmt(r.reservationDate)}</td>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{fmt(r.fulfilledAt)}</td>
                    <td style={{ ...row, textAlign: 'center', fontWeight: 'bold', color: statusColor(r.status) }}>
                      {r.status}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={4} style={S.tdTotal}>Total Reservations :</td>
                <td style={{ ...S.td, background: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', color: '#2C3E50' }}>
                  {reservations.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── FINES & PAYMENTS ──────────────────────── */}
        <div style={{ border: '1px solid #ccc', marginBottom: '20px' }}>
          <div style={S.sectionHeader}>FINE & PAYMENT HISTORY</div>
          <table style={{ ...S.table, marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ ...S.th, textAlign: 'center', width: '6%' }}>SL</th>
                <th style={{ ...S.th, width: '22%' }}>Date</th>
                <th style={{ ...S.th, width: '36%' }}>Description</th>
                <th style={{ ...S.th, textAlign: 'center', width: '18%' }}>Method</th>
                <th style={{ ...S.th, textAlign: 'right', width: '18%' }}>Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#999', fontStyle: 'italic' }}>No payment records found.</td>
                </tr>
              ) : payments.map((p, i) => {
                const row = i % 2 === 0 ? S.td : S.tdAlt;
                return (
                  <tr key={p.paymentId}>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{i + 1}</td>
                    <td style={{ ...row, color: '#555' }}>{fmt(p.paymentDate)}</td>
                    <td style={row}>{p.paymentType}{p.notes ? ` — ${p.notes}` : ''}</td>
                    <td style={{ ...row, textAlign: 'center', color: '#555' }}>{p.paymentMethod}</td>
                    <td style={{ ...row, textAlign: 'right', fontWeight: 'bold', color: '#27ae60' }}>
                      {fmtMoney(p.amount)}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={4} style={S.tdTotal}>Total Paid :</td>
                <td style={{ ...S.td, background: '#f5f5f5', textAlign: 'right', fontWeight: 'bold', color: '#27ae60' }}>
                  {fmtMoney(totalPaid)}
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ ...S.tdTotal, background: outstanding > 0 ? '#fef5f5' : '#f5fef5' }}>
                  Outstanding Fine :
                </td>
                <td style={{ ...S.td, background: outstanding > 0 ? '#fef5f5' : '#f5fef5', textAlign: 'right', fontWeight: 'bold', color: outstanding > 0 ? '#C0392B' : '#27ae60' }}>
                  {fmtMoney(outstanding)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── NOTE ─────────────────────────────────── */}
        <div style={{ border: '1px solid #ddd', padding: '8px 12px', marginBottom: '20px', background: '#fffdf9', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#555', fontStyle: 'italic' }}>
          This report is auto-generated by the LIGHTHOUSE Library Management System. For any discrepancy, please contact the library desk.
        </div>

        {/* ── FOOTER ───────────────────────────────── */}
        <div style={{ borderTop: '2px solid #2C3E50', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'Arial, sans-serif' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#2C3E50', margin: '0 0 2px' }}>Lighthouse Library</p>
            <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>Dhaka, Bangladesh</p>
            <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>lighthouse@library.gov.bd</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>Page 1 of 1</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ height: '28px', borderBottom: '1px solid #555', width: '130px', marginLeft: 'auto', marginBottom: '4px' }} />
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#555', margin: 0 }}>Authorized Officer</p>
            <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>Lighthouse Library</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberReportPage;
