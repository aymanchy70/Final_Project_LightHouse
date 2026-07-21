import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import BooksGrid from '../components/common/BooksGrid';
import EditionSelectorModal from '../components/common/EditionSelectorModal';
import { getBooksApi } from '../api/bookApi';
import { getMyBorrowingsApi, getMyActiveBorrowedBookIdsApi } from '../api/memberApi';
import { getCategoriesApi } from '../api/categoryApi';
import type { BookResponseDto } from '../types/book.types';
import type { Category } from '../types/category.types';
import Skeleton from '../components/common/Skeleton';
import {
  getCachedActiveIds,
  setCachedActiveIds,
  getCachedStatusMap,
  setCachedStatusMap,
} from '../utils/borrowCache';

const PAGE_SIZE = 15;

const BrowseBooksPage = () => {
  const { isAuthenticated, isMember } = useAuth();
  const navigate = useNavigate();

  const [allBooks, setAllBooks] = useState<BookResponseDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [activeBorrowedBookIds, setActiveBorrowedBookIds] = useState<Set<number>>(getCachedActiveIds());
  const [bookStatusMap, setBookStatusMap] = useState<Record<number, 'Pending' | 'Borrowed' | 'Overdue'>>(getCachedStatusMap());

  const [borrowModalBook, setBorrowModalBook] = useState<BookResponseDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [books, cats] = await Promise.all([getBooksApi(), getCategoriesApi()]);
        setAllBooks(books);
        setCategories(cats);

        if (isAuthenticated && isMember) {
          try {
            // ✅ Always fetch active IDs and update the cache
            const ids = await getMyActiveBorrowedBookIdsApi();
            const idSet = new Set(ids);
            setActiveBorrowedBookIds(idSet);
            setCachedActiveIds(idSet);

            const borrowings = await getMyBorrowingsApi();
            const map: Record<number, 'Pending' | 'Borrowed' | 'Overdue'> = {};
            borrowings.forEach((b: any) => {
              if (b.status === 'Pending' || b.status === 'Borrowed' || b.status === 'Overdue') {
                const bookId = b.bookId ?? b.physicalCopy?.bookEdition?.bookId ?? b.digitalCopy?.bookEdition?.bookId;
                if (bookId && (!map[bookId] || b.status === 'Overdue' || (b.status === 'Borrowed' && map[bookId] === 'Pending'))) {
                  map[bookId] = b.status;
                }
              }
            });
            setBookStatusMap(map);
            setCachedStatusMap(map);
          } catch (err) {
            console.log('Could not fetch active borrowings', err);
          }
        }
      } catch {
        setError('Failed to load books.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, isMember]);

  const languages = useMemo(() => {
    const langSet = new Set<string>();
    allBooks.forEach(b => { if (b.language) langSet.add(b.language); });
    return Array.from(langSet).sort();
  }, [allBooks]);

  const filteredBooks = useMemo(() => {
    return allBooks.filter(b => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!b.title?.toLowerCase().includes(q) && !b.authors?.some(a => a.fullName?.toLowerCase().includes(q)) && !b.masterISBN?.includes(q)) return false;
      }
      if (selectedCategory !== null && b.itemCategoryId !== selectedCategory) return false;
      if (selectedLanguage && b.language !== selectedLanguage) return false;
      return true;
    });
  }, [allBooks, searchQuery, selectedCategory, selectedLanguage]);

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const pagedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBooks.slice(start, start + PAGE_SIZE);
  }, [filteredBooks, currentPage]);

  const resetPage = () => setCurrentPage(1);
  const handleSearchChange = (val: string) => { setSearchQuery(val); resetPage(); };
  const handleCategoryChange = (val: number | null) => { setSelectedCategory(val); resetPage(); };
  const handleLanguageChange = (val: string) => { setSelectedLanguage(val); resetPage(); };
  const clearFilters = () => { setSearchQuery(''); setSelectedCategory(null); setSelectedLanguage(''); resetPage(); };

  const handleOpenBorrowModal = useCallback((book: BookResponseDto) => {
    if (!isAuthenticated) { navigate('/login?redirect=/books'); return; }
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

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '1300px', margin: '0 auto' }}>
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-10" />))}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{[...Array(10)].map((_, i) => (<Skeleton key={i} className="h-48" />))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#006D6F', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1300px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#2C3E50', marginBottom: '24px', fontFamily: 'Playfair Display, serif' }}>📚 Browse Books</h1>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #E8DCD0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#7F8C8D', marginBottom: '4px' }}>Search</label><input type="text" value={searchQuery} onChange={e => handleSearchChange(e.target.value)} placeholder="Title, author, ISBN..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E8DCD0', fontSize: '0.85rem', color: '#2C3E50', outline: 'none' }} /></div>
          <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#7F8C8D', marginBottom: '4px' }}>Category</label><select value={selectedCategory ?? ''} onChange={e => handleCategoryChange(e.target.value ? +e.target.value : null)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E8DCD0', fontSize: '0.85rem', color: '#2C3E50', background: 'white' }}><option value="">All Categories</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
          <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#7F8C8D', marginBottom: '4px' }}>Language</label><select value={selectedLanguage} onChange={e => handleLanguageChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E8DCD0', fontSize: '0.85rem', color: '#2C3E50', background: 'white' }}><option value="">All Languages</option>{languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}</select></div>
          <div><button onClick={clearFilters} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #006D6F', color: '#006D6F', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Clear Filters</button></div>
        </div>
      </div>

      {/* Results */}
      {filteredBooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #E8DCD0' }}><p style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</p><p style={{ color: '#7F8C8D' }}>No books found matching your filters.</p></div>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#7F8C8D', marginBottom: '16px' }}>Showing {pagedBooks.length} of {filteredBooks.length} books</p>
          <BooksGrid books={pagedBooks} onBorrowPhysical={handleOpenBorrowModal} onBorrowDigital={handleOpenBorrowModal} activeBorrowedBookIds={activeBorrowedBookIds} bookStatusMap={bookStatusMap} />
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E8DCD0', background: 'white', color: '#2C3E50', fontWeight: 600, cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: '8px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', background: page === currentPage ? '#006D6F' : 'white', color: page === currentPage ? 'white' : '#2C3E50', border: page === currentPage ? 'none' : '1px solid #E8DCD0', cursor: 'pointer' }}>{page}</button>)}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E8DCD0', background: 'white', color: '#2C3E50', fontWeight: 600, cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
            </div>
          )}
        </>
      )}

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

export default BrowseBooksPage;