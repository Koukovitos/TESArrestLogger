import { ShieldAlert } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
            <ShieldAlert className="h-6 w-6 text-primary animate-pulse" />
            <div className="absolute inset-0 rounded-lg bg-primary/10 animate-ping opacity-20" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-widest text-foreground font-display">
              TES P.D.
            </span>
            <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
              Law Enforcement Dashboard
            </span>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-500 uppercase tracking-wider">System Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
