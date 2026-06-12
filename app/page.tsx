import { BottomCta } from "@/components/homepage/BottomCta";
import { DashboardPreview } from "@/components/homepage/DashboardPreview";
import { FeatureShowcase } from "@/components/homepage/FeatureShowcase";
import { Hero } from "@/components/homepage/Hero";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/insforge-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="bg-background">
      <Navbar />
      <div className="page-shell border-x border-border bg-surface">
        <Hero />
        <DashboardPreview />
        <FeatureShowcase />
        <div className="diagonal-divider border-b border-border" />
        <Testimonial />
        <div className="diagonal-divider border-b border-border" />
        <BottomCta />
        <div className="diagonal-divider border-b border-border" />
        <Footer />
      </div>
    </main>
  );
}
