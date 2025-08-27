import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useBusinessDetails } from '../hooks/useBusinessDetails'
import { Invoice, InvoiceItem } from '../types'
import { two } from '../utils/formatters'
import { COMPANY_LOGO_URL } from '../config/company'

export default function InvoicePrint() {
  const { id } = useParams()
  const { businessDetails } = useBusinessDetails()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchInvoice(id)
    }
  }, [id])

  const fetchInvoice = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*)
        `)
        .eq('id', invoiceId)
        .single()

      if (error) throw error
      setInvoice(data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const getItemTotals = (item: InvoiceItem) => {
    const total = item.quantity * item.unit_price
    const vat = total * (item.vat_rate / 100)
    const amount = total + vat
    return { total, vat, amount }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Invoice not found</p>
        <Link to="/invoices" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Back to Invoices
        </Link>
      </div>
    )
  }

  const subTotal = invoice.subtotal || 0
  const taxAmount = invoice.tax_amount || 0
  const totalAmount = invoice.total_amount || 0
  const currency = businessDetails?.currency || 'R'

  return (
    <div className="space-y-6">
      {/* Print controls */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Invoices
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </button>
          <button
            onClick={() => downloadPdf(invoice.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice template matching the provided design */}
      <div className="min-h-[29.7cm] w-[21cm] mx-auto bg-white p-3 print:p-3 text-black">
        <div className="border-[3px] border-black p-2">
          <div className="text-center text-[11px] font-semibold text-red-600 underline tracking-wide">
            INVOICE NUMBER : {invoice.invoice_number}
          </div>

          <div className="mt-2 grid grid-cols-12 gap-2 items-start">
            <div className="col-span-3 flex items-start">
              {COMPANY_LOGO_URL ? (
                <img
                  src={COMPANY_LOGO_URL}
                  alt="Logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 border-2 border-red-300 border-dashed rounded-sm flex items-center justify-center">
                  <span className="text-xs text-red-400">Logo</span>
                </div>
              )}
            </div>
            <div className="col-span-9 text-right text-[10px] leading-tight">
              <div className="font-semibold">{businessDetails?.name}</div>
              {businessDetails?.address && <div>{businessDetails.address}</div>}
              {businessDetails?.email && <div>CONTACT: {businessDetails.phone || ''} | {businessDetails.email}</div>}
              {businessDetails?.website && <div>{businessDetails.website}</div>}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-12 gap-2 text-[10px] items-start">
            <div className="col-span-7 grid grid-cols-12 gap-1">
              <div className="col-span-4 font-bold text-red-600">BILL TO:</div>
              <div className="col-span-8">{invoice.client?.name || '-'}</div>
              <div className="col-span-4 font-bold text-gray-800">ADDRESS:</div>
              <div className="col-span-8 whitespace-pre-wrap">{invoice.client?.address || '-'}</div>
              <div className="col-span-4 font-bold text-gray-800">PHONE:</div>
              <div className="col-span-8">{invoice.client?.phone || '-'}</div>
            </div>
            <div className="col-span-5">
              <div className="grid grid-cols-12 gap-1">
                <div className="col-span-5 font-bold text-red-600 text-right pr-2">DATE</div>
                <div className="col-span-7">{invoice.issue_date ? format(new Date(invoice.issue_date), 'dd MMM yyyy') : '-'}</div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <table className="w-full border border-black text-[10px]">
              <thead>
                <tr className="bg-white text-red-600">
                  <th className="border border-black px-2 py-1 text-left w-[40%]">Description of goods</th>
                  <th className="border border-black px-2 py-1 text-center w-[8%]">Quantity</th>
                  <th className="border border-black px-2 py-1 text-right w-[16%]">Unit Price with mark</th>
                  <th className="border border-black px-2 py-1 text-right w-[12%]">Total</th>
                  <th className="border border-black px-2 py-1 text-right w-[8%]">VAT</th>
                  <th className="border border-black px-2 py-1 text-right w-[16%]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => {
                  const { total, vat, amount } = getItemTotals(item);
                  return (
                    <tr key={item.id || idx}>
                      <td className="border border-black px-2 py-1 align-top">{item.description || '-'}</td>
                      <td className="border border-black px-2 py-1 text-center">{item.quantity}</td>
                      <td className="border border-black px-2 py-1 text-right">{currency}{two(item.unit_price)}</td>
                      <td className="border border-black px-2 py-1 text-right">{currency}{two(total)}</td>
                      <td className="border border-black px-2 py-1 text-right">{currency}{two(vat)}</td>
                      <td className="border border-black px-2 py-1 text-right font-semibold">{currency}{two(amount)}</td>
                    </tr>
                  );
                })}
                {Array.from({ length: Math.max(0, 8 - (invoice.items?.length || 0)) }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border border-black px-2 py-3">&nbsp;</td>
                    <td className="border border-black px-2 py-3">&nbsp;</td>
                    <td className="border border-black px-2 py-3">&nbsp;</td>
                    <td className="border border-black px-2 py-3">&nbsp;</td>
                    <td className="border border-black px-2 py-3">&nbsp;</td>
                    <td className="border border-black px-2 py-3">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2 grid grid-cols-12 gap-2">
            <div className="col-span-7">
              <div className="border border-black p-2 text-[10px] h-20 flex items-center">
                <div className="w-full grid grid-cols-12">
                  <div className="col-span-3 border-r border-black pr-2">Labour rate {currency}{two(businessDetails?.labour_rate_per_hour ?? 0)}/hr</div>
                  <div className="col-span-9" />
                </div>
              </div>
              <div className="mt-2 border border-black p-2 text-[9px] leading-tight">
                <div className="uppercase text-red-600 font-semibold">Information & client notes.</div>
                <div className="mt-1 whitespace-pre-wrap text-[9px] text-red-600">{invoice.notes || ''}</div>
                {invoice.terms && (
                  <div className="mt-1 whitespace-pre-wrap">{invoice.terms}</div>
                )}
              </div>
            </div>
            <div className="col-span-5">
              <div className="border border-black p-2 text-[10px]">
                <div className="grid grid-cols-2 gap-y-1">
                  <div className="text-right font-medium">Sub Total</div>
                  <div className="text-right">{currency}{two(subTotal)}</div>
                  <div className="text-right font-medium">VAT ({two(invoice.tax_rate || 0)}%)</div>
                  <div className="text-right">{currency}{two(taxAmount)}</div>
                  <div className="col-span-2 border-t border-black my-1" />
                  <div className="text-right font-bold">Total</div>
                  <div className="text-right font-bold">{currency}{two(totalAmount)}</div>
                </div>
              </div>
              <div className="mt-2 border border-black p-2 text-[9px] leading-tight min-h-[120px]">
                <div className="uppercase text-red-600 font-semibold">Banking Details</div>
                <div className="grid grid-cols-12 gap-1 mt-1">
                  <div className="col-span-5 font-semibold">ACCOUNT HOLDER:</div>
                  <div className="col-span-7">{businessDetails?.bank_account_holder || businessDetails?.name}</div>
                  <div className="col-span-5 font-semibold">ACCOUNT TYPE:</div>
                  <div className="col-span-7">{businessDetails?.bank_account_type || 'BUSINESS ACCOUNT'}</div>
                  <div className="col-span-5 font-semibold">ACCOUNT NUMBER:</div>
                  <div className="col-span-7">{businessDetails?.bank_account_number || ''}</div>
                  <div className="col-span-5 font-semibold">BANK NAME:</div>
                  <div className="col-span-7">{businessDetails?.bank_name || ''}</div>
                  <div className="col-span-5 font-semibold">BRANCH CODE:</div>
                  <div className="col-span-7">{businessDetails?.bank_branch_code || ''}</div>
                </div>
                <div className="mt-2 text-right text-[11px] font-semibold">{currency}{two(totalAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function downloadPdf(id: string | undefined) {
  if (!id) return alert('Missing invoice id')
  try {
    // Use the serverless function directly from the same domain
    const res = await fetch(`/api/invoices/${id}/pdf`)
    if (!res.ok) throw new Error('Failed to fetch PDF')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download PDF', err)
    alert('Failed to download PDF')
  }
}