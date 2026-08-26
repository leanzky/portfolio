export default function AO2ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A self-contained study aid with its own document-styled theme,
  // independent of the portfolio's beige/yellow look.
  return <div className="min-h-svh bg-white text-[#101828]">{children}</div>;
}
