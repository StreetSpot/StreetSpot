"use client"

import { useState } from "react"
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { menuStore, useMenuItems } from "@/lib/menu-store"

export function VendorMenuEditor() {
  const items = useMenuItems()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !price) return
    menuStore.addItem({
      name,
      price: parseFloat(price) || 0,
      description: description || undefined,
      category: category || undefined,
      available: true,
    })
    setName("")
    setPrice("")
    setDescription("")
    setCategory("")
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Menu & Pricing
      </h3>

      <form onSubmit={handleAdd} className="mb-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Street Taco"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Price $
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Category (optional)
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Tacos, Drinks"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Menu Item
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No menu items yet. Add your first item above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${
                item.available ? "bg-secondary" : "bg-secondary/50 opacity-60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => menuStore.toggleAvailable(item.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                  title={item.available ? "Mark unavailable" : "Mark available"}
                >
                  {item.available ? (
                    <ToggleRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => menuStore.removeItem(item.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
