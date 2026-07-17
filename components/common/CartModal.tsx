"use client";

import { FaShoppingCart, FaTimes, FaTrash } from "react-icons/fa";

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cartItems: string[];
  onRemove: (testName: string) => void;
  onClear: () => void;
  onBookNow: () => void;
};

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onRemove,
  onClear,
  onBookNow,
}: CartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-7 flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <FaShoppingCart className="text-3xl text-[#0754dc]" />
              <h2 className="text-4xl font-extrabold text-[#07142f]">
                My Cart
              </h2>
            </div>

            <p className="mt-3 text-lg text-slate-500">
              Selected tests will appear here before booking.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
          >
            <FaTimes />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl bg-[#f5f9ff] p-10 text-center">
            <FaShoppingCart className="mx-auto text-5xl text-[#0754dc]" />

            <h3 className="mt-5 text-2xl font-extrabold text-[#07142f]">
              Your cart is empty
            </h3>

            <p className="mt-2 text-slate-500">
              Search tests and add them to your cart.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-[#f5f9ff] px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-bold text-[#0754dc]">
                      Test {index + 1}
                    </p>

                    <h3 className="text-xl font-extrabold text-[#07142f]">
                      {item}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(item)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#e71935] shadow-sm hover:bg-[#ffecef]"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onClear}
                className="w-full rounded-xl border border-[#e71935] py-4 text-lg font-bold text-[#e71935]"
              >
                Clear Cart
              </button>

              <button
                type="button"
                onClick={onBookNow}
                className="w-full rounded-xl bg-[#0754dc] py-4 text-lg font-bold text-white"
              >
                Book Selected Tests
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}