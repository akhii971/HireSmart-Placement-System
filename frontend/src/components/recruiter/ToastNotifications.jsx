import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { clearToast } from "../../redux/recruiter/notificationsSlice";
import { useEffect } from "react";

export default function ToastNotifications() {
  const toast = useSelector((state) => state.notifications.toast);
  const dispatch = useDispatch();

  // Auto hide after 4 seconds
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => dispatch(clearToast()), 4000);
      return () => clearTimeout(t);
    }
  }, [toast, dispatch]);

  return (
    <div className="fixed top-24 right-6 z-[999]">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-2xl border rounded-2xl p-4 min-w-[300px]"
          >
            <div className="flex items-start gap-3">
              <span className="text-emerald-600 font-bold">🔔</span>
              <div>
                <p className="font-semibold text-slate-800">{toast.message}</p>
                <p className="text-xs text-slate-500 mt-1">{toast.time}</p>
              </div>
            </div>

            <button
              onClick={() => dispatch(clearToast())}
              className="mt-3 text-sm text-emerald-600 hover:underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
