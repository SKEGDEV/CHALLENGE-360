import { Badge, Button, Drawer, EmptyState, ErrorState, IconButton, Input, Pagination, Select, Spinner, Table } from '@components';
import { USER_STATUS_OPTIONS, useAdminUsersPage, userStatusLabel } from '@hooks';
import styles from './AdminUsersPage.module.scss';

const ACTIVE_STATUS = 1;

export function AdminUsersPage() {
  const {
    users,
    pageNumber,
    totalPages,
    setPageNumber,
    search,
    setSearch,
    idUserStatus,
    setIdUserStatus,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    inactivateUser,
    roles,
    isFormOpen,
    form,
    fieldErrors,
    formError,
    openCreate,
    closeForm,
    updateForm,
    submit,
    isSaving,
  } = useAdminUsersPage();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Usuarios</h1>
        <Button type="button" onClick={openCreate}>
          Nuevo usuario
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          icon="search"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          value={idUserStatus ?? ''}
          onChange={(event) => setIdUserStatus(event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Todos los estados</option>
          {USER_STATUS_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState description={errorMessage ?? 'No se pudieron cargar los usuarios.'} onRetry={onRetry} />
      ) : users.length === 0 ? (
        <EmptyState icon="users" title="No hay usuarios." description="Crea una cuenta de administrador u operador." />
      ) : (
        <>
          <Table
            rowKey={(row) => row.idUser}
            columns={[
              { key: 'name', header: 'Nombre', render: (row) => `${row.userFirstName} ${row.userLastName}` },
              { key: 'email', header: 'Correo', render: (row) => row.userEmail },
              { key: 'role', header: 'Rol', render: (row) => row.rolePublicCode },
              {
                key: 'status',
                header: 'Estado',
                render: (row) => (
                  <Badge tone={row.idUserStatus === ACTIVE_STATUS ? 'success' : 'danger'}>
                    {userStatusLabel(row.idUserStatus)}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <IconButton
                    icon="ban"
                    label="Inactivar usuario"
                    size="sm"
                    variant="danger"
                    disabled={row.idUserStatus !== ACTIVE_STATUS || inactivateUser.isPending}
                    onClick={() => {
                      if (confirm(`Inactivar a "${row.userFirstName} ${row.userLastName}"?`)) {
                        inactivateUser.mutate(row.idUser);
                      }
                    }}
                  />
                ),
              },
            ]}
            rows={users}
          />
          <Pagination page={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
        </>
      )}

      <Drawer
        open={isFormOpen}
        onClose={closeForm}
        title="Nuevo usuario"
        footer={
          <Button type="button" block disabled={isSaving} onClick={submit}>
            {isSaving ? 'Creando...' : 'Crear usuario'}
          </Button>
        }
      >
        <div className={styles.form}>
          <Input
            label="Nombre"
            value={form.userFirstName}
            onChange={(event) => updateForm({ userFirstName: event.target.value })}
            error={fieldErrors.userFirstName}
          />
          <Input
            label="Apellido"
            value={form.userLastName}
            onChange={(event) => updateForm({ userLastName: event.target.value })}
            error={fieldErrors.userLastName}
          />
          <Input
            label="Correo"
            type="email"
            value={form.userEmail}
            onChange={(event) => updateForm({ userEmail: event.target.value })}
            error={fieldErrors.userEmail}
          />
          <Input
            label="Contrasena"
            type="password"
            value={form.userPassword}
            onChange={(event) => updateForm({ userPassword: event.target.value })}
            error={fieldErrors.userPassword}
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={form.userBirthday}
            onChange={(event) => updateForm({ userBirthday: event.target.value })}
            error={fieldErrors.userBirthday}
          />
          <Select
            label="Rol"
            value={form.rolePublicCode}
            onChange={(event) => updateForm({ rolePublicCode: event.target.value })}
            error={fieldErrors.rolePublicCode}
          >
            <option value="">Selecciona un rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
          {formError && <p className={styles.formError}>{formError}</p>}
        </div>
      </Drawer>
    </div>
  );
}
