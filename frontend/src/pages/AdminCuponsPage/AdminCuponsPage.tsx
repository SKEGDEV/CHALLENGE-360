import { useState } from 'react';
import { formatMoney } from '@core';
import { ConfirmDialog, Button, Drawer, EmptyState, ErrorState, IconButton, Pagination, Spinner, Table } from '@components';
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

  const [pendingAction, setPendingAction] = useState<{ message: string; onConfirm: () => void } | null>(null);

  return (
    <div className={styles.page}>
      <ConfirmDialog
        open={pendingAction !== null}
        message={pendingAction?.message ?? ''}
        confirmIcon="trash"
        confirmLabel="Sí, eliminar"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          pendingAction?.onConfirm();
          setPendingAction(null);
        }}
      />
      <div className={styles.header}>
        <h1>Cupones</h1>
        <Button icon="plus" type="button" onClick={openCreate}>
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
                      onClick={() => setPendingAction({ message: `Se eliminará el cupón "${row.cuponCode}".`, onConfirm: () => deleteCupon.mutate(row.idCupon) })}
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
