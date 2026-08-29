import ThemeFooter from "./ThemeFooter";
import ThemeHeader from "./ThemeHeader";

export default function ThemeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#111c2d]">
      <ThemeHeader />
      {children}
      <ThemeFooter />
    </div>
  );
}
