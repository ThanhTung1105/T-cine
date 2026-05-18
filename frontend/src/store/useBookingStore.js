import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store quản lý toàn bộ luồng đặt vé:
 *   Phim  →  Suất chiếu  →  Ghế  →  Bắp nước  →  Khuyến mãi  →  Thanh toán
 *
 * Persist vào localStorage để user có thể F5 mà không mất dữ liệu đang chọn.
 */
const useBookingStore = create(
  persist(
    (set, get) => ({
      // ===== Showtime + Movie + Cinema + Room (load 1 lần ở SeatSelectionPage) =====
      showtime: null, // { id, start_time, end_time, base_price }
      movie: null,
      cinema: null,
      room: null,

      // ===== Ghế đã chọn ===== mỗi item: { id, row, column_num, type, label, price }
      selectedSeats: [],

      // ===== Combo đã chọn ===== { [comboId]: { combo: {...}, quantity } }
      selectedCombos: {},

      // ===== Khuyến mãi đã áp ===== { id, code, discount_percent, max_discount } | null
      appliedPromotion: null,

      // ===== Booking đã tạo (sau bước Payment) =====
      currentBookingId: null,

      // -------- ACTIONS --------

      setShowtimeContext: ({ showtime, movie, cinema, room }) =>
        set({ showtime, movie, cinema, room }),

      toggleSeat: (seat) => {
        const { selectedSeats, showtime } = get();
        if (!showtime) return;
        const exists = selectedSeats.find((s) => s.id === seat.id);
        if (exists) {
          set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) });
        } else {
          // Tính giá dựa trên base_price + loại ghế
          let price = Number(showtime.base_price || 0);
          if (seat.type === 'vip') price = Math.round(price * 1.3);
          else if (seat.type === 'couple') price = Math.round(price * 1.5);

          set({
            selectedSeats: [
              ...selectedSeats,
              {
                id: seat.id,
                row: seat.row,
                column_num: seat.column_num,
                type: seat.type,
                label: `${seat.row}${seat.column_num}`,
                price,
              },
            ],
          });
        }
      },

      clearSeats: () => set({ selectedSeats: [] }),

      setComboQuantity: (combo, quantity) => {
        const { selectedCombos } = get();
        const next = { ...selectedCombos };
        if (quantity <= 0) {
          delete next[combo.id];
        } else {
          next[combo.id] = { combo, quantity };
        }
        set({ selectedCombos: next });
      },

      setPromotion: (promotion) => set({ appliedPromotion: promotion }),
      clearPromotion: () => set({ appliedPromotion: null }),

      setCurrentBookingId: (id) => set({ currentBookingId: id }),

      // -------- COMPUTED HELPERS --------

      getTicketsTotal: () => {
        const { selectedSeats } = get();
        return selectedSeats.reduce((sum, s) => sum + Number(s.price || 0), 0);
      },

      getCombosTotal: () => {
        const { selectedCombos } = get();
        return Object.values(selectedCombos).reduce(
          (sum, { combo, quantity }) => sum + Number(combo.price) * quantity,
          0
        );
      },

      getSubtotal: () => get().getTicketsTotal() + get().getCombosTotal(),

      getDiscount: () => {
        const { appliedPromotion } = get();
        if (!appliedPromotion) return 0;
        const subtotal = get().getSubtotal();
        let d = (subtotal * Number(appliedPromotion.discount_percent || 0)) / 100;
        if (appliedPromotion.max_discount) {
          d = Math.min(d, Number(appliedPromotion.max_discount));
        }
        return Math.round(d);
      },

      getFinalTotal: () => Math.max(0, get().getSubtotal() - get().getDiscount()),

      // -------- RESET --------

      resetBooking: () =>
        set({
          showtime: null,
          movie: null,
          cinema: null,
          room: null,
          selectedSeats: [],
          selectedCombos: {},
          appliedPromotion: null,
          currentBookingId: null,
        }),
    }),
    {
      name: 'tcine-booking-store',
    }
  )
);

export default useBookingStore;
