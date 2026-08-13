import type { Metadata } from "next";
import { CourseRoot } from "@/components/csharp-course/CourseRoot";

export const metadata: Metadata = {
  title: "C# & .NET Career Track | Leandro Francia",
  description: "A private study track for C#, ASP.NET Core, and getting hired as a .NET developer.",
  // A passphrase page has no business in search results.
  robots: { index: false, follow: false },
};

export default function CsharpCoursePage() {
  return <CourseRoot />;
}
