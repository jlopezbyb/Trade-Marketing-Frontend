"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <img src="/images/byb-logo.svg" alt="BYB" className="h-12 mb-2" />
        <h1 className="text-2xl font-bold text-foreground">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          La página que estás buscando no existe o fue movida.
        </p>
        <Button asChild className="mt-2">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
