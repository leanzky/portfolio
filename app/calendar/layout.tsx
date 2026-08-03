export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-svh bg-background text-foreground">{children}</div>;
}
