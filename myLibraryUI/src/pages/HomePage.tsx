import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import HeroSlider from '../components/common/HeroSlider';
import BooksGrid from '../components/common/BooksGrid';
import EditionSelectorModal from '../components/common/EditionSelectorModal';
import { getBooksApi } from '../api/bookApi';
import { getMyBorrowingsApi, getMyActiveBorrowedBookIdsApi } from '../api/memberApi';
import { getCategoriesApi } from '../api/categoryApi';
import type { BookResponseDto } from '../types/book.types';
import type { Category } from '../types/category.types';
import {
  getCachedActiveIds,
  setCachedActiveIds,
  getCachedStatusMap,
  setCachedStatusMap,
} from '../utils/borrowCache';

// ─── Constants ──────────────────────────────────────────────────────────────
const PX = '48px';
const MW = '1152px';
const SEC = '80px';
const SEC_SM = '56px';

const container: React.CSSProperties = {
  maxWidth: MW,
  margin: '0 auto',
  padding: `0 ${PX}`,
  width: '100%',
  boxSizing: 'border-box',
};

// ─── Skeleton Loader ────────────────────────────────────────────────────────
const BookSkeleton = () => (
  <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'white', boxShadow: '0 2px 8px rgba(44,62,80,0.06)' }}>
    <div style={{ height: '140px', background: '#F0EDE8', animation: 'pulse 1.5s ease-in-out infinite' }} />
    <div style={{ padding: '16px' }}>
      <div style={{ height: '13px', background: '#F0EDE8', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '10px', background: '#F0EDE8', borderRadius: '4px', width: '65%', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  </div>
);

const CategorySkeleton = () => (
  <div style={{ borderRadius: '10px', background: 'white', border: '1px solid #E8DCD0', overflow: 'hidden' }}>
    <div style={{ padding: '24px 16px', textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F0EDE8', margin: '0 auto 10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '60%', height: '12px', borderRadius: '4px', background: '#F0EDE8', margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
    <div style={{ height: '3px', background: '#E8DCD0' }} />
  </div>
);

// ─── Filter tags (popular searches) ─────────────────────────────────────────
const FILTER_TAGS = ['Bengali Books', 'English Books', 'Novel', 'Science'];

// ─── Client‑side book filter ───────────────────────────────────────────────
const filterBooks = (books: BookResponseDto[], query: string): BookResponseDto[] => {
  const q = query.trim().toLowerCase();
  if (!q) return books;

  if (q === 'bengali books') return books.filter(b => b.language?.toLowerCase() === 'বাংলা' || b.language?.toLowerCase() === 'bn');
  if (q === 'english books') return books.filter(b => b.language?.toLowerCase() === 'ইংরেজি' || b.language?.toLowerCase() === 'en');
  if (q === 'novel') return books.filter(b => b.itemCategoryId === 1);
  if (q === 'science') return books.filter(b => b.itemCategoryId === 2);

  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.fullName.toLowerCase().includes(q)) ||
    b.categoryName?.toLowerCase().includes(q)
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const HomePage = () => {
  const { isAuthenticated, isMember } = useAuth();
  const navigate = useNavigate();

  // Books state
  const [allBooks, setAllBooks] = useState<BookResponseDto[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('');

  // Borrow state
  const [activeBorrowedBookIds, setActiveBorrowedBookIds] = useState<Set<number>>(getCachedActiveIds());
  const [bookStatusMap, setBookStatusMap] = useState<Record<number, 'Pending' | 'Borrowed' | 'Overdue'>>(getCachedStatusMap());
  const [borrowModalBook, setBorrowModalBook] = useState<BookResponseDto | null>(null);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const books = await getBooksApi();
        setAllBooks(books);
      } catch (err) {
        console.error('Failed to fetch books', err);
      } finally {
        setBooksLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesApi();
        setCategories(data);
      } catch (err) {
        setCatError('Failed to load categories');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch user's borrowed book IDs & status (only if member)
  useEffect(() => {
    if (!isAuthenticated || !isMember) return;
    const fetchBorrowData = async () => {
      try {
        const ids = await getMyActiveBorrowedBookIdsApi();
        const idSet = new Set(ids);
        setActiveBorrowedBookIds(idSet);
        setCachedActiveIds(idSet);

        const borrowings = await getMyBorrowingsApi();
        const map: Record<number, 'Pending' | 'Borrowed' | 'Overdue'> = {};
        borrowings.forEach((b: any) => {
          if (b.status === 'Pending' || b.status === 'Borrowed' || b.status === 'Overdue') {
            const bookId = b.bookId ?? b.physicalCopy?.bookEdition?.bookId ?? b.digitalCopy?.bookEdition?.bookId;
            if (bookId) map[bookId] = b.status;
          }
        });
        setBookStatusMap(map);
        setCachedStatusMap(map);
      } catch (err) {
        console.log('Could not fetch borrow data', err);
      }
    };
    fetchBorrowData();
  }, [isAuthenticated, isMember]);

  // Filtered books (client‑side)
  const filteredBooks = useMemo(() => filterBooks(allBooks, searchQuery), [allBooks, searchQuery]);
  const isSearchActive = searchQuery.trim().length > 0;

  // Trending books (latest 4)
  const trendingBooks = useMemo(
    () => [...allBooks].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).slice(0, 4),
    [allBooks]
  );

  // Handlers for search/tags
  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag('');
      setSearchQuery('');
    } else {
      setActiveTag(tag);
      setSearchQuery(tag);
    }
  };
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const matched = FILTER_TAGS.find(t => t.toLowerCase() === val.toLowerCase());
    setActiveTag(matched ?? '');
  };

  // Borrow handlers
  const handleOpenBorrowModal = useCallback((book: BookResponseDto) => {
    if (!isAuthenticated) { navigate('/login?redirect=/'); return; }
    if (!isMember) { navigate('/membership'); return; }
    setBorrowModalBook(book);
  }, [isAuthenticated, isMember, navigate]);

  const handleBorrowSuccess = useCallback((bookId: number, type: 'physical' | 'digital') => {
    setActiveBorrowedBookIds(prev => {
      const next = new Set(prev);
      next.add(bookId);
      setCachedActiveIds(next);
      return next;
    });
    setBookStatusMap(prev => {
      const next = { ...prev, [bookId]: 'Pending' as const };
      setCachedStatusMap(next);
      return next;
    });
    toast.success(`${type === 'digital' ? 'PDF' : 'Physical'} copy requested! Pending admin approval.`);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>

      <Navbar />
      <HeroSlider />

      <div style={{ height: '1px', background: '#E8DCD0', margin: `0 ${PX}` }} />

      {/* ─── SEARCH SECTION ─────────────────────────────────────────────── */}
      <section style={{ padding: `${SEC} ${PX}` }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{
            background: 'white', borderRadius: '14px', padding: '28px 32px',
            boxShadow: '0 4px 20px rgba(44,62,80,0.08)', borderBottom: '3px solid #C0392B',
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Search by title, author or category..."
                  style={{
                    width: '100%', paddingLeft: '42px', paddingRight: '16px',
                    paddingTop: '12px', paddingBottom: '12px', borderRadius: '8px',
                    border: '1px solid #E8DCD0', color: '#000000', background: '#FAFAFA',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button style={{
                padding: '12px 28px', borderRadius: '8px', background: '#C0392B',
                color: 'white', border: 'none', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', flexShrink: 0,
              }}>Search</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#95A5A6' }}>Popular searches:</span>
              {FILTER_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  style={{
                    padding: '5px 14px', borderRadius: '100px',
                    background: activeTag === tag ? '#C0392B' : '#F0EDE8',
                    color: activeTag === tag ? 'white' : '#5D6D7E',
                    border: 'none', fontSize: '0.78rem', cursor: 'pointer',
                    fontWeight: activeTag === tag ? 700 : 400, transition: 'all 0.2s',
                  }}
                >{tag}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: '#E8DCD0', margin: `0 ${PX}` }} />

      {/* ─── CATEGORIES SECTION ────────────────────────────────────────── */}
      <section style={{ padding: `${SEC} ${PX}` }}>
        <div style={container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2C3E50', margin: '0 0 10px' }}>📚 Our Collection</h2>
              <div style={{ width: '48px', height: '3px', background: '#C0392B', borderRadius: '2px' }} />
            </div>
            <Link to="/categories" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#C0392B', textDecoration: 'none', marginTop: '4px' }}>View All →</Link>
          </div>

          {catLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {[1,2,3,4,5,6].map(i => <CategorySkeleton key={i} />)}
            </div>
          )}

          {!catLoading && catError && (
            <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '10px', padding: '20px 24px', textAlign: 'center', color: '#C0392B' }}>
              {catError} <button onClick={() => window.location.reload()} style={{ marginLeft: '12px', background: '#C0392B', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {!catLoading && !catError && categories.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {categories.map(cat => (
                <Link key={cat.id} to={`/categories/${cat.id}`} style={{ position: 'relative', overflow: 'hidden', borderRadius: '10px', background: 'white', border: '1px solid #E8DCD0', textDecoration: 'none', display: 'block', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{cat.icon}</div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2C3E50', margin: 0 }}>{cat.name}</h3>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: cat.color || '#C0392B' }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── TRENDING BOOKS SECTION ─────────────────────────────────────── */}
      <section style={{ padding: `${SEC} ${PX}`, background: '#F0EDE8' }}>
        <div style={container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2C3E50', margin: '0 0 10px' }}>🔥 Trending This Week</h2>
              <div style={{ width: '48px', height: '3px', background: '#C0392B', borderRadius: '2px' }} />
            </div>
            <Link to="/books" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#C0392B', textDecoration: 'none', marginTop: '4px' }}>See More →</Link>
          </div>

          {booksLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[1,2,3,4].map(i => <BookSkeleton key={i} />)}
            </div>
          )}

          {!booksLoading && trendingBooks.length > 0 && (
            <BooksGrid
              books={trendingBooks}
              onBorrowPhysical={handleOpenBorrowModal}
              onBorrowDigital={handleOpenBorrowModal}
              activeBorrowedBookIds={activeBorrowedBookIds}
              bookStatusMap={bookStatusMap}
            />
          )}

          {!booksLoading && trendingBooks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</p>
              <p style={{ fontSize: '0.9rem', color: '#7F8C8D' }}>No books added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── SEARCH RESULTS SECTION (only when active) ───────────────────── */}
      {isSearchActive && (
        <section style={{ padding: `${SEC} ${PX}` }}>
          <div style={container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2C3E50', margin: '0 0 10px' }}>🔍 Results for "{searchQuery}"</h2>
                <div style={{ width: '48px', height: '3px', background: '#C0392B', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#7F8C8D', background: '#F0EDE8', borderRadius: '20px', padding: '4px 14px' }}>
                {filteredBooks.length} books
              </span>
            </div>
            {filteredBooks.length > 0 ? (
              <BooksGrid
                books={filteredBooks}
                onBorrowPhysical={handleOpenBorrowModal}
                onBorrowDigital={handleOpenBorrowModal}
                activeBorrowedBookIds={activeBorrowedBookIds}
                bookStatusMap={bookStatusMap}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '14px', border: '1px solid #E8DCD0' }}>
                <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</p>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2C3E50', marginBottom: '8px' }}>No books found</h3>
                <p style={{ fontSize: '0.88rem', color: '#95A5A6' }}>No books match "{searchQuery}".</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── STATS & TESTIMONIALS ───────────────────────────────────────── */}
      <section style={{ padding: `${SEC} ${PX}` }}>
        <div style={{ ...container, maxWidth: '860px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '64px' }}>
            {[
              { value: '50,000+', label: 'Books', icon: '📚' },
              { value: '10,000+', label: 'Authors', icon: '✍️' },
              { value: '100,000+', label: 'Readers', icon: '👥' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '28px 20px', borderRadius: '12px', background: 'white', border: '1px solid #E8DCD0', textAlign: 'center', boxShadow: '0 2px 8px rgba(44,62,80,0.05)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C0392B', marginBottom: '6px' }}>{stat.value}</div>
                <div style={{ fontSize: '0.82rem', color: '#7F8C8D' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2C3E50', marginBottom: '10px' }}>⭐ What Our Readers Say</h3>
            <div style={{ width: '40px', height: '3px', background: '#C0392B', borderRadius: '2px', margin: '0 auto 32px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left' }}>
              {[
                { name: 'Mishu', text: 'A university library has come to my mobile.', role: 'University Student' },
                { name: 'Miska', text: 'Excellent collection in both Bengali and English. Stunning design!', role: 'Engineer' },
              ].map((t, i) => (
                <div key={i} style={{ padding: '24px 28px', borderRadius: '12px', background: '#F0EDE8', borderLeft: '3px solid #C0392B' }}>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#5D6D7E', marginBottom: '16px', lineHeight: 1.7 }}>"{t.text}"</p>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2C3E50', marginBottom: '3px' }}>{t.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#95A5A6' }}>{t.role}</p>
                </div>
              ))}
            </div>
          </div>

          {!isAuthenticated && (
            <div style={{ textAlign: 'center', paddingTop: '16px' }}>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 36px', borderRadius: '10px', background: '#2C3E50', color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(44,62,80,0.2)' }}>
                <span>📖</span> Create Free Account <span>→</span>
              </Link>
              <p style={{ fontSize: '0.78rem', color: '#95A5A6', marginTop: '12px' }}>Takes only 30 seconds</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#2C3E50', padding: `${SEC_SM} ${PX}` }}>
        <div style={container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '40px', marginBottom: '48px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F9F6F0', marginBottom: '12px' }}>📚 LightHouse</h4>
              <p style={{ fontSize: '0.82rem', color: '#95A5A6' }}>Home of knowledge</p>
            </div>
            {[
              { title: 'Explore', links: [{ label: 'Books', to: '/books' }, { label: 'Categories', to: '/categories' }, { label: 'Authors', to: '/authors' }] },
              { title: 'Support', links: [{ label: 'Help Center', to: '/help' }, { label: 'Contact', to: '/contact' }, { label: 'FAQ', to: '/faq' }] },
              { title: 'Legal', links: [{ label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }] },
            ].map(col => (
              <div key={col.title}>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F9F6F0', marginBottom: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{col.title}</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(l => (
                    <Link key={l.label} to={l.to} style={{ fontSize: '0.82rem', color: '#95A5A6', textDecoration: 'none' }}>{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #405A6E', paddingTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: '#7F8C8D' }}>© {new Date().getFullYear()} LightHouse — Home of knowledge</p>
          </div>
        </div>
      </footer>

      {/* Borrow Modal */}
      {borrowModalBook && (
        <EditionSelectorModal
          book={borrowModalBook}
          onClose={() => setBorrowModalBook(null)}
          onSuccess={handleBorrowSuccess}
        />
      )}
    </div>
  );
};

export default HomePage;