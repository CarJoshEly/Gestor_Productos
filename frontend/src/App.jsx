import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:4000/api/products'

function App() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ id: '', name: '', description: '', price: '' })
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const res = await fetch(API_BASE)
    const data = await res.json()
    setProducts(data)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price)
    }
    if (form.id) {
      await fetch(`${API_BASE}/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } else {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }
    resetForm()
    loadProducts()
  }

  function resetForm() {
    setForm({ id: '', name: '', description: '', price: '' })
  }

  function editProduct(p) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price.toString()
    })
  }

  function openDeleteModal(product) {
    setDeleteModal({ show: true, product })
  }

  function closeDeleteModal() {
    setDeleteModal({ show: false, product: null })
  }

  async function confirmDelete() {
    if (deleteModal.product) {
      await fetch(`${API_BASE}/${deleteModal.product.id}`, { method: 'DELETE' })
      loadProducts()
      closeDeleteModal()
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Productos</h1>
          <p>Administra tu inventario de forma fácil y rápida</p>
        </div>
      </header>

      <div className="main-content">
        <div className="form-section">
          <div className="form-card">
            <h2>{form.id ? 'Editar Producto' : '➕ Agregar Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <input type="hidden" name="id" value={form.id} />
              <div className="form-group">
                <label htmlFor="name">Nombre del Producto</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Ej: Laptop, Mouse, Teclado..."
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe el producto..."
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Precio (L)</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  placeholder="0.00"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  {form.id ? 'Actualizar' : 'Guardar'}
                </button>
                {form.id && (
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="products-section">
          <h2>Productos ({products.length})</h2>
          {products.length === 0 ? (
            <div className="empty-state">
              <p>📭 No hay productos aún. ¡Agrega uno para comenzar!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-header">
                    <h3>{p.name}</h3>
                    <span className="product-id">ID: {p.id}</span>
                  </div>
                  <p className="product-description">{p.description || 'Sin descripción'}</p>
                  <div className="product-price">L{p.price.toFixed(2)}</div>
                  <div className="product-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={() => editProduct(p)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => openDeleteModal(p)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.show && deleteModal.product && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Producto</h3>
              <button className="modal-close" onClick={closeDeleteModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">⚠️</div>
                <p className="warning-text">
                  ¿Estás seguro de que quieres eliminar el producto <strong>"{deleteModal.product.name}"</strong>?
                </p>
                <p className="warning-subtext">
                  El producto será eliminado permanentemente de tu inventario.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button className="btn btn-delete" onClick={confirmDelete}>
                Eliminar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
