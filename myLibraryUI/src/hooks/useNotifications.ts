import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import {
  getMyBorrowingsApi,
  getMyReservationsApi,
  getMemberStatusApi,
} from "../api/memberApi";

export interface Notification {
  id: string;
  type: "overdue" | "reservation_fulfilled" | "membership_expiring" | "fine";
  message: string;
  link?: string;
  createdAt: string;
}

export const useNotifications = () => {
  const { isAuthenticated, isMember } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !isMember) return;

    const fetchNotifications = async () => {
      const items: Notification[] = [];

      try {
        // Overdue borrowings
        const borrowings = await getMyBorrowingsApi();
        borrowings
          .filter((b: any) => b.status === "Overdue")
          .forEach((b: any) => {
            items.push({
              id: `overdue-${b.borrowingId}`,
              type: "overdue",
              message: `"${b.bookTitle}" is overdue. Please return it as soon as possible.`,
              link: "/my-books",
              createdAt: b.dueDate,
            });
          });

        // Fulfilled reservations
        const reservations = await getMyReservationsApi();
        reservations
          .filter((r: any) => r.status === "Fulfilled")
          .forEach((r: any) => {
            items.push({
              id: `reservation-${r.reservationId}`,
              type: "reservation_fulfilled",
              message: `Your reservation for "${r.bookTitle}" is ready for pickup.`,
              link: "/reservations",
              createdAt: r.reservationDate,
            });
          });

        // Membership expiry (within 7 days)
        const status = await getMemberStatusApi();
        if (status.membershipExpiryDate) {
          const expiry = new Date(status.membershipExpiryDate);
          const now = new Date();
          const daysLeft = Math.ceil(
            (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysLeft <= 7 && daysLeft > 0) {
            items.push({
              id: "membership-expiry",
              type: "membership_expiring",
              message: `Your membership expires in ${daysLeft} day(s). Renew now to keep your benefits.`,
              link: "/my-membership",
              createdAt: new Date().toISOString(),
            });
          }
        }

        // Outstanding fine
        if (status.outstandingFine > 0) {
          items.push({
            id: "fine-outstanding",
            type: "fine",
            message: `You have an outstanding fine of ${status.outstandingFine.toFixed(2)}.`,
            link: "/fines",
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }

      setNotifications(items);
      setUnreadCount(items.length); // All are considered unread
    };

    fetchNotifications();
  }, [isAuthenticated, isMember]);

  const clearNotifications = () => {
    setUnreadCount(0);
  };

  return { notifications, unreadCount, clearNotifications };
};
