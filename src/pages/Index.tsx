// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import FloatingOrbs from "@/components/FloatingOrbs";
// import Orb3D from "@/components/Orb3D";
// import GlassCard from "@/components/GlassCard";
// import { Timer, Heart, BarChart3, Bell } from "lucide-react";

// const features = [
//   { icon: Timer, title: "Focus Sessions", desc: "Structured work sessions with gentle break reminders" },
//   { icon: Heart, title: "Wellness Pauses", desc: "Guided breathing exercises between focus blocks" },
//   { icon: BarChart3, title: "Daily Reflection", desc: "A simple ring showing your pauses — not a score" },
//   { icon: Bell, title: "Quiet Nudges", desc: "Subtle reminders that never interrupt your flow" },
// ];

// const Landing = () => (
//   <div className="gradient-radial-bg relative overflow-hidden">
//     <FloatingOrbs />

//     {/* Nav */}
//     <motion.header
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ delay: 0.2 }}
//       className="relative z-10 container mx-auto flex items-center justify-between py-6"
//     >
//       <span className="font-display font-semibold text-xl tracking-tight text-foreground">
//         Wellness Nudge
//       </span>
//       <div className="flex gap-3">
//         <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
//         <Link to="/login" className="btn-primary text-sm">Get Started</Link>
//       </div>
//     </motion.header>

//     {/* Hero */}
//     <section className="relative z-10 container mx-auto pt-12 pb-20 md:pt-20 md:pb-32">
//       <div className="grid md:grid-cols-2 gap-12 items-center">
//         <motion.div
//           initial={{ opacity: 0, x: -30 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8, delay: 0.3 }}
//         >
//           <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
//             Work deeply.
//             <br />
//             <span className="text-gradient">Pause gently.</span>
//           </h1>
//           <p className="text-lg mb-8 leading-relaxed max-w-md" style={{ color: "var(--text-subtle)" }}>
//             A calm companion for your workday that reminds you to breathe, stretch, and restore — without adding to
//             the noise.
//           </p>
//           <div className="flex gap-4">
//             <Link to="/login" className="btn-primary text-base">
//               Start for free
//             </Link>
//             <Link to="/dashboard" className="btn-ghost text-base">
//               Explore demo
//             </Link>
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1, delay: 0.5 }}
//         >
//           <Orb3D />
//         </motion.div>
//       </div>
//     </section>

//     {/* Features */}
//     <section className="relative z-10 container mx-auto pb-24">
//       <div className="grid sm:grid-cols-2 gap-6">
//         {features.map((f, i) => (
//           <GlassCard key={f.title} delay={0.6 + i * 0.15} className="group">
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
//                 <f.icon size={22} />
//               </div>
//               <div>
//                 <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
//                 <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
//               </div>
//             </div>
//           </GlassCard>
//         ))}
//       </div>
//     </section>

//     {/* Footer */}
//     <footer className="relative z-10 container mx-auto pb-8 text-center">
//       <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
//         Designed by Stillpoint. Built to help you pause.
//       </p>
//     </footer>
//   </div>
// );

// export default Landing;
////////////////////////////////////
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { Moon, Sun, Upload, User as UserIcon, LogOut, Phone, Edit2, Check, X } from "lucide-react";
import FloatingOrbs from "@/components/FloatingOrbs";
import GlassCard from "@/components/GlassCard";
import { Timer, Heart, BarChart3, Bell } from "lucide-react";

const features = [
  { icon: Timer, title: "Focus Sessions", desc: "Structured work sessions with gentle break reminders" },
  { icon: Heart, title: "Wellness Pauses", desc: "Guided breathing exercises between focus blocks" },
  { icon: BarChart3, title: "Daily Reflection", desc: "A simple ring showing your pauses — not a score" },
  { icon: Bell, title: "Quiet Nudges", desc: "Subtle reminders that never interrupt your flow" },
];

const Landing = () => {
  const { session, signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [updatingPhone, setUpdatingPhone] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.phone) {
      setPhoneInput(user.user_metadata.phone);
    }
  }, [user]);

  const handlePhoneUpdate = async () => {
    try {
      setUpdatingPhone(true);
      const { error } = await supabase.auth.updateUser({
        data: { phone: phoneInput }
      });
      if (error) throw error;
      setEditingPhone(false);
    } catch (error: any) {
      alert("Error updating phone: " + error.message);
    } finally {
      setUpdatingPhone(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;
      
      alert("Avatar updated successfully! Refresh to see changes across the app.");
    } catch (error: any) {
      alert("Error uploading avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
  <div className="relative min-h-screen overflow-hidden">
    {/* Centered Full-Page Spline Background with global cursor tracking */}
    <div className="fixed inset-0 w-full h-full z-[-1] pointer-events-none">
      <div className="w-full h-full pointer-events-auto">
        {/* @ts-ignore */}
        <spline-viewer events-target="global" loading-anim-type="spinner-small-light" url="https://prod.spline.design/81cToKZs2VBbJXWf/scene.splinecode"></spline-viewer>
      </div>
    </div>
    
    <FloatingOrbs />

    {/* Nav */}
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="relative z-10 container mx-auto flex items-center justify-between py-6"
    >
      <span className="font-display font-semibold text-xl tracking-tight text-foreground">
        Wellness Nudge
      </span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {session ? (
           <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
        ) : (
           <>
             <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
             <Link to="/login" className="btn-primary text-sm">Get Started</Link>
           </>
        )}
      </div>
    </motion.header>

    {/* Hero */}
    <section className="relative z-10 container mx-auto pt-12 pb-20 md:pt-20 md:pb-32">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
            Work deeply.
            <br />
            <span className="text-gradient">Pause gently.</span>
          </h1>
          <p className="text-lg mb-8 leading-relaxed max-w-md" style={{ color: "var(--text-subtle)" }}>
            A calm companion for your workday that reminds you to breathe, stretch, and restore — without adding to
            the noise.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="btn-primary text-base">
              Start for free
            </Link>
            <Link to="/dashboard" className="btn-ghost text-base">
              Explore demo
            </Link>
          </div>
        </motion.div>

        {/* Profile Column (Only if logged in) */}
        <div className="hidden md:block">
          {session && user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-sm mx-auto"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-secondary flex items-center justify-center">
                     {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        <UserIcon className="w-12 h-12 text-muted-foreground" />
                     )}
                   </div>
                   
                   <button 
                     disabled={uploading}
                     onClick={() => fileInputRef.current?.click()}
                     className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                   >
                     <Upload size={20} className="mb-1" />
                     <span className="text-[10px] uppercase font-bold tracking-wider">{uploading ? 'Uploading...' : 'Upload'}</span>
                   </button>
                   <input 
                     type="file" 
                     className="hidden" 
                     ref={fileInputRef} 
                     accept="image/*" 
                     onChange={handleAvatarUpload}
                     disabled={uploading}
                   />
                </div>
                <h3 className="text-xl font-bold font-display text-foreground">{user.user_metadata?.full_name || 'Wellness User'}</h3>
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                
                <div className="w-full bg-secondary/50 rounded-lg p-3 mb-6 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Phone size={12} /> Phone Number
                    </span>
                    {!editingPhone && (
                      <button onClick={() => setEditingPhone(true)} className="text-primary hover:text-primary/80 transition p-1">
                        <Edit2 size={12} />
                      </button>
                    )}
                  </div>
                  {editingPhone ? (
                    <div className="flex items-center gap-2 mt-2">
                       <input 
                         type="tel"
                         value={phoneInput}
                         onChange={(e) => setPhoneInput(e.target.value)}
                         className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary"
                         placeholder="+1 234 567 8900"
                         disabled={updatingPhone}
                       />
                       <button onClick={handlePhoneUpdate} disabled={updatingPhone} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50">
                         <Check size={14} />
                       </button>
                       <button onClick={() => { setEditingPhone(false); setPhoneInput(user.user_metadata?.phone || ""); }} disabled={updatingPhone} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50">
                         <X size={14} />
                       </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {user.user_metadata?.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="w-full space-y-3">
                  <Link to="/dashboard" className="w-full block text-center py-2 px-4 bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-medium transition-colors">
                    Go to Dashboard
                  </Link>
                  <button onClick={() => signOut()} className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-border hover:bg-secondary text-foreground rounded-md transition-colors">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="relative z-10 container mx-auto pb-24">
      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <GlassCard key={f.title} delay={0.6 + i * 0.15} className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <f.icon size={22} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="relative z-10 container mx-auto pb-8 text-center">
      <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
        Designed by Stillpoint. Built to help you pause.
      </p>
    </footer>
  </div>
  );
};

export default Landing;