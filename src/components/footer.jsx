const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-sm py-8 px-4 mt-20 transition-colors duration-200">
      <div className="container mx-auto flex flex-col items-center justify-center text-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-medium text-muted-foreground">
          <img src="/logo.png" alt="Trimrr" className="h-5 w-5 rounded object-contain" />
          <span className="font-semibold text-foreground tracking-tight">Trimrr</span>
          <span className="text-primary font-normal">—</span>
          <span>Short links. Clear insights.</span>
        </div>
        <p className="text-xs text-muted-foreground/80 font-normal tracking-wide">
          Built for every click.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
