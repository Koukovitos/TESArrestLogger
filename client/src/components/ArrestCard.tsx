import { format } from "date-fns";
import { User, Shield, Calendar, Scale, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Arrest } from "@shared/schema";
import { motion } from "framer-motion";

interface ArrestCardProps {
  arrest: Arrest;
  index: number;
}

export function ArrestCard({ arrest, index }: ArrestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 hover:bg-card hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/5"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Shield className="w-24 h-24 text-primary" />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(arrest.createdAt), "dd MMM yyyy • HH:mm")}</span>
              <span className="text-muted-foreground">ID: #{arrest.id.toString().padStart(5, '0')}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-display uppercase tracking-wide">
              <span className="text-muted-foreground font-sans normal-case text-sm font-medium mr-1">Suspect:</span>
              {arrest.suspect}
            </h3>
          </div>
          
          <Badge variant="glass" className="self-start">
            {arrest.agency}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-border/40 border-dashed">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider text-xs">
              <User className="w-4 h-4 text-primary" />
              Arresting Officer
            </div>
            <p className="font-mono text-sm pl-6">{arrest.officerName}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider text-xs">
              <Scale className="w-4 h-4 text-destructive" />
              Charges
            </div>
            <div className="flex flex-wrap gap-2 pl-0 md:pl-6">
              {arrest.charges.map((charge, i) => (
                <Badge key={i} variant="secondary" className="border border-border/50">
                  {charge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider text-xs">
            <FileText className="w-4 h-4 text-blue-400" />
            Report Description
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed bg-black/20 p-3 rounded-lg border border-border/30 font-mono">
            {arrest.description}
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-blue-600 transition-all duration-300 group-hover:w-full opacity-50" />
    </motion.div>
  );
}
