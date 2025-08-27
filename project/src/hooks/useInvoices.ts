import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Invoice } from '../types'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchInvoices()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete invoice')
    }
  }

  return {
    invoices,
    loading,
    error,
    deleteInvoice,
    refetch: fetchInvoices
  }
}