"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone } from "lucide-react"

interface RespondentInfoProps {
  onSubmit: (data: { name: string; email: string; phone?: string }) => void
}

export function RespondentInfo({ onSubmit }: RespondentInfoProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (firstName.trim() && lastName.trim() && email.trim()) {
      onSubmit({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim() || undefined,
      })
    }
  }

  const isFormValid = firstName.trim() && lastName.trim() && email.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
          <p className="text-slate-600 mt-2">Please provide your information to begin the assessment</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
                className="w-full"
              />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={!isFormValid || !phone.trim()} size="lg">
              Continue to Assessment Selection
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
