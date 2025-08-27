import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useClients } from '../hooks/useClients'
import { useBusinessDetails } from '../hooks/useBusinessDetails'
import { InvoiceFormData, Invoice } from '../types'

export default function InvoiceForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { clients } = useClients()
  const { businessDetails } = useBusinessDetails()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    status: 'draft',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: businessDetails?.default_vat_rate || 15,
    notes: '',
    terms: businessDetails?.invoice_terms || '',
    items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: businessDetails?.default_vat_rate || 15 }]
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      fetchInvoice(id)
    }
  }, [id, isEdit])

  const fetchInvoice = async (invoiceId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('id', invoiceId)
        .single()

      if (error) throw error

      setFormData({
        client_id: data.client_id,
        status: data.status,
        issue_date: data.issue_date,
        due_date: data.due_date || '',
        tax_rate: data.tax_rate,
        notes: data.notes || '',
        terms: data.terms || '',
        items: data.items?.length ? data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          vat_rate: item.vat_rate
        })) : [{ description: '', quantity: 1, unit_price: 0, vat_rate: businessDetails?.default_vat_rate || 15 }]
      })
    } catch (error) {
      console.error('Error fetching invoice:', error)
      alert('Failed to load invoice')
      navigate('/invoices')
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, vat_rate: businessDetails?.default_vat_rate || 15 }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_id) {
      alert('Please select a client')
      return
    }

    try {
      setSaving(true)
      
      if (isEdit && id) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            client_id: formData.client_id,
            status: formData.status,
            issue_date: formData.issue_date,
            due_date: formData.due_date || null,
            tax_rate: formData.tax_rate,
            notes: formData.notes,
            terms: formData.terms
          })
          .eq('id', id)

        if (invoiceError) throw invoiceError

        // Delete existing items and create new ones
        await supabase.from('invoice_items').delete().eq('invoice_id', id)
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(formData.items.map(item => ({
            invoice_id: id,
            ...item
          })))

        if (itemsError) throw itemsError
      } else {
        // Create new invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert([{
            client_id: formData.client_id,
            status: formData.status,
            issue_date: formData.issue_date,
            due_date: formData.due_date || null,
            tax_rate: formData.tax_rate,
            notes: formData.notes,
            terms: formData.terms
          }])
          .select()
          .single()

        if (invoiceError) throw invoiceError

        // Add items
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(formData.items.map(item => ({
            invoice_id: invoice.id,
            ...item
          })))

        if (itemsError) throw itemsError
      }

      navigate('/invoices')
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Failed to save invoice')
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Invoices
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Invoice' : 'Create New Invoice'}
        </h1>
      </div>

  <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6 text-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client *</label>
            <select
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.client_id}
              onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Date *</label>
            <input
              type="date"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.issue_date}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.tax_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">VAT Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.vat_rate}
                    onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Terms</label>
            <textarea
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-brandwhite bg-accent hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (isEdit ? 'Update Invoice' : 'Create Invoice')}
          </button>
        </div>
      </form>
    </div>
  )
}