import { Link } from "react-router-dom";
import { FileText, Users, DollarSign, Plus } from "lucide-react";
import { useInvoices } from "../hooks/useInvoices";
import { useClients } from "../hooks/useClients";
import { formatCurrency } from "../utils/formatters";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { clients, loading: clientsLoading } = useClients();
  const navigate = useNavigate();

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + (invoice.total_amount || 0),
    0
  );
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const paidRevenue = paidInvoices.reduce(
    (sum, invoice) => sum + (invoice.total_amount || 0),
    0
  );

  const stats = [
    {
      name: "Total Invoices",
      value: invoices.length,
      icon: FileText,
      color: "bg-accent",
    },
    {
      name: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "bg-primary",
    },
    {
      name: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "bg-accent",
    },
    {
      name: "Paid Revenue",
      value: formatCurrency(paidRevenue),
      icon: DollarSign,
      color: "bg-primary",
    },
  ];

  const recentInvoices = invoices.slice(0, 5);

  if (invoicesLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: "var(--color-accent)" }}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-brandwhite">MG AUTO CARE INVOICE SYSTEM</h1>
        <Link
          to="/invoices/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brandwhite bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-lg shadow border border-gray-200 text-gray-900"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white shadow rounded-lg text-gray-900">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
              {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {navigate(`/invoices/${invoice.id}`)}}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="text-sm font-medium text-accent hover:text-accent/90"
                      >
                        #{invoice.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client?.name || "Unknown Client"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : invoice.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No invoices found.{" "}
                    <Link
                      to="/invoices/new"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Create your first invoice
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
