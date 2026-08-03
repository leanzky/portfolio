import { NeonMesh } from "@/components/ui/neon-mesh";

export default function ScrabbleSlamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh text-green-400 font-mono">
      {/* Ambient animated background: a subtle 3D wireframe mesh in a
          matching "computer green" palette. Fixed and non-interactive
          layering-wise so it never blocks clicks on the game above it —
          it still reacts to mouse movement over any empty screen space. */}
      <div className="fixed inset-0 -z-10 bg-[#030a04]">
        <NeonMesh
          title=""
          subtitle=""
          description=""
          meshColorDark="34, 197, 94"
          meshColorLight="34, 197, 94"
          accentColor="#39FF14"
          backgroundColor="#030a04"
        />
      </div>
      {children}
    </div>
  );
}
