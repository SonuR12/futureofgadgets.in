"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
  lastActiveAt: string
}

export default function UsersAdminTable() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data.users)
    }
    fetchUsers()
  }, [])

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Active</th>
            <th className="p-3">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-b border-border">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                <span
                  className={`inline-flex items-center gap-2 rounded px-2 py-1 text-xs ${
                    u.isActive ? "bg-emerald-500 text-white" : "bg-muted text-foreground"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-white/90" />
                  {u.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-3">{new Date(u.lastActiveAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
