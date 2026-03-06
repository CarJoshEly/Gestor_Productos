import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API_BASE = 'http://localhost:4000/api/products'
const CATEGORIES_API = 'http://localhost:4000/api/categories'

function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ id: '', name: '', description: '', price: '', categoryId: '' })
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null })
  const [showCategories, setShowCategories] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', description: '' })
  const [deleteCategoryModal, setDeleteCategoryModal] = useState({ show: false, category: null })

  const loadProducts = useCallback(async () => {
    const res = await fetch(API_BASE)
    const data = await res.json()
    setProducts(data)
  }, [])

  const loadCategories = useCallback(async () => {
    const res = await fetch(CATEGORIES_API)
    const data = await res.json()
    setCategories(data)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadProducts()
    loadCategories()
  }, [])

  function handleCategoryChange(e) {
    const { name, value } = e.target
    setCategoryForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleCategorySubmit(e) {
    e.preventDefault()
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || null
    }
    if (categoryForm.id) {
      await fetch(`${CATEGORIES_API}/${categoryForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } else {
      await fetch(CATEGORIES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }
    resetCategoryForm()
    loadCategories()
    loadProducts() // Reload products to get updated category info
  }

  function resetCategoryForm() {
    setCategoryForm({ id: '', name: '', description: '' })
  }

  function editCategory(c) {
    setCategoryForm({
      id: c.id,
      name: c.name,
      description: c.description || ''
    })
  }

  function openDeleteCategoryModal(category) {
    setDeleteCategoryModal({ show: true, category })
  }

  function closeDeleteCategoryModal() {
    setDeleteCategoryModal({ show: false, category: null })
  }

  async function confirmDeleteCategory() {
    if (deleteCategoryModal.category) {
      await fetch(`${CATEGORIES_API}/${deleteCategoryModal.category.id}`, { method: 'DELETE' })
      loadCategories()
      loadProducts()
      closeDeleteCategoryModal()
    }
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
      price: parseFloat(form.price),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null
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
    setForm({ id: '', name: '', description: '', price: '', categoryId: '' })
  }

  function editProduct(p) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price.toString(),
      categoryId: p.categoryId ? p.categoryId.toString() : ''
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
              <div className="form-group">
                <label htmlFor="categoryId">Categoría</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Sin categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                  {p.category && (
                    <div className="product-category">
                      <span className="category-badge">{p.category.name}</span>
                    </div>
                  )}
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

        {/* Categories Section */}
        <div className="categories-section">
          <div className="categories-header">
            <h2>Categorías ({categories.length})</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCategories(!showCategories)}
            >
              {showCategories ? 'Ocultar' : 'Gestionar Categorías'}
            </button>
          </div>

          {showCategories && (
            <div className="categories-content">
              <div className="category-form-card">
                <h3>{categoryForm.id ? 'Editar Categoría' : '➕ Nueva Categoría'}</h3>
                <form onSubmit={handleCategorySubmit} className="category-form">
                  <input type="hidden" name="id" value={categoryForm.id} />
                  <div className="form-group">
                    <label htmlFor="category-name">Nombre</label>
                    <input
                      id="category-name"
                      type="text"
                      name="name"
                      placeholder="Ej: Electrónicos, Ropa, Alimentos..."
                      value={categoryForm.name}
                      onChange={handleCategoryChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category-description">Descripción</label>
                    <textarea
                      id="category-description"
                      name="description"
                      placeholder="Describe la categoría..."
                      value={categoryForm.description}
                      onChange={handleCategoryChange}
                      rows="2"
                    />
                  </div>
                  <div className="button-group">
                    <button type="submit" className="btn btn-primary">
                      {categoryForm.id ? 'Actualizar' : 'Crear'}
                    </button>
                    {categoryForm.id && (
                      <button type="button" onClick={resetCategoryForm} className="btn btn-secondary">
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="categories-list">
                {categories.length === 0 ? (
                  <div className="empty-state">
                    <p>📂 No hay categorías aún. ¡Crea la primera!</p>
                  </div>
                ) : (
                  <div className="categories-grid">
                    {categories.map(c => (
                      <div key={c.id} className="category-card">
                        <div className="category-header">
                          <h4>{c.name}</h4>
                          <span className="category-count">{c._count?.products || 0} productos</span>
                        </div>
                        <p className="category-description">{c.description || 'Sin descripción'}</p>
                        <div className="category-actions">
                          <button
                            className="btn btn-edit"
                            onClick={() => editCategory(c)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => openDeleteCategoryModal(c)}
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

      {/* Delete Category Modal */}
      {deleteCategoryModal.show && deleteCategoryModal.category && (
        <div className="modal-overlay" onClick={closeDeleteCategoryModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Categoría</h3>
              <button className="modal-close" onClick={closeDeleteCategoryModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">⚠️</div>
                <p className="warning-text">
                  ¿Estás seguro de que quieres eliminar la categoría <strong>"{deleteCategoryModal.category.name}"</strong>?
                </p>
                <p className="warning-subtext">
                  {deleteCategoryModal.category._count?.products > 0
                    ? `Esta categoría tiene ${deleteCategoryModal.category._count.products} producto(s) asociado(s). Los productos mantendrán su categoría hasta que los edites.`
                    : 'Esta acción no se puede deshacer.'
                  }
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDeleteCategoryModal}>
                Cancelar
              </button>
              <button className="btn btn-delete" onClick={confirmDeleteCategory}>
                Eliminar Categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
