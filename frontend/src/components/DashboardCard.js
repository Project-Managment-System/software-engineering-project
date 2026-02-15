import { motion } from "framer-motion";

const DashboardCard = ({ title, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-md rounded p-6 w-60"
    >
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </motion.div>
  );
};

export default DashboardCard;
