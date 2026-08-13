export default function GameshowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Its own dark stage theme, independent of the portfolio's beige.
  return <div className="min-h-svh bg-[#0a0e1c] text-slate-100">{children}</div>;
}
