import { useState } from "react";
import { useArrests } from "@/hooks/use-arrests";
import { Header } from "@/components/layout/Header";
import { ArrestCard } from "@/components/ArrestCard";
import { StatsOverview } from "@/components/StatsOverview";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: arrests, isLoading, error } = useArrests();
  const [search, setSearch] = useState("");

  const filteredArrests = arrests?.filter(arrest => 
    arrest.suspect.toLowerCase().includes(search.toLowerCase()) ||
    arrest.officerName.toLowerCase().includes(search.toLowerCase()) ||
    arrest.id.toString().includes(search)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground font-mono animate-pulse uppercase tracking-widest text-sm">
          Accessing Secure Database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive font-display uppercase tracking-widest mb-2">System Error</h2>
          <p className="text-muted-foreground">Unable to retrieve arrest records. Connection to mainframe failed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 container px-4 md:px-8 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white font-display uppercase tracking-wide text-glow">
                Arrest Log
              </h1>
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                Authorized Personnel Only • Clearance Level 3
              </p>
            </div>

            <div className="w-full md:w-96 relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="SEARCH DATABASE (SUSPECT / OFFICER / ID)"
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm uppercase placeholder:text-muted-foreground/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
            </div>
          </div>

          <StatsOverview arrests={arrests || []} />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-xs font-mono uppercase text-muted-foreground tracking-widest">
                Latest Entries
              </span>
              <span className="text-xs font-mono text-primary">
                {filteredArrests?.length} Records Found
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {filteredArrests && filteredArrests.length > 0 ? (
                  filteredArrests.map((arrest, index) => (
                    <ArrestCard key={arrest.id} arrest={arrest} index={index} />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 border border-dashed border-border/30 rounded-2xl bg-card/30"
                  >
                    <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-mono uppercase tracking-widest">No matching records found</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-muted-foreground font-mono uppercase tracking-wider">
          <p>© 2025 TES Police Department. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Secure Connection Established</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
