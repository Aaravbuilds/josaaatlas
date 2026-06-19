import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="paper min-h-screen">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
