'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getClient, updateClient } from "@/lib/api/clients"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Building2, Mail, User, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function EditClientPage({ params }: { params: Promise<{ id: number }> }) {
  const router = useRouter()
  const [clientId, setClientId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [logo, setLogo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params
      setClientId(id)
      try {
        const client = await getClient(id)
        setFormData({
          name: client.name,
          email: client.email || '',
          company: client.company || '',
          phone: (client as any).phone || '',
        })
        setLogo((client as any).logo || null)
      } catch {
        setError('Client not found')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogoUpload = async (url: string) => {
    if (clientId === null) return
    setLogo(url)
    await updateClient(clientId, { logo: url } as any)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (clientId === null) return
    setLoading(true)
    setError('')
    try {
      await updateClient(clientId, { ...formData, logo } as any)
      toast.success('Client updated successfully.')
      router.push(`/clients/${clientId}`)
    } catch (err: any) {
      setError(err.message || "Failed to update client")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p className="text-sm text-muted-foreground">Loading client...</p>
        </div>
      </div>
    )
  }
  if (error && !formData.name) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <Link href="/clients" className="text-xs text-muted-foreground underline">Back to clients</Link>
      </div>
    </div>
  )

  const initials = formData.name ? formData.name.substring(0, 2).toUpperCase() : 'CL'

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 md:px-6 space-y-6 pb-20">
      {/* Back */}
      <Link
        href={clientId ? `/clients/${clientId}` : '/clients'}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Client
      </Link>

      {/* Header with logo upload */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <AvatarUpload
          currentImage={logo}
          fallback={initials}
          onUpload={handleLogoUpload}
          size="xl"
          bucket="avatars"
          folder="clients"
        />
        <div>
          <h1 className="text-2xl font-black tracking-tight">{formData.name || 'Edit Client'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Click the logo to upload a new one</p>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border border-border/30 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
            <CardDescription>Update the client's details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="client@company.com"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Company
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company name"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={clientId ? `/clients/${clientId}` : '/clients'}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


export default function EditClientPage ({ params }: { params: Promise<{ id: number }> }) {
    const router = useRouter()
    const [ loading, setLoading ] = useState<boolean>(true)
    const [error, setError ] = useState<string>('')
    const [formData, setFormData ] = useState({
        name: '',
        email: '',
        company: '',
    })
    const [initialLoading, setInitialLoading ] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { id } = await params

            try{
                const client = await getClient(id)
                setFormData({
                    name: client.name,
                    email: client.email || '',
                    company: client.company || ''
                })
            }catch (err: any) {
                setError('Client not found')
            }finally {
                setInitialLoading(false)
            }
        }
        fetchData()
    }, [params])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try{
            const { id } = await params
            await updateClient(id, formData)
            toast.success('Client updated successfully.')
            router.push(`/clients/${id}`)
        }catch (err: any) {
            setError(err.message || "Failed to update client")
        }finally {
            setLoading(false)
        }
    }

    if (initialLoading) return <div className={'p-6'}>Loading...</div>
    if (error) return <div className={'p-6 text-red-500'}>{error}</div>

    return (
        <div className={"max-w-md mx-auto mt-10 p-6 bg-white rounded shadow"}>
            <h1 className={'text-2xl font-bold mb-4'}>
                Edit Client
            </h1>
            <form onSubmit={handleSubmit} className={'space-y-4'} >
                <div>
                <label className='block text-sm font-medium'>Name *
                    <Input
                        name={'name'}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        />
                </label>
                    </div>
                    <div>
                        <label className='block text-sm font-medium'> Email
                            <Input
                                name={'email'}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label className='block text-sm font-medium'>Company
                            <Input
                                name={'company'}
                                value={formData.company}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={'w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )



}