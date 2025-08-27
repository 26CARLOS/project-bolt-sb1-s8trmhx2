import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Client } from '../types'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single()

      if (error) throw error
      await fetchClients()
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create client')
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchClients()
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update client')
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchClients()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete client')
    }
  }

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  }
}