const Footer = () => {
  return (
    <footer className="w-full border-t border-[#1E293B] bg-[#020817] py-6 px-4 mt-16">
      <div className="container mx-auto flex flex-col items-center justify-center text-center gap-1.5">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-medium text-[#94A3B8]">
          <img src="/logo.png" alt="Trimrr" className="h-5 w-5 rounded object-contain" />
          <span className="font-semibold text-white tracking-tight">Trimrr</span>
          <span className="text-[#55D6D0] font-normal">—</span>
          <span>Short links. Clear insights.</span>
        </div>
        <p className="text-xs text-[#94A3B8]/80 font-normal tracking-wide">
          Built for every click.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
