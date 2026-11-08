import type { CatalogEntry, CuponDetail } from '@services';
import { Button, Checkbox, Chip, Input, Select } from '@components';
import { useCuponForm } from '@hooks';
import styles from './AdminCuponsPage.module.scss';

interface CuponFormProps {
  editingId: number | null;
  detail: CuponDetail | null;
  cuponTypes: CatalogEntry[];
  productTypes: CatalogEntry[];
  onSaved: () => void;
}

export function CuponForm({ editingId, detail, cuponTypes, productTypes, onSaved }: CuponFormProps) {
  const { form, fieldErrors, formError, updateForm, toggleCategory, submit, isSaving } = useCuponForm(
    editingId,
    detail,
    onSaved,
  );

  return (
    <div className={styles.form}>
      <Select
        label="Tipo de cupón"
        value={form.idCuponType ?? ''}
        onChange={(event) => updateForm({ idCuponType: event.target.value ? Number(event.target.value) : null })}
        error={fieldErrors.idCuponType}
      >
        <option value="">Selecciona un tipo</option>
        {cuponTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </Select>
      <Input
        label="Código"
        placeholder="Ej. BIENVENIDA10"
        value={form.cuponCode}
        onChange={(event) => updateForm({ cuponCode: event.target.value })}
        error={fieldErrors.cuponCode}
      />
      <Input
        label="Valor del descuento"
        type="number"
        min="0"
        step="0.01"
        value={form.cuponValue}
        onChange={(event) => updateForm({ cuponValue: event.target.value })}
        error={fieldErrors.cuponValue}
      />
      <Input
        label="Límite de usos totales"
        type="number"
        min="1"
        value={form.limitUseTotal}
        onChange={(event) => updateForm({ limitUseTotal: event.target.value })}
        error={fieldErrors.limitUseTotal}
      />
      <Input
        label="Límite de usos por cliente"
        type="number"
        min="1"
        value={form.limitUsePerClient}
        onChange={(event) => updateForm({ limitUsePerClient: event.target.value })}
        error={fieldErrors.limitUsePerClient}
      />
      <Input
        label="Fecha de expiración"
        type="datetime-local"
        placeholder="dd/mm/aaaa --:--"
        value={form.cuponExpiration}
        onChange={(event) => updateForm({ cuponExpiration: event.target.value })}
        error={fieldErrors.cuponExpiration}
      />
      <Checkbox
        label="Aplica solo a categorías específicas"
        checked={form.isPerCategory}
        onChange={(event) => updateForm({ isPerCategory: event.target.checked })}
      />
      {form.isPerCategory && (
        <div className={styles.categoryChips}>
          {productTypes.map((type) => (
            <Chip key={type.id} selected={form.categoryIds.includes(Number(type.id))} onClick={() => toggleCategory(Number(type.id))}>
              {type.name}
            </Chip>
          ))}
          {fieldErrors.categoryIds && <p className={styles.formError}>{fieldErrors.categoryIds}</p>}
        </div>
      )}
      {formError && <p className={styles.formError}>{formError}</p>}
      <Button type="button" block disabled={isSaving} onClick={submit}>
        {isSaving ? 'Guardando...' : 'Guardar cupón'}
      </Button>
    </div>
  );
}
