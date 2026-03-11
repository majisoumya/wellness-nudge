import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/timer", label: "Timer" },
  { path: "/wellness", label: "Wellness" },
  { path: "/posture", label: "AI Posture" },
  { path: "/leaderboard", label: "Leaderboard" },
  { path: "/history", label: "History" },
];

const AppNav = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel px-4 py-3 mb-8 flex items-center justify-between"
    >
      <Link to="/dashboard" className="font-display font-semibold text-lg text-foreground tracking-tight">
        Wellness Nudge
      </Link>
      <div className="flex gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-md text-sm font-body transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <Link to="/" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
        Sign out
      </Link>
    </motion.nav>
  );
};

export default AppNav;
