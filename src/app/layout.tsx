import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tournify — The Operating System for Youth Sports Tournaments",
    template: "%s | Tournify",
  },
  description:
    "Tournify is the modern platform for organizing youth and amateur sports tournaments. Smart scheduling, live results, real-time standings, and mobile-first design.",
  keywords: ["tournament", "sports", "schedule", "football", "youth", "organizer"],
  openGraph: {
    title: "Tournify",
    description: "The Operating System for Youth Sports Tournaments",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
