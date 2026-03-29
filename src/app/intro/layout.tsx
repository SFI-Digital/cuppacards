import Providers from "@/components/layout/Providers"

export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
    </Providers>
  )
}
