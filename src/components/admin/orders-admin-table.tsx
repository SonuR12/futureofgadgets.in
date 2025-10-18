"use client"

import { useEffect, useState } from "react"

export default function OrdersAdminTable() {
  const [data, setData] = useState<{orders: any[]}>()

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetch("/api/orders")
      const result = await response.json()
      setData(result)
    }
    fetchOrders()
  }, [])

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="p-3">Order ID</th>
            <th className="p-3">Created</th>
            <th className="p-3">Items</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Delivery</th>
            <th className="p-3">Email</th>
          </tr>
        </thead>
        <tbody>
          {data?.orders?.map((o: any) => (
            <tr key={o.id} className="border-b border-border">
              <td className="p-3 font-mono text-xs">{o.id}</td>
              <td className="p-3">{new Date(o.createdAt).toLocaleString()}</td>
              <td className="p-3">
                <div>
                  {o.items?.map((it: any, idx: number) => (
                    <div key={idx} className="text-xs mb-1">
                      {it.qty}x {it.productId}{it.color ? ` (${it.color})` : ''}
                    </div>
                  ))}
                </div>
              </td>
              <td className="p-3">₹{(o.total / 100).toFixed(2)}</td>
              <td className="p-3">{o.status}</td>
              <td className="p-3">{new Date(o.deliveryDate).toLocaleDateString()}</td>
              <td className="p-3">{o.userEmail || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
