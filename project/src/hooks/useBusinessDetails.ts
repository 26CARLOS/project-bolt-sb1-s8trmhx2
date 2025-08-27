import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BusinessDetails } from '../types'

export function useBusinessDetails() {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBusinessDetails()
  }, [])

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('business_details')
        .select('*')
        .single()

      if (error) throw error
      setBusinessDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business details')
    } finally {
      setLoading(false)
    }
  }

  const updateBusinessDetails = async (updates: Partial<BusinessDetails>) => {
    try {
      const { data, error } = await supabase
        .from('business_details')
        .update(updates)
        .eq('id', businessDetails?.id)
        .select()
        .single()

      if (error) throw error
      setBusinessDetails(data)
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update business details')
    }
  }

  return {
    businessDetails,
    loading,
    error,
    updateBusinessDetails,
    refetch: fetchBusinessDetails
  }
}