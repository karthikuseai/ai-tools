import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import ToolsGrid from "@/components/tools-grid";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <ToolsGrid />
      <Footer />
    </div>
  );
}
