import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProgressBar from '@/components/layout/ProgressBar'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ProgressBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </ThemeProvider>
  )
}
