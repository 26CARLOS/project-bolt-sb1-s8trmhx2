import React, { useState } from 'react'
import { Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { useBusinessDetails } from '../hooks/useBusinessDetails'

export default function Settings() {
  const { businessDetails, loading, updateBusinessDetails } = useBusinessDetails()
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    name: businessDetails?.name || '',
    address: businessDetails?.address || '',
    phone: businessDetails?.phone || '',
    email: businessDetails?.email || '',
    website: businessDetails?.website || '',
    logo_url: businessDetails?.logo_url || '',
    labour_rate_per_hour: businessDetails?.labour_rate_per_hour || 0,
    bank_account_holder: businessDetails?.bank_account_holder || '',
    bank_account_type: businessDetails?.bank_account_type || 'BUSINESS ACCOUNT',
    bank_account_number: businessDetails?.bank_account_number || '',
    bank_name: businessDetails?.bank_name || '',
    bank_branch_code: businessDetails?.bank_branch_code || '',
    currency: businessDetails?.currency || 'R',
    default_vat_rate: businessDetails?.default_vat_rate || 15.00,
    invoice_terms: businessDetails?.invoice_terms || ''
  })

  React.useEffect(() => {
    if (businessDetails) {
      setFormData({
        name: businessDetails.name || '',
        address: businessDetails.address || '',
        phone: businessDetails.phone || '',
        email: businessDetails.email || '',
        website: businessDetails.website || '',
        logo_url: businessDetails.logo_url || '',
        labour_rate_per_hour: businessDetails.labour_rate_per_hour || 0,
        bank_account_holder: businessDetails.bank_account_holder || '',
        bank_account_type: businessDetails.bank_account_type || 'BUSINESS ACCOUNT',
        bank_account_number: businessDetails.bank_account_number || '',
        bank_name: businessDetails.bank_name || '',
        bank_branch_code: businessDetails.bank_branch_code || '',
        currency: businessDetails.currency || 'R',
        default_vat_rate: businessDetails.default_vat_rate || 15.00,
        invoice_terms: businessDetails.invoice_terms || ''
      })
    }
  }, [businessDetails])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateBusinessDetails(formData)
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      return alert('Please upload a PNG, JPG, SVG, or WEBP image')
    }
    const maxBytes = 2 * 1024 * 1024 // 2MB
    if (file.size > maxBytes) {
      return alert('File too large (max 2MB)')
    }
    try {
      setUploadingLogo(true)
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const uploadRes = await fetch(`${import.meta.env.VITE_PDF_SERVER_URL || 'http://localhost:4000'}/api/logo`, {
        method: 'POST',
        body: formDataUpload
      })
      if (!uploadRes.ok) {
        const msg = await uploadRes.text().catch(() => '')
        throw new Error(msg || 'Upload failed')
      }
      const { url: publicUrl } = await uploadRes.json()
      setFormData(prev => ({ ...prev, logo_url: publicUrl }))
      await updateBusinessDetails({ logo_url: publicUrl })
    } catch (err) {
      console.warn('Server upload failed, trying client-side upload...', err)
      // Fallback: client-side upload using Supabase Storage (requires public read + authenticated write to 'logos' bucket)
      try {
        // @ts-ignore: File API
        const ext = (file.name?.split('.').pop() || 'png').toLowerCase()
        const pathKey = `logos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        // Attempt to upload via client supabase
        // Note: This requires the user/session to have permission to write to 'logos'
        // If RLS blocks, you must configure a policy in Supabase Storage for 'logos'.
  const { error } = await (await import('../lib/supabase')).supabase.storage.from('logos').upload(pathKey, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })
        if (error) throw error
        const { data: pub } = (await import('../lib/supabase')).supabase.storage.from('logos').getPublicUrl(pathKey)
        const publicUrl = pub.publicUrl
        setFormData(prev => ({ ...prev, logo_url: publicUrl }))
        await updateBusinessDetails({ logo_url: publicUrl })
      } catch (clientErr) {
        console.error('Logo upload failed (client fallback)', clientErr)
        alert('Logo upload failed. Configure server SUPABASE_SERVICE_KEY or set storage policy for client uploads.')
      }
    } finally {
      setUploadingLogo(false)
      // reset the input so same file can be re-selected if needed
      e.target.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Remove the current logo?')) return
    try {
      setSaving(true)
      setFormData(prev => ({ ...prev, logo_url: '' }))
      await updateBusinessDetails({ logo_url: '' })
    } catch (e) {
      alert('Failed to remove logo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brandwhite">Business Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
  <div className="bg-white shadow rounded-lg p-6 text-gray-900">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="mt-1 space-y-3">
                <div className="flex items-center space-x-3">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="h-12 w-auto object-contain border border-gray-200 rounded" />
                  ) : (
                    <div className="h-12 w-12 flex items-center justify-center border border-dashed border-gray-300 rounded">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    />
                    <p className="mt-1 text-xs text-gray-500">Paste a logo URL, or upload a file below (no login required).</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                  {formData.logo_url && (
                    <button type="button" onClick={handleRemoveLogo} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </button>
                  )}
                  <span className="text-xs text-gray-500">PNG/JPG/SVG/WEBP up to 2MB.</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Labour Rate per Hour</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.labour_rate_per_hour}
                onChange={(e) => setFormData(prev => ({ ...prev, labour_rate_per_hour: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>

        {/* Banking Details */}
  <div className="bg-white shadow rounded-lg p-6 text-gray-900">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Banking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Holder</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bank_account_holder}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_account_holder: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bank_account_type}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_account_type: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bank_account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_account_number: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bank_name}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch Code</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bank_branch_code}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_branch_code: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
  <div className="bg-white shadow rounded-lg p-6 text-gray-900">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Invoice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency Symbol</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default VAT Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.default_vat_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, default_vat_rate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Default Invoice Terms</label>
              <textarea
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.invoice_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_terms: e.target.value }))}
                placeholder="Payment terms, conditions, etc..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brandwhite bg-accent hover:bg-accent/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}