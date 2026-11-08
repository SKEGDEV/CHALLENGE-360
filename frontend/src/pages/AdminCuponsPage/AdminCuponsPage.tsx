import { formatMoney } from '@core';
import { Button, Drawer, EmptyState, ErrorState, IconButton, Pagination, Spinner, Table } from '@components';
import { useAdminCuponsPage } from '@hooks';
import { CuponForm } from './CuponForm';
import styles from './AdminCuponsPage.module.scss';

export function AdminCuponsPage() {
  const {
    cupones,
    pageNumber,
    totalPages,
    setPageNumber,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    cuponTypes,
    productTypes,
    isFormOpen,
    editingId,
    isDetailLoading,
    detail,
    openCreate,
    openEdit,
    closeForm,
    deleteCupon,
  } = useAdminCuponsPage();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Cupones</h1>
        <Button type="button" onClick={openCreate}>
          Nuevo cupón
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState description={errorMessage ?? 'No se pudieron cargar los cupones.'} onRetry={onRetry} />
      ) : cupones.length === 0 ? (
        <EmptyState icon="ticket" title="No hay cupones." description="Crea un cupón de descuento para tus clientes." />
      ) : (
        <>
          <Table
            rowKey={(row) => row.idCupon}
            columns={[
              { key: 'code', header: 'Código', render: (row) => row.cuponCode },
              { key: 'value', header: 'Valor', render: (row) => formatMoney(row.cuponValue) },
              { key: 'limitTotal', header: 'Usos totales', render: (row) => row.limitUseTotal },
              { key: 'limitClient', header: 'Usos por cliente', render: (row) => row.limitUsePerClient },
              { key: 'expiration', header: 'Expira', render: (row) => new Date(row.cuponExpiration).toLocaleDateString() },
              { key: 'category', header: 'Por categoría', render: (row) => (row.isPerCategory ? 'Sí' : 'No') },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div className={styles.actions}>
                    <IconButton icon="pencil" label="Editar cupón" size="sm" onClick={() => openEdit(row.idCupon)} />
                    <IconButton
                      icon="trash"
                      label="Eliminar cupón"
                      size="sm"
                      variant="danger"
                      disabled={deleteCupon.isPending}
                      onClick={() => {
                        if (confirm(`Eliminar el cupón "${row.cuponCode}"?`)) {
                          deleteCupon.mutate(row.idCupon);
                        }
                      }}
                    />
                  </div>
                ),
              },
            ]}
            rows={cupones}
          />
          <Pagination page={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
        </>
      )}

      <Drawer open={isFormOpen} onClose={closeForm} title={editingId !== null ? 'Editar cupón' : 'Nuevo cupón'}>
        {isDetailLoading ? (
          <Spinner />
        ) : (
          <CuponForm
            key={editingId ?? 'create'}
            editingId={editingId}
            detail={detail}
            cuponTypes={cuponTypes}
            productTypes={productTypes}
            onSaved={closeForm}
          />
        )}
      </Drawer>
    </div>
  );
}
