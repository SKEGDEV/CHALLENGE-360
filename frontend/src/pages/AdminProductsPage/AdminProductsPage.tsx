import { Link } from '@tanstack/react-router';
import { formatMoney } from '@core';
import type { Product } from '@services';
import { EmptyState, ErrorState, IconButton, Input, Pagination, ProductImage, Spinner, Table } from '@components';
import { useAdminProductsPage } from '@hooks';
import styles from './AdminProductsPage.module.scss';

function priceRange(product: Product): string {
  const prices = product.variants.map((variant) => variant.price);
  if (prices.length === 0) return '-';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatMoney(min) : `${formatMoney(min)} - ${formatMoney(max)}`;
}

function totalStock(product: Product): number {
  return product.variants.reduce((total, variant) => total + variant.quantity, 0);
}

export function AdminProductsPage() {
  const {
    products,
    pageNumber,
    totalPages,
    setPageNumber,
    search,
    setSearch,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    deleteProduct,
  } = useAdminProductsPage();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Productos</h1>
        <Link to="/admin/products/new" className={styles.newLink}>
          Nuevo producto
        </Link>
      </div>

      <div className={styles.toolbar}>
        <Input
          icon="search"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState description={errorMessage ?? 'No se pudieron cargar los productos.'} onRetry={onRetry} />
      ) : products.length === 0 ? (
        <EmptyState icon="package" title="No hay productos." description="Crea tu primer producto para empezar a vender." />
      ) : (
        <>
          <Table
            rowKey={(row) => row.idProduct}
            columns={[
              {
                key: 'product',
                header: 'Producto',
                render: (row) => (
                  <div className={styles.productCell}>
                    <ProductImage bucketKey={row.variants[0]?.photos[0] ?? null} alt={row.productName} size="sm" />
                    <span>{row.productName}</span>
                  </div>
                ),
              },
              { key: 'category', header: 'Categoria', render: (row) => row.productTypeName },
              { key: 'price', header: 'Precio', render: (row) => priceRange(row) },
              { key: 'variants', header: 'Variantes', render: (row) => row.variants.length },
              { key: 'stock', header: 'Stock', render: (row) => totalStock(row) },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div className={styles.actions}>
                    <Link to="/admin/products/$idProduct" params={{ idProduct: String(row.idProduct) }}>
                      <IconButton icon="pencil" label="Editar producto" size="sm" />
                    </Link>
                    <IconButton
                      icon="trash"
                      label="Eliminar producto"
                      size="sm"
                      variant="danger"
                      disabled={deleteProduct.isPending}
                      onClick={() => {
                        if (confirm(`Eliminar "${row.productName}"? Esta accion no se puede deshacer.`)) {
                          deleteProduct.mutate(row.idProduct);
                        }
                      }}
                    />
                  </div>
                ),
              },
            ]}
            rows={products}
          />
          <Pagination page={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
        </>
      )}
    </div>
  );
}
