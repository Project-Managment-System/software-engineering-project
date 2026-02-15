import { motion } from "framer-motion";

const Navbar = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-end items-center p-4 bg-white shadow-md"
    >
      <div className="mr-4 font-semibold">{user || "Engineer"}</div>
      <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
        Logout
      </button>
    </motion.div>
  );
};

export default Navbar;
