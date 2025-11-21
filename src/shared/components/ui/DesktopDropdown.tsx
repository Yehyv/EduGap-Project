import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const DesktopDropdown = ({ desktopDropdown, keyName, dropdownContent }) => {
  return (
    <>
      <AnimatePresence>
        {desktopDropdown === keyName && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.85 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.85 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full end-0 bg-white shadow-lg rounded-xl p-3 min-w-[240px] z-40"
          >
            {dropdownContent[keyName]?.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition"
              >
                <img
                  src={item.image}
                  className="w-10 h-10 rounded-md object-cover"
                  alt={item.title}
                />

                <div className="flex flex-col leading-tight">
                  {item?.user?.full_name && (
                    <span className="font-semibold">{item.user.full_name}</span>
                  )}
                  <span className="text-sm text-gray-700">{item.title}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DesktopDropdown;
