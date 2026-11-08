import { Button, Drawer, EmptyState, ErrorState, IconButton, Input, Spinner, Table, Textarea } from '@components';
import { useAdminProductTypesPage } from '@hooks';
import styles from './AdminProductTypesPage.module.scss';

export function AdminProductTypesPage() {
  const {
    productTypes,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    isFormOpen,
    isEditing,
    form,
    fieldErrors,
    formError,
    openCreate,
    openEdit,
    closeForm,
    updateForm,
    submit,
    isSaving,
    deleteProductType,
  } = useAdminProductTypesPage();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Categorías</h1>
        <Button type="button" onClick={openCreate}>
          Nueva categoría
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState description={errorMessage ?? 'No se pudieron cargar las categorías.'} onRetry={onRetry} />
      ) : productTypes.length === 0 ? (
        <EmptyState icon="tag" title="No hay categorías." description="Crea una categoría para clasificar tus productos." />
      ) : (
        <Table
          rowKey={(row) => row.idProductType}
          columns={[
            { key: 'name', header: 'Nombre', render: (row) => row.productTypeName },
            { key: 'description', header: 'Descripción', render: (row) => row.productTypeDescription },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <div className={styles.actions}>
                  <IconButton icon="pencil" label="Editar categoría" size="sm" onClick={() => openEdit(row)} />
                  <IconButton
                    icon="trash"
                    label="Eliminar categoría"
                    size="sm"
                    variant="danger"
                    disabled={deleteProductType.isPending}
                    onClick={() => {
                      if (confirm(`Eliminar la categoría "${row.productTypeName}"?`)) {
                        deleteProductType.mutate(row.idProductType);
                      }
                    }}
                  />
                </div>
              ),
            },
          ]}
          rows={productTypes}
        />
      )}

      <Drawer
        open={isFormOpen}
        onClose={closeForm}
        title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
        footer={
          <Button type="button" block disabled={isSaving} onClick={submit}>
            {isSaving ? 'Guardando...' : 'Guardar categoría'}
          </Button>
        }
      >
        <div className={styles.form}>
          <Input
            label="Nombre"
            placeholder="Ej. Lentes de sol"
            value={form.productTypeName}
            onChange={(event) => updateForm({ productTypeName: event.target.value })}
            error={fieldErrors.productTypeName}
          />
          <Textarea
            label="Descripción"
            placeholder="Ej. Monturas para uso diario, resistentes y ligeras"
            value={form.productTypeDescription}
            onChange={(event) => updateForm({ productTypeDescription: event.target.value })}
            error={fieldErrors.productTypeDescription}
          />
          {formError && <p className={styles.formError}>{formError}</p>}
        </div>
      </Drawer>
    </div>
  );
}
