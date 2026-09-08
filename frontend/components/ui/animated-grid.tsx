"use client";

import React from "react";

export function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base Technical Grid Pattern */}
      <div className="absolute inset-0 bg-grid-technical" />

      {/* Subtle Radial Gradient to soften grid at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(248,250,247,0.85)_80%,#f8faf7_100%)]" />

      {/* Animated Subtle Horizontal Scanning Beam */}
      <div className="absolute left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#2e633f]/[0.04] to-transparent animate-scanline pointer-events-none" />

      {/* Floating Animated Grid Nodes */}
      <div
        className="absolute top-24 left-[15%] w-2 h-2 rounded-full bg-[#2e633f]/30 animate-pulse-node"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-48 left-[45%] w-2.5 h-2.5 rounded-full bg-[#2e633f]/40 animate-pulse-node"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-80 right-[25%] w-2 h-2 rounded-full bg-[#2e633f]/30 animate-pulse-node"
        style={{ animationDelay: "2.8s" }}
      />
      <div
        className="absolute bottom-32 left-[30%] w-2.5 h-2.5 rounded-full bg-[#2e633f]/35 animate-pulse-node"
        style={{ animationDelay: "0.8s" }}
      />
      <div
        className="absolute bottom-48 right-[15%] w-2 h-2 rounded-full bg-[#2e633f]/30 animate-pulse-node"
        style={{ animationDelay: "2.1s" }}
      />
    </div>
  );
}
