import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { clearToast } from "../../redux/user/notificationsSlice";

export default function ToastNotifications() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.userNotifications.toast);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-6 right-6 z-[9999] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl"
          onAnimationComplete={() => {
            setTimeout(() => dispatch(clearToast()), 3000); // auto hide
          }}
        >
          🔔 {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
