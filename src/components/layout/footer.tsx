import React from 'react';
import { Crown } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-amber-500/10 bg-[#0a0a14]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Server Info */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span className="text-lg font-bold text-amber-500">JO Server OT</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A modern Open Tibia server experience. Join us for exciting adventures
              in a classic RPG world with new features and a friendly community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-500/80">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="transition-colors hover:text-amber-400 cursor-pointer">Highscores</li>
              <li className="transition-colors hover:text-amber-400 cursor-pointer">Guilds</li>
              <li className="transition-colors hover:text-amber-400 cursor-pointer">Spells</li>
              <li className="transition-colors hover:text-amber-400 cursor-pointer">Forum</li>
            </ul>
          </div>

          {/* Server Status */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-500/80">
              Server Info
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>IP: play.jo-server-ot.com</li>
              <li>Port: 7171</li>
              <li>Client: 13.40</li>
              <li>Status: <span className="text-green-400">Online</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-amber-500/10 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JO Server OT. All rights reserved.</p>
          <p className="mt-1 text-xs text-muted-foreground/50">
            Powered by Open Tibia Server. This is a fan-made project.
          </p>
        </div>
      </div>
    </footer>
  );
}
