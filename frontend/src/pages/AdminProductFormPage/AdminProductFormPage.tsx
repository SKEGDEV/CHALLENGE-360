import { Link } from '@tanstack/react-router';
import { Button, ErrorState, Icon, Input, Select, Spinner, Textarea } from '@components';
import { useAdminProductFormData, useProductFormState } from '@hooks';
import type { CatalogEntry, ProductDetail } from '@services';
import { VariantEditor } from './VariantEditor';
import styles from './AdminProductFormPage.module.scss';

interface AdminProductFormPageProps {
  idProduct: number | null;
}

export function AdminProductFormPage({ idProduct }: AdminProductFormPageProps) {
  const { isEditMode, isLoadingDetail, isDetailError, detail, productTypes } = useAdminProductFormData(idProduct);

  if (isLoadingDetail) {
    return (
      <div className={styles.page}>
        <Spinner />
      </div>
    );
  }

  if (isDetailError) {
    return (
      <div className={styles.page}>
        <ErrorState description="No se pudo cargar el producto." />
      </div>
    );
  }

  return (
    <ProductFormContent
      idProduct={idProduct}
      isEditMode={isEditMode}
      detail={detail}
      productTypes={productTypes}
    />
  );
}

interface ProductFormContentProps {
  idProduct: number | null;
  isEditMode: boolean;
  detail: ProductDetail | null;
  productTypes: CatalogEntry[];
}

function ProductFormContent({ idProduct, isEditMode, detail, productTypes }: ProductFormContentProps) {
  const {
    idProductType,
    setIdProductType,
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    productPublicCode,
    setProductPublicCode,
    variants,
    updateVariant,
    addVariant,
    removeVariant,
    setDefaultVariant,
    autogenerateSku,
    addPhotos,
    removePhoto,
    fieldErrors,
    formError,
    isSaving,
    submit,
  } = useProductFormState(idProduct, detail);

  return (
    <div className={styles.page}>
      <Link to="/admin/products" className={styles.back}>
        <Icon name="chevron-left" size="sm" />
        Productos
      </Link>
      <h1>{isEditMode ? 'Editar producto' : 'Nuevo producto'}</h1>

      <div className={styles.section}>
        <div className={styles.row}>
          <Select
            label="Categoria"
            value={idProductType ?? ''}
            onChange={(event) => setIdProductType(event.target.value ? Number(event.target.value) : null)}
            error={fieldErrors.idProductType}
          >
            <option value="">Selecciona una categoria</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
          <Input
            label="Nombre del producto"
            placeholder="Ej. Camisa de lino manga larga"
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            error={fieldErrors.productName}
          />
          {!isEditMode && (
            <Input
              label="Codigo publico"
              placeholder="Ej. CAM-001"
              value={productPublicCode}
              onChange={(event) => setProductPublicCode(event.target.value)}
              error={fieldErrors.productPublicCode}
            />
          )}
        </div>
        <Textarea
          label="Descripcion"
          placeholder="Ej. Camisa 100% algodon, corte regular, ideal para uso diario."
          value={productDescription}
          onChange={(event) => setProductDescription(event.target.value)}
          error={fieldErrors.productDescription}
        />
      </div>

      <div className={styles.variantsHeader}>
        <h2>Variantes</h2>
        <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
          Agregar variante
        </Button>
      </div>
      {fieldErrors.variants && <p className={styles.formError}>{fieldErrors.variants}</p>}

      <div className={styles.variants}>
        {variants.map((variant, index) => (
          <VariantEditor
            key={variant.idVariant ?? index}
            index={index}
            variant={variant}
            canRemove={variants.length > 1}
            fieldErrors={fieldErrors}
            onChange={(patch) => updateVariant(index, patch)}
            onRemove={() => removeVariant(index)}
            onSetDefault={() => setDefaultVariant(index)}
            onAutogenerateSku={() => autogenerateSku(index)}
            onAddPhotos={(files) => void addPhotos(index, files)}
            onRemovePhoto={(photoIndex) => removePhoto(index, photoIndex)}
          />
        ))}
      </div>

      {formError && <p className={styles.formError}>{formError}</p>}

      <div className={styles.footer}>
        <Button type="button" size="lg" disabled={isSaving} onClick={submit}>
          {isSaving ? 'Guardando...' : 'Guardar producto'}
        </Button>
      </div>
    </div>
  );
}
