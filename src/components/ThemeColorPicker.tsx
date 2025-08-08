"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Palette, Save, RotateCcw } from "lucide-react"

interface ColorVariable {
  name: string
  label: string
  description: string
}

const colorVariables: ColorVariable[] = [
  { name: "--primary", label: "Primary Color", description: "Main brand color for buttons and links" },
  { name: "--background", label: "Background", description: "Main page background color" },
  { name: "--foreground", label: "Foreground", description: "Main text color" },
  { name: "--card", label: "Card Background", description: "Card and panel background color" },
  { name: "--accent", label: "Accent", description: "Secondary accent color" },
  { name: "--border", label: "Border", description: "Border and divider colors" },
]

export function ThemeColorPicker() {
  const { theme, setTheme } = useTheme()
  const [customColors, setCustomColors] = React.useState<Record<string, string>>({})
  const [isCustomTheme, setIsCustomTheme] = React.useState(false)

  React.useEffect(() => {
    setIsCustomTheme(theme === "custom")
    
    // If user switches away from custom theme, clear custom colors
    if (theme !== "custom") {
      setCustomColors({})
      // Remove any custom CSS properties
      colorVariables.forEach(colorVar => {
        document.documentElement.style.removeProperty(colorVar.name)
      })
    }
  }, [theme])

  const handleColorChange = (variable: string, color: string) => {
    setCustomColors(prev => ({
      ...prev,
      [variable]: color
    }))

    // Apply color immediately to document
    if (isCustomTheme) {
      document.documentElement.style.setProperty(variable, color)
    }
  }

  const applyCustomTheme = () => {
    setTheme("custom")
    
    // Apply all custom colors
    Object.entries(customColors).forEach(([variable, color]) => {
      document.documentElement.style.setProperty(variable, color)
    })
  }

  const resetColors = () => {
    setCustomColors({})
    // Reset to system theme (default)
    setTheme("system")
    // Clear localStorage
    localStorage.removeItem("customThemeColors")
    // Remove custom class and reset to default
    document.documentElement.className = ""
  }

  const saveTheme = () => {
    // Save to localStorage for persistence
    localStorage.setItem("customThemeColors", JSON.stringify(customColors))
    // You could also save to database here
  }

  React.useEffect(() => {
    // Load saved custom colors
    const saved = localStorage.getItem("customThemeColors")
    if (saved) {
      setCustomColors(JSON.parse(saved) as Record<string, string>)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Custom Theme Colors
        </CardTitle>
        <CardDescription>
          Customize your theme colors. Changes are applied immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorVariables.map((colorVar) => (
            <div key={colorVar.name} className="space-y-2">
              <Label htmlFor={colorVar.name} className="text-sm font-medium">
                {colorVar.label}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={colorVar.name}
                  type="color"
                  value={customColors[colorVar.name] ?? "#000000"}
                  onChange={(e) => handleColorChange(colorVar.name, e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={customColors[colorVar.name] ?? ""}
                  onChange={(e) => handleColorChange(colorVar.name, e.target.value)}
                  placeholder="Enter color value"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {colorVar.description}
              </p>
            </div>
          ))}
        </div>

                 <div className="flex gap-2 pt-4 border-t">
           <Button onClick={applyCustomTheme} className="flex items-center gap-2">
             <Palette className="h-4 w-4" />
             Apply Custom Theme
           </Button>
           <Button variant="outline" onClick={saveTheme} className="flex items-center gap-2">
             <Save className="h-4 w-4" />
             Save Theme
           </Button>
           <Button 
             variant="outline" 
             onClick={resetColors} 
             className="flex items-center gap-2"
             title="Reset to System theme and clear custom colors"
           >
             <RotateCcw className="h-4 w-4" />
             Reset to System
           </Button>
         </div>

        {isCustomTheme && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Custom theme is currently active. Use the color pickers above to modify colors.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
