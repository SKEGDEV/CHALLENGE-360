import { useRef } from 'react';
import { Button, Checkbox, IconButton, Input, Spinner } from '@components';
import type { VariantFormValue } from '@hooks';
import styles from './VariantEditor.module.scss';

interface VariantEditorProps {
  index: number;
  variant: VariantFormValue;
  canRemove: boolean;
  fieldErrors: Record<string, string>;
  onChange: (patch: Partial<VariantFormValue>) => void;
  onRemove: () => void;
  onSetDefault: () => void;
  onAutogenerateSku: () => void;
  onAddPhotos: (files: FileList | null) => void;
  onRemovePhoto: (photoIndex: number) => void;
}

export function VariantEditor({
  index,
  variant,
  canRemove,
  fieldErrors,
  onChange,
  onRemove,
  onSetDefault,
  onAutogenerateSku,
  onAddPhotos,
  onRemovePhoto,
}: VariantEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Checkbox label="Variante por defecto" checked={variant.isDefault} onChange={onSetDefault} />
        {canRemove && <IconButton icon="trash" label="Eliminar variante" variant="danger" size="sm" onClick={onRemove} />}
      </div>

      <div className={styles.row}>
        <div className={styles.skuField}>
          <Input
            label="SKU"
            value={variant.sku}
            onChange={(event) => onChange({ sku: event.target.value })}
            error={fieldErrors[`variant-${index}-sku`]}
          />
          <Button type="button" variant="secondary" size="sm" onClick={onAutogenerateSku}>
            Autogenerar
          </Button>
        </div>
        <Input label="Color" value={variant.color} onChange={(event) => onChange({ color: event.target.value })} />
        <Input label="Talla" value={variant.size} onChange={(event) => onChange({ size: event.target.value })} />
      </div>

      <div className={styles.row}>
        <Input
          label="Precio"
          type="number"
          min="0"
          step="0.01"
          value={variant.price}
          onChange={(event) => onChange({ price: event.target.value })}
          error={fieldErrors[`variant-${index}-price`]}
        />
        <Input
          label="Cantidad en stock"
          type="number"
          min="0"
          step="1"
          value={variant.quantity}
          onChange={(event) => onChange({ quantity: event.target.value })}
          error={fieldErrors[`variant-${index}-quantity`]}
        />
        <Input
          label="Caracteristicas (opcional)"
          value={variant.features}
          onChange={(event) => onChange({ features: event.target.value })}
        />
      </div>

      <div className={styles.photos}>
        <p className={styles.photosLabel}>Fotografias</p>
        <div className={styles.photoGrid}>
          {variant.photos.map((photo, photoIndex) => (
            <div key={photo.idFile ?? photo.s3BucketKey} className={styles.photoItem}>
              <img src={photo.previewUrl} alt={photo.fileName} className={styles.photoImg} />
              <IconButton
                icon="x"
                label="Quitar fotografia"
                size="sm"
                variant="danger"
                className={styles.photoRemove}
                onClick={() => onRemovePhoto(photoIndex)}
              />
            </div>
          ))}
          <button type="button" className={styles.addPhoto} onClick={() => fileInputRef.current?.click()} disabled={variant.isUploading}>
            {variant.isUploading ? <Spinner size="sm" /> : 'Agregar foto'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(event) => {
              onAddPhotos(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
        {variant.uploadError && <p className={styles.photoError}>{variant.uploadError}</p>}
        {fieldErrors[`variant-${index}-photos`] && <p className={styles.photoError}>{fieldErrors[`variant-${index}-photos`]}</p>}
      </div>
    </div>
  );
}
