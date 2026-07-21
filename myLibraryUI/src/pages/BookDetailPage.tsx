import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import {
  getBookByIdApi,
  getBookEditionsByBookApi,
  getPhysicalCopiesByEditionApi,
  getDigitalCopyByEditionApi,
  borrowBookApi,
} from '../api/bookApi';
import {
  reserveBookApi,
  borrowDigitalBookApi,
  getMyActiveBorrowedBookIdsApi,
} from '../api/memberApi';
import {
  getCachedActiveIds,
  setCachedActiveIds,
} from '../utils/borrowCache';

interface EditionInfo {
  bookEditionId: number;
  edition: string;
  isbn: string;
  publicationYear?: number;
  language?: string;
  pageCount?: number;
  coverType?: string;
  coverImageUrl?: string;
  price?: number;
  availableCopies: number;
  copies: any[];
  digitalCopy: any | null;
}

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isMember } = useAuth();

  const [book, setBook] = useState<any>(null);
  const [editions, setEditions] = useState<EditionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [showBorrowOptions, setShowBorrowOptions] = useState(false);
  const [isAlreadyRequested, setIsAlreadyRequested] = useState(false);

  const [previewEditionId, setPreviewEditionId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const bookId = parseInt(id, 10);

    (async () => {
      setLoading(true);
      try {
        const [bookData, editionsData] = await Promise.all([
          getBookByIdApi(bookId),
          getBookEditionsByBookApi(bookId),
        ]);
        setBook(bookData);

        const editionsWithDetails = await Promise.all(
          editionsData.map(async (ed: any) => {
            const copies = await getPhysicalCopiesByEditionApi(ed.bookEditionId);
            const available = copies.filter((c: any) => c.status === 'Available').length;
            let digitalCopy = null;
            try { digitalCopy = await getDigitalCopyByEditionApi(ed.bookEditionId); } catch {}
            return {
              bookEditionId: ed.bookEditionId,
              edition: ed.edition,
              isbn: ed.isbn,
              publicationYear: ed.publicationYear,
              language: ed.language,
              pageCount: ed.pageCount,
              coverType: ed.coverType,
              coverImageUrl: ed.coverImageUrl,
              price: ed.price,
              availableCopies: available,
              copies,
              digitalCopy,
            };
          })
        );
        setEditions(editionsWithDetails);

        // Check active status: first from cache, then from API
        const cachedIds = getCachedActiveIds();
        if (cachedIds.has(bookData.bookId)) {
          setIsAlreadyRequested(true);
        } else if (isAuthenticated && isMember) {
          try {
            const ids = await getMyActiveBorrowedBookIdsApi();
            setIsAlreadyRequested(ids.includes(bookData.bookId));
          } catch {}
        }
      } catch (err: any) {
        setError('Failed to load book details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated, isMember]);

  const hasPhysicalCopies = editions.some(e => e.availableCopies > 0);
  const hasDigitalCopies = editions.some(e => e.digitalCopy != null);

  const handleBorrowClick = () => {
    if (!isAuthenticated) { navigate('/login?redirect=/books/' + id); return; }
    if (!isMember) { navigate('/membership'); return; }

    if (hasPhysicalCopies && hasDigitalCopies) {
      setShowBorrowOptions(true);
    } else if (hasPhysicalCopies) {
      handleBorrowPhysical();
    } else if (hasDigitalCopies) {
      handleBorrowDigital();
    }
  };

  const handleBorrowPhysical = async () => {
    setShowBorrowOptions(false);
    setBorrowLoading(true);
    try {
      let copyId: number | null = null;
      for (const edition of editions) {
        const available = edition.copies.find((c: any) => c.status === 'Available');
        if (available) { copyId = available.physicalCopyId; break; }
      }
      if (!copyId) { toast.error('No physical copies available.'); return; }
      await borrowBookApi(copyId);
      toast.success('Book requested! Pending admin approval.');
      const bookId = parseInt(id!);
      const ids = getCachedActiveIds();
      ids.add(bookId);
      setCachedActiveIds(ids);
      setIsAlreadyRequested(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.title || 'Failed to borrow.');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleBorrowDigital = async () => {
    setShowBorrowOptions(false);
    setBorrowLoading(true);
    try {
      let digitalCopyId: number | null = null;
      for (const edition of editions) {
        if (edition.digitalCopy) {
          digitalCopyId = edition.digitalCopy.digitalCopyId;
          break;
        }
      }
      if (!digitalCopyId) { toast.error('No digital copy available.'); return; }
      await borrowDigitalBookApi(digitalCopyId);
      toast.success('PDF copy requested! Pending admin approval.');
      const bookId = parseInt(id!);
      const ids = getCachedActiveIds();
      ids.add(bookId);
      setCachedActiveIds(ids);
      setIsAlreadyRequested(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.title || 'Failed to borrow PDF.');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleReserve = async (editionId: number) => {
    if (!isAuthenticated) { navigate('/login?redirect=/books/' + id); return; }
    if (!isMember) { navigate('/membership'); return; }

    setBorrowLoading(true);
    try {
      await reserveBookApi(editionId);
      toast.success('Reservation placed!');
    } catch (err: any) {
      toast.error(err?.response?.data?.title || 'Failed to reserve.');
    } finally {
      setBorrowLoading(false);
    }
  };

  const openPreviewModal = (editionId: number) => {
    setPreviewEditionId(editionId);
    setShowModal(true);
  };
  const closePreviewModal = () => { setShowModal(false); setPreviewEditionId(null); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F6F0' }}>
        <p className="text-lg" style={{ color: '#7F8C8D' }}>Loading book details…</p>
      </div>
    );
  }
  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F6F0' }}>
        <p className="text-red-500 text-lg">{error || 'Book not found.'}</p>
      </div>
    );
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200';
  const coverUrl = book.coverImageUrl ? `${API_BASE}${book.coverImageUrl}` : null;

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    border: '1px solid #E8DCD0',
    marginBottom: '24px',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: '#E6F2F2',
    color: '#006D6F',
    border: '1px solid #B8D8D8',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/books" style={{ color: '#006D6F', fontWeight: 600, textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>← Back to Books</Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
          {/* Left – Book info + cover + action */}
          <div style={{ ...cardStyle, position: 'sticky', top: '100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {coverUrl ? (
                <img src={coverUrl} alt={book.title} style={{ width: '100%', maxWidth: '220px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ width: '100%', maxWidth: '220px', height: '300px', background: '#F0EDE8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto' }}>📖</div>
              )}
            </div>

            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: '#2C3E50', marginBottom: '6px' }}>{book.title}</h1>
            {book.subtitle && <p style={{ color: '#7F8C8D', marginBottom: '12px' }}>{book.subtitle}</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {book.authors?.map((a: any) => (
                <span key={a.authorId} style={badgeStyle}>✍️ {a.fullName}</span>
              ))}
              {book.language && <span style={badgeStyle}>🌐 {book.language}</span>}
              {book.publisherName && <span style={badgeStyle}>🏢 {book.publisherName}</span>}
              {book.publicationYear && <span style={badgeStyle}>📅 {book.publicationYear}</span>}
            </div>

            {/* Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              <div style={{ background: '#F8F8F8', padding: '10px', borderRadius: '8px' }}><p style={{ fontSize: '0.7rem', color: '#7F8C8D', margin: '0 0 2px' }}>ISBN</p><p style={{ fontWeight: 600, color: '#2C3E50', margin: 0 }}>{book.masterISBN || '—'}</p></div>
              <div style={{ background: '#F8F8F8', padding: '10px', borderRadius: '8px' }}><p style={{ fontSize: '0.7rem', color: '#7F8C8D', margin: '0 0 2px' }}>DDC</p><p style={{ fontWeight: 600, color: '#2C3E50', margin: 0 }}>{book.ddcNumber || '—'}</p></div>
              <div style={{ background: '#F8F8F8', padding: '10px', borderRadius: '8px' }}><p style={{ fontSize: '0.7rem', color: '#7F8C8D', margin: '0 0 2px' }}>Call No.</p><p style={{ fontWeight: 600, color: '#2C3E50', margin: 0 }}>{book.callNumber || '—'}</p></div>
              <div style={{ background: '#F8F8F8', padding: '10px', borderRadius: '8px' }}><p style={{ fontSize: '0.7rem', color: '#7F8C8D', margin: '0 0 2px' }}>Pages</p><p style={{ fontWeight: 600, color: '#2C3E50', margin: 0 }}>{book.pageCount || '?'}</p></div>
            </div>

            {/* Action buttons */}
            {isAlreadyRequested ? (
              <div style={{ textAlign: 'center', padding: '12px', background: '#FFF7ED', borderRadius: '10px', color: '#C2410C', fontWeight: 600 }}>
                ⏳ Already Requested / Borrowed
              </div>
            ) : (
              <>
                {hasPhysicalCopies || hasDigitalCopies ? (
                  <button onClick={handleBorrowClick} disabled={borrowLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #006D6F, #005254)', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,109,111,0.2)', marginBottom: '8px' }}>{borrowLoading ? 'Processing…' : '📖 Borrow'}</button>
                ) : (
                  <button onClick={() => handleReserve(editions[0]?.bookEditionId)} disabled={borrowLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'white', color: '#006D6F', border: '2px solid #006D6F', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>🔖 Reserve</button>
                )}
                {book.isRareBook && <p style={{ textAlign: 'center', color: '#C2410C', fontSize: '0.85rem', marginTop: '6px' }}>⭐ Rare Book</p>}
              </>
            )}
          </div>

          {/* Right – Description + Editions */}
          <div>
            {book.description && (
              <div style={cardStyle}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700, color: '#2C3E50', marginBottom: '12px' }}>📖 Description</h2>
                <p style={{ color: '#4B5563', lineHeight: 1.7 }}>{book.description}</p>
              </div>
            )}

            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: '#2C3E50', marginBottom: '20px' }}>📚 Editions</h2>
            {editions.length === 0 ? (
              <p style={{ color: '#7F8C8D' }}>No editions available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {editions.map(ed => (
                  <div key={ed.bookEditionId} style={cardStyle}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '80px', height: '110px', background: '#F0EDE8', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ed.coverImageUrl ? (
                          <img src={`${API_BASE}${ed.coverImageUrl}`} alt={ed.edition} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '2rem' }}>📚</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 700, color: '#2C3E50', marginBottom: '6px' }}>{ed.edition}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#4B5563' }}>ISBN: {ed.isbn}</p>
                        {ed.publicationYear && <p style={{ fontSize: '0.85rem', color: '#4B5563' }}>Year: {ed.publicationYear}</p>}
                        {ed.coverType && <p style={{ fontSize: '0.85rem', color: '#4B5563' }}>Cover: {ed.coverType}</p>}
                        {ed.price && <p style={{ fontSize: '0.85rem', color: '#4B5563' }}>Price: ৳{ed.price}</p>}

                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: ed.availableCopies > 0 ? '#F0FDF4' : '#FEF2F2', color: ed.availableCopies > 0 ? '#15803D' : '#B91C1C', border: ed.availableCopies > 0 ? '1px solid #BBF7D0' : '1px solid #FECACA' }}>{ed.availableCopies} available</span>
                          {ed.digitalCopy && <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#E6F2F2', color: '#006D6F', border: '1px solid #B8D8D8' }}>📄 Digital Copy</span>}
                        </div>

                        {ed.digitalCopy && (
                          <div style={{ marginTop: '12px' }}>
                            <button onClick={() => openPreviewModal(ed.bookEditionId)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#006D6F', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Preview (first 10 pages)</button>
                          </div>
                        )}

                        {ed.availableCopies === 0 && !ed.digitalCopy && (
                          <button onClick={() => handleReserve(ed.bookEditionId)} disabled={borrowLoading} style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '10px', background: 'white', color: '#006D6F', border: '2px solid #006D6F', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Reserve This Edition</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Borrow Options Modal */}
        {showBorrowOptions && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '380px', width: '100%' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C3E50', marginBottom: '24px' }}>Choose Borrow Type</h3>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={handleBorrowPhysical} disabled={borrowLoading} style={{ padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #006D6F, #005254)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>📖 Physical Copy</button>
                <button onClick={handleBorrowDigital} disabled={borrowLoading} style={{ padding: '12px 24px', borderRadius: '10px', background: 'white', color: '#006D6F', border: '2px solid #006D6F', fontWeight: 700, cursor: 'pointer' }}>📄 PDF Copy</button>
              </div>
              <button onClick={() => setShowBorrowOptions(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#7F8C8D', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showModal && previewEditionId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #E8DCD0' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#2C3E50', margin: 0 }}>PDF Preview</h3>
                <button onClick={closePreviewModal} style={{ background: 'none', border: 'none', color: '#7F8C8D', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <iframe src={`${API_BASE}/api/BookEdition/${previewEditionId}/digitalcopy/preview?pages=10`} style={{ width: '100%', height: '100%', minHeight: '70vh', border: 'none' }} title="PDF Preview" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;