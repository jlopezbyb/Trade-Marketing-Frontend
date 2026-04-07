"use client"

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs text-muted-foreground text-center">
        <span>
          © {year} B&B Informática - Desarrollo
        </span>
        <span className="hidden sm:inline">
          Sistema de Inventarios y Trade Marketing
        </span>
      </div>
    </footer>
  )
}
