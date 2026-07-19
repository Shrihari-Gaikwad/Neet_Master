import Link from "next/link";
import { HeroSection } from "@/components/landing/HeroSection";
import { FloatingElements } from "@/components/landing/FloatingElements";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { InteractiveMockup } from "@/components/landing/InteractiveMockup";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/30">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <FloatingElements />

      <main className="flex-grow flex flex-col items-center justify-center relative z-10 w-full">
        <HeroSection />
        
        <StatsSection />
        
        <FeatureCards />
        
        <InteractiveMockup />

        <Testimonials />
        
        <FAQ />

        {/* Final CTA Section */}
        <section className="py-32 w-full relative z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Your AI Mentor for <br /> Every NEET Chapter
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Search. Learn. Practice. Analyze. Improve. Join the waitlist today and crack NEET with confidence.
              </p>
              
              <Link
                href="/login"
                className="inline-flex h-16 items-center justify-center rounded-2xl bg-foreground px-12 text-lg font-bold text-background transition-transform hover:scale-105 active:scale-95 shadow-2xl shadow-foreground/20"
              >
                Start Preparing Today
              </Link>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
