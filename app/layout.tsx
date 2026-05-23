import { Fasthand, Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
})

const khmer = Fasthand({
    weight: "400",
    subsets: ["khmer", "latin"],
    variable: "--font-khmer",
    display: "swap",
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                "antialiased",
                fontMono.variable,
                khmer.variable,
                "font-sans",
                geist.variable
            )}
        >
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    )
}
