// ...existing code...
import * as functions from "firebase-functions";
// replace star-import with default-import for proper ESM interop
import admin from "firebase-admin";

admin.initializeApp();

export const onBookingCreated = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap, ctx) => {
    const booking = snap.data();
    console.log("Booking created:", ctx.params.bookingId, booking);
    if (!booking.paymentStatus) {
      await snap.ref.update({ paymentStatus: "pending", createdAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    return null;
  });
// ...existing code...