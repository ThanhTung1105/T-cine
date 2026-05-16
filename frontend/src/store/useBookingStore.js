import { create } from 'zustand';

const useBookingStore = create((set, get) => ({
  // State
  selectedMovie: null,
  selectedCinema: null,
  selectedShowtime: null,
  selectedSeats: [],
  totalPrice: 0,

  // Actions
  setMovie: (movie) => set({ selectedMovie: movie }),
  setCinema: (cinema) => set({ selectedCinema: cinema }),
  setShowtime: (showtime) => set({ selectedShowtime: showtime }),

  // Chọn/bỏ chọn ghế
  toggleSeat: (seat) => {
    const { selectedSeats } = get();
    const exists = selectedSeats.find((s) => s.id === seat.id);

    let newSeats;
    if (exists) {
      newSeats = selectedSeats.filter((s) => s.id !== seat.id);
    } else {
      newSeats = [...selectedSeats, seat];
    }

    const totalPrice = newSeats.reduce((sum, s) => sum + s.price, 0);
    set({ selectedSeats: newSeats, totalPrice });
  },

  // Reset toàn bộ booking
  resetBooking: () =>
    set({
      selectedMovie: null,
      selectedCinema: null,
      selectedShowtime: null,
      selectedSeats: [],
      totalPrice: 0,
    }),
}));

export default useBookingStore;
