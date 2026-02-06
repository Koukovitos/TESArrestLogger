import { Users, Gavel, FileWarning } from "lucide-react";
import type { Arrest } from "@shared/schema";

interface StatsOverviewProps {
  arrests: Arrest[];
}

export function StatsOverview({ arrests }: StatsOverviewProps) {
  const totalArrests = arrests.length;
  const uniqueSuspects = new Set(arrests.map(a => a.suspect)).size;
  const totalCharges = arrests.reduce((acc, curr) => acc + curr.charges.length, 0);

  const stats = [
    {
      label: "Total Arrests",
      value: totalArrests,
      icon: Gavel,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      label: "Unique Suspects",
      value: uniqueSuspects,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      label: "Total Charges Filed",
      value: totalCharges,
      icon: FileWarning,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div 
          key={i}
          className={`p-4 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}
        >
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <stat.icon className={`w-16 h-16 ${stat.color}`} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-background/50 backdrop-blur-md border border-white/5`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold font-display tracking-wide text-foreground">
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
