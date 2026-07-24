'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { ROLE_META } from '@/lib/data'

export function ProfileForm() {
  const meta = ROLE_META.student
  const { toast } = useToast()
  const [form, setForm] = useState({
    firstName: 'Ελένη',
    lastName: 'Παπαδοπούλου',
    am: '3180142',
    email: 'e.papadopoulou@uni.gr',
    phone: '+30 694 123 4567',
    address: 'Πανεπιστημιούπολη, Κτίριο Β',
  })

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Το προφίλ ενημερώθηκε',
      description: 'Οι αλλαγές αποθηκεύτηκαν (ενδεικτικό).',
      variant: 'success',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <Avatar name={meta.person} className="size-20 text-2xl" />
          <h3 className="mt-4 font-serif text-lg font-semibold">{meta.person}</h3>
          <p className="text-sm text-muted-foreground">{meta.detail}</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <form onSubmit={save}>
          <CardHeader>
            <CardTitle>Προσωπικά στοιχεία</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Όνομα</Label>
              <Input id="firstName" value={form.firstName} onChange={update('firstName')} />
            </div>
            <div>
              <Label htmlFor="lastName">Επώνυμο</Label>
              <Input id="lastName" value={form.lastName} onChange={update('lastName')} />
            </div>
            <div>
              <Label htmlFor="am">Αριθμός Μητρώου</Label>
              <Input id="am" value={form.am} onChange={update('am')} disabled />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={update('email')} />
            </div>
            <div>
              <Label htmlFor="phone">Τηλέφωνο</Label>
              <Input id="phone" value={form.phone} onChange={update('phone')} />
            </div>
            <div>
              <Label htmlFor="address">Διεύθυνση</Label>
              <Input id="address" value={form.address} onChange={update('address')} />
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-4">
            <Button type="submit">
              <Save className="size-4" />
              Αποθήκευση αλλαγών
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
