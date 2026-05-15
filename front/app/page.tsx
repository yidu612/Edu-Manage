import { Header } from "@/app/(src)/components/layout/Header";
import { Footer } from "@/app/(src)/components/layout/Footer";
import { HeroSection } from "@/app/(src)/components/home/HeroSection";
import { FeaturesSection } from "@/app/(src)/components/home/FeaturesSection";
import { RolesSection } from "@/app/(src)/components/home/RolesSection";
import { CTASection } from "./(src)/components/home/CTASection";
import { Metadata } from "next";

// Next.js handles SEO via the metadata object
export const metadata: Metadata = {
  title: "University Project Hub | Streamline Academic Excellence",
  description: "The comprehensive platform for managing university project proposals, reviews, and collaboration.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 
         Note: If you move Header and Footer to your RootLayout (layout.tsx), 
         you should remove them from here to avoid duplication.
      */}
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <RolesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}