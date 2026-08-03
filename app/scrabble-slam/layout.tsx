export default function ScrabbleSlamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-[#030a04] text-green-400 font-mono">
      {children}
    </div>
  );
}
