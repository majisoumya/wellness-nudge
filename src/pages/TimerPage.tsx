import FloatingOrbs from "@/components/FloatingOrbs";
import AppNav from "@/components/AppNav";
import WorkTimerWidget from "@/components/WorkTimerWidget";

const TimerPage = () => (
  <div className="gradient-radial-bg relative">
    <FloatingOrbs />
    <div className="relative z-10 container mx-auto py-6">
      <AppNav />
      <div className="max-w-lg mx-auto pt-8">
        <WorkTimerWidget workMinutes={25} breakMinutes={5} />
      </div>
    </div>
  </div>
);

export default TimerPage;
