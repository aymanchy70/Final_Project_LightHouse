import { useState, useEffect } from "react";
import {
  getBookEditionsByBookApi,
  getPhysicalCopiesByEditionApi,
  getDigitalCopyForEditionApi,
  borrowBookApi,
} from "../../api/bookApi";
import { borrowDigitalBookApi } from "../../api/memberApi";
import type { BookResponseDto } from "../../types/book.types";

interface EditionOption {
  bookEditionId: number;
  edition: string;
  availableCopies: number;
  hasDigitalCopy: boolean;
  digitalCopyId: number | null;
}

interface Props {
  book: BookResponseDto;
  onClose: () => void;
  onSuccess: (bookId: number, type: "physical" | "digital") => void;
}

const EditionSelectorModal = ({ book, onClose, onSuccess }: Props) => {
  const [editions, setEditions] = useState<EditionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const eds = await getBookEditionsByBookApi(book.bookId);
        const enriched = await Promise.all(
          eds.map(async (ed: any) => {
            const copies = await getPhysicalCopiesByEditionApi(
              ed.bookEditionId,
            );
            const available = copies.filter(
              (c: any) => c.status === "Available",
            ).length;
            let digitalCopyId: number | null = null;
            try {
              const dc = await getDigitalCopyForEditionApi(ed.bookEditionId);
              if (dc) digitalCopyId = dc.digitalCopyId;
            } catch {}
            return {
              bookEditionId: ed.bookEditionId,
              edition: ed.edition || "Standard",
              availableCopies: available,
              hasDigitalCopy: !!digitalCopyId,
              digitalCopyId,
            };
          }),
        );
        setEditions(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEditions();
  }, [book.bookId]);

  const handleBorrowPhysical = async (editionId: number) => {
    setBorrowingId(editionId);
    try {
      const copies = await getPhysicalCopiesByEditionApi(editionId);
      const availableCopy = copies.find((c: any) => c.status === "Available");
      if (!availableCopy) {
        alert("No physical copies available.");
        return;
      }
      await borrowBookApi(availableCopy.physicalCopyId);
      onSuccess(book.bookId, "physical");
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.title || "Failed to borrow physical copy.");
    } finally {
      setBorrowingId(null);
    }
  };

  const handleBorrowDigital = async (
    editionId: number,
    digitalCopyId: number,
  ) => {
    setBorrowingId(editionId);
    try {
      await borrowDigitalBookApi(digitalCopyId);
      onSuccess(book.bookId, "digital");
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.title || "Failed to borrow PDF.");
    } finally {
      setBorrowingId(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 300,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#4B5563" }}>Loading editions…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
        }}
      >
        <h3
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "1.3rem",
            color: "#2C3E50",
            marginBottom: "20px",
          }}
        >
          Select Edition
        </h3>
        <p
          style={{ fontSize: "0.9rem", color: "#4B5563", marginBottom: "20px" }}
        >
          {book.title}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {editions.map((ed) => (
            <div
              key={ed.bookEditionId}
              style={{
                border: "1px solid #E8DCD0",
                borderRadius: "12px",
                padding: "16px",
                background: "#F8FAFC",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#2C3E50",
                  marginBottom: "8px",
                }}
              >
                {ed.edition}
              </div>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                {ed.availableCopies > 0 ? (
                  <span
                    style={{
                      background: "#F0FDF4",
                      color: "#15803D",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      border: "1px solid #BBF7D0",
                    }}
                  >
                    {ed.availableCopies} physical available
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#FEF2F2",
                      color: "#B91C1C",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      border: "1px solid #FECACA",
                    }}
                  >
                    No physical copies
                  </span>
                )}
                {ed.hasDigitalCopy && (
                  <span
                    style={{
                      background: "#E6F2F2",
                      color: "#006D6F",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      border: "1px solid #B8D8D8",
                    }}
                  >
                    PDF available
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {ed.availableCopies > 0 && (
                  <button
                    onClick={() => handleBorrowPhysical(ed.bookEditionId)}
                    disabled={borrowingId === ed.bookEditionId}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #006D6F, #005254)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      opacity: borrowingId === ed.bookEditionId ? 0.6 : 1,
                    }}
                  >
                    📖 Physical
                  </button>
                )}
                {ed.hasDigitalCopy && ed.digitalCopyId && (
                  <button
                    onClick={() =>
                      handleBorrowDigital(ed.bookEditionId, ed.digitalCopyId!)
                    }
                    disabled={borrowingId === ed.bookEditionId}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "white",
                      color: "#006D6F",
                      border: "2px solid #006D6F",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      opacity: borrowingId === ed.bookEditionId ? 0.6 : 1,
                    }}
                  >
                    📄 PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            background: "white",
            border: "1px solid #E8DCD0",
            color: "#4B5563",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditionSelectorModal;
