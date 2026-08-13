export default function CsharpCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The course has its own dark theme, independent of the portfolio's beige.
  return <div className="min-h-svh bg-[#0d0b14] text-violet-50">{children}</div>;
}
