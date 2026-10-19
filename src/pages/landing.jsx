import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Link2, QrCode, BarChart3, ArrowRight, Sparkles} from "lucide-react";

const LandingPage = () => {
  const [longUrl, setLongUrl] = useState("");
  const navigate = useNavigate();

  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl.trim()) {
      navigate(`/auth?createNew=${encodeURIComponent(longUrl.trim())}`);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center pt-6 sm:pt-12 space-y-6 w-full max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The Next-Generation URL Shortener & Analytics</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
          Short links.{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-cyan-300 dark:to-teal-300 bg-clip-text text-transparent">
            Clear insights.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
          Shorten long URLs, create shareable QR codes, and understand your audience with clear, actionable analytics.
        </p>

        {/* Shorten Form */}
        <form
          onSubmit={handleShorten}
          className="w-full flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-card border border-border shadow-lg shadow-black/5 dark:shadow-none"
        >
          <div className="relative w-full flex-1">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="url"
              required
              placeholder="Paste your loooong URL here..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="h-12 pl-12 pr-4 border-none bg-transparent shadow-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all shrink-0"
          >
            <span>Shorten</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="flex flex-col p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/40 transition-colors space-y-3">
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Link2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Custom Short Links</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create memorable, branded URLs with custom slugs that enhance click-through rates.
          </p>
        </div>

        <div className="flex flex-col p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/40 transition-colors space-y-3">
          <div className="h-11 w-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <QrCode className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Instant QR Codes</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Automatically generate downloadable QR codes for mobile users and offline marketing campaigns.
          </p>
        </div>

        <div className="flex flex-col p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/40 transition-colors space-y-3">
          <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Actionable Analytics</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Track real-time click volume, geographic locations, and device types to optimize your audience reach.
          </p>
        </div>
      </section>

      {/* Product Preview Banner */}
      <section className="w-full flex flex-col items-center space-y-4">
        <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-none p-1.5 sm:p-3">
          <img
            src="/banner1.jpg"
            className="w-full h-auto rounded-xl object-cover"
            alt="Trimrr Product Showcase"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Everything you need to know about using Trimrr.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem
            value="item-1"
            className="border border-border rounded-xl px-5 py-1 bg-card shadow-sm"
          >
            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
              How does the Trimrr URL shortener work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              When you enter a long URL, our system generates a shorter version of that URL with a unique 6-character slug or a custom alias of your choice. When visitors access the shortened link, they are instantly redirected to the original destination.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-2"
            className="border border-border rounded-xl px-5 py-1 bg-card shadow-sm"
          >
            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
              Do I need an account to use the app?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              Yes. Creating a free account allows you to manage all your URLs in your personal dashboard, download high-resolution QR codes, and inspect click analytics over time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-3"
            className="border border-border rounded-xl px-5 py-1 bg-card shadow-sm"
          >
            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
              What analytics are available for my shortened URLs?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              You can view total click counts, geographic location breakdowns (top cities and countries), and visitor device types (desktop vs. mobile) displayed in interactive visualizations.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default LandingPage;
