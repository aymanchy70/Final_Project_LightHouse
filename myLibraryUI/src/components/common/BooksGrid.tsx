import BookCard from "./BookCard";
import type { BookResponseDto } from "../../types/book.types";

interface BooksGridProps {
  books: BookResponseDto[];
  title?: string;
  onBorrowPhysical?: (book: BookResponseDto) => void;
  onBorrowDigital?: (book: BookResponseDto) => void;
  onReserve?: (book: BookResponseDto) => void;
  borrowLoading?: boolean;
  activeBorrowedBookIds?: Set<number>;
  bookStatusMap?: Record<number, "Pending" | "Borrowed" | "Overdue">;
}

const BooksGrid = ({
  books,
  title,
  onBorrowPhysical,
  onBorrowDigital,
  onReserve,
  borrowLoading,
  activeBorrowedBookIds,
  bookStatusMap,
}: BooksGridProps) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No books found</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="text-xl font-bold mb-6" style={{ color: "#2C3E50" }}>
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.bookId}
            book={book}
            onBorrowPhysical={onBorrowPhysical}
            onBorrowDigital={onBorrowDigital}
            onReserve={onReserve}
            hasDigitalCopy={book.hasDigitalCopy}
            hasAvailableCopies={(book as any).availableCopies > 0}
            bookStatus={bookStatusMap?.[book.bookId]}
            activeBorrowedBookIds={activeBorrowedBookIds}
            borrowLoading={borrowLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default BooksGrid;
