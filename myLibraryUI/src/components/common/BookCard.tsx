import { useState } from "react";
import { Link } from "react-router-dom";
import type { BookResponseDto } from "../../types/book.types";

interface BookCardProps {
  book: BookResponseDto;
  onBorrowPhysical?: (book: BookResponseDto) => void;
  onBorrowDigital?: (book: BookResponseDto) => void;
  onReserve?: (book: BookResponseDto) => void;
  hasDigitalCopy?: boolean;
  hasAvailableCopies?: boolean;
  bookStatus?: "Pending" | "Borrowed" | "Overdue";
  activeBorrowedBookIds?: Set<number>;
  borrowLoading?: boolean;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5200";

const BookCard = ({
  book,
  onBorrowPhysical,
  onBorrowDigital,
  onReserve,
  hasDigitalCopy,
  hasAvailableCopies,
  bookStatus,
  activeBorrowedBookIds,
  borrowLoading,
}: BookCardProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const isRequested = bookStatus === "Pending";
  const isActive = bookStatus === "Borrowed" || bookStatus === "Overdue";
  const hasActiveBorrowing =
    !!bookStatus || (activeBorrowedBookIds?.has(book.bookId) ?? false);

  const handleBorrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasDigitalCopy && hasAvailableCopies) {
      setShowOptions(true);
    } else if (hasAvailableCopies) {
      onBorrowPhysical?.(book);
    } else if (hasDigitalCopy) {
      onBorrowDigital?.(book);
    }
  };

  const fullImageUrl = book.coverImageUrl
    ? `${API_BASE_URL}${book.coverImageUrl}`
    : "";

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #E8DCD0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link
        to={`/books/${book.bookId}`}
        style={{ textDecoration: "none", color: "inherit", flex: 1 }}
      >
        <div
          style={{
            height: "180px",
            background: "#F0EDE8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {fullImageUrl ? (
            <img
              src={fullImageUrl}
              alt={book.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "3rem" }}>📖</span>
          )}
        </div>
        <div style={{ padding: "12px" }}>
          <h3
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#2C3E50",
              marginBottom: "4px",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.title}
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#7F8C8D",
              marginBottom: "8px",
            }}
          >
            {book.authors?.map((a) => a.fullName).join(", ") ||
              "Unknown Author"}
          </p>
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            {hasDigitalCopy && (
              <span
                style={{
                  background: "#E6F2F2",
                  color: "#006D6F",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: "1px solid #B8D8D8",
                }}
              >
                📄 PDF
              </span>
            )}
            {hasAvailableCopies !== undefined && (
              <span
                style={{
                  background: hasAvailableCopies ? "#F0FDF4" : "#FEF2F2",
                  color: hasAvailableCopies ? "#15803D" : "#B91C1C",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: hasAvailableCopies
                    ? "1px solid #BBF7D0"
                    : "1px solid #FECACA",
                }}
              >
                {hasAvailableCopies ? "🟢 Available" : "🔴 Unavailable"}
              </span>
            )}
            {hasActiveBorrowing && (
              <span
                style={{
                  background: isRequested ? "#FFF7ED" : "#EFF6FF",
                  color: isRequested ? "#C2410C" : "#1D4ED8",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: isRequested
                    ? "1px solid #FED7AA"
                    : "1px solid #BFDBFE",
                }}
              >
                {isRequested ? "⏳ Requested" : "📖 Borrowed"}
              </span>
            )}
          </div>
        </div>
      </Link>

      {!hasActiveBorrowing && (
        <div style={{ padding: "0 12px 12px" }}>
          {hasAvailableCopies || hasDigitalCopy ? (
            <button
              onClick={handleBorrowClick}
              disabled={borrowLoading}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #006D6F, #005254)",
                color: "white",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,109,111,0.2)",
                transition: "transform 0.15s",
              }}
            >
              {borrowLoading ? "Processing…" : "📖 Borrow"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                onReserve?.(book);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "white",
                color: "#006D6F",
                border: "2px solid #006D6F",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              🔖 Reserve
            </button>
          )}
        </div>
      )}

      {showOptions && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              textAlign: "center",
              maxWidth: "320px",
              width: "100%",
            }}
          >
            <h3
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "1.1rem",
                color: "#2C3E50",
                marginBottom: "20px",
              }}
            >
              Choose Borrow Type
            </h3>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  setShowOptions(false);
                  onBorrowPhysical?.(book);
                }}
                disabled={borrowLoading}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #006D6F, #005254)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: borrowLoading ? 0.6 : 1,
                }}
              >
                📖 Physical Copy
              </button>
              <button
                onClick={() => {
                  setShowOptions(false);
                  onBorrowDigital?.(book);
                }}
                disabled={borrowLoading}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "white",
                  color: "#006D6F",
                  border: "2px solid #006D6F",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: borrowLoading ? 0.6 : 1,
                }}
              >
                📄 PDF Copy
              </button>
            </div>
            <button
              onClick={() => setShowOptions(false)}
              style={{
                marginTop: "16px",
                background: "none",
                border: "none",
                color: "#7F8C8D",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCard;
