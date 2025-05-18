"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    biometricAuth: false,
    autoLock: true
  })

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting]
      }
      // TODO: Implement actual settings update logic
      toast.success("Settings updated successfully")
      return newSettings
    })
  }

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    window.location.href = "/"
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="bg-[#2b2f45]">
        <CardHeader>
          <CardTitle>Security & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-400">
                  Receive notifications about transactions
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={() => handleSettingChange('notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Biometric Authentication</Label>
                <p className="text-sm text-gray-400">
                  Use fingerprint or face ID for transactions
                </p>
              </div>
              <Switch
                checked={settings.biometricAuth}
                onCheckedChange={() => handleSettingChange('biometricAuth')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Lock</Label>
                <p className="text-sm text-gray-400">
                  Automatically lock wallet after 5 minutes
                </p>
              </div>
              <Switch
                checked={settings.autoLock}
                onCheckedChange={() => handleSettingChange('autoLock')}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Wallet Information</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Version</p>
                <p>1.0.0</p>
              </div>
            </div>
          </div>

          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
