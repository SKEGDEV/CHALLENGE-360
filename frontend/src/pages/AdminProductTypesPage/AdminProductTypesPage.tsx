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
        <h1>Categorias</h1>
        <Button type="button" onClick={openCreate}>
          Nueva categoria
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState description={errorMessage ?? 'No se pudieron cargar las categorias.'} onRetry={onRetry} />
      ) : productTypes.length === 0 ? (
        <EmptyState icon="tag" title="No hay categorias." description="Crea una categoria para clasificar tus productos." />
      ) : (
        <Table
          rowKey={(row) => row.idProductType}
          columns={[
            { key: 'name', header: 'Nombre', render: (row) => row.productTypeName },
            { key: 'description', header: 'Descripcion', render: (row) => row.productTypeDescription },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <div className={styles.actions}>
                  <IconButton icon="pencil" label="Editar categoria" size="sm" onClick={() => openEdit(row)} />
                  <IconButton
                    icon="trash"
                    label="Eliminar categoria"
                    size="sm"
                    variant="danger"
                    disabled={deleteProductType.isPending}
                    onClick={() => {
                      if (confirm(`Eliminar la categoria "${row.productTypeName}"?`)) {
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
        title={isEditing ? 'Editar categoria' : 'Nueva categoria'}
        footer={
          <Button type="button" block disabled={isSaving} onClick={submit}>
            {isSaving ? 'Guardando...' : 'Guardar categoria'}
          </Button>
        }
      >
        <div className={styles.form}>
          <Input
            label="Nombre"
            value={form.productTypeName}
            onChange={(event) => updateForm({ productTypeName: event.target.value })}
            error={fieldErrors.productTypeName}
          />
          <Textarea
            label="Descripcion"
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
