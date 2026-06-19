import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface BookingSlot {
  date: string;        // 'YYYY-MM-DD'
  startTime: string;   // 'HH:mm'
  endTime: string;     // 'HH:mm'
  duration: number;    // hours
}

export interface BookingDraft {
  courtId: string;
  courtName: string;
  courtAddress: string;
  courtImage?: string;
  sport: string;
  slot: BookingSlot | null;
  basePrice: number;
  serviceFee: number;
  discount: number;
  pointsUsed: number;
  totalPrice: number;
  paymentMethod: 'payos' | 'cash';
  bookerName: string;
  bookerPhone: string;
  bookerEmail: string;
  notes: string;
  comboType?: 'week' | 'month';
}

interface BookingState {
  draft: BookingDraft | null;
  confirmedBookingId: string | null;
  setDraft: (data: Partial<BookingDraft>) => void;
  initDraft: (courtId: string, courtName: string, courtAddress: string, courtImage?: string) => void;
  setConfirmedBookingId: (id: string) => void;
  clearBooking: () => void;
}

const defaultDraft = (): BookingDraft => ({
  courtId: '',
  courtName: '',
  courtAddress: '',
  courtImage: undefined,
  sport: '',
  slot: null,
  basePrice: 0,
  serviceFee: 15000,
  discount: 0,
  pointsUsed: 0,
  totalPrice: 0,
  paymentMethod: 'payos',
  bookerName: '',
  bookerPhone: '',
  bookerEmail: '',
  notes: '',
  comboType: undefined,
});

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      draft: null,
      confirmedBookingId: null,

      initDraft: (courtId, courtName, courtAddress, courtImage) =>
        set({ draft: { ...defaultDraft(), courtId, courtName, courtAddress, courtImage } }),

      setDraft: (data) =>
        set((state) => ({
          draft: state.draft ? { ...state.draft, ...data } : { ...defaultDraft(), ...data },
        })),

      setConfirmedBookingId: (id) => set({ confirmedBookingId: id }),

      clearBooking: () => set({ draft: null, confirmedBookingId: null }),
    }),
    {
      name: 'ezsport-booking',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
