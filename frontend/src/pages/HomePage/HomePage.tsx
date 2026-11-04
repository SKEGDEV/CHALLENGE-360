import { Chip, Container, EmptyState, ErrorState, Icon, Input, Select, Spinner } from '@components';
import { useHomePage, type SortOption } from '@hooks';
import { ProductCard } from './ProductCard';
import styles from './HomePage.module.scss';

export function HomePage() {
  const {
    products,
    categories,
    category,
    setCategory,
    search,
    setSearch,
    sort,
    setSort,
    isLoading,
    isError,
    errorMessage,
    onRetry,
  } = useHomePage();

  return (
    <main>
      <section className={styles.hero}>
        <Container as="div">
          <p className={styles.kicker}>Coleccion actual</p>
          <h1>Viste lo esencial.</h1>
          <p className={styles.sub}>
            Encuentra prendas para cada ocasion, con envio rapido y cambios sin costo durante 30 dias.
          </p>
        </Container>
      </section>

      <section className={styles.perks}>
        <Container as="div" className={styles.perksIn}>
          <div className={styles.perk}>
            <Icon name="truck" size="lg" />
            <div>
              <b>Envio rapido</b>
              <span>Entrega en 24 a 48 horas.</span>
            </div>
          </div>
          <div className={styles.perk}>
            <Icon name="rotate-ccw" size="lg" />
            <div>
              <b>Devoluciones sin costo</b>
              <span>Tienes 30 dias para cambiar de talla o color.</span>
            </div>
          </div>
          <div className={styles.perk}>
            <Icon name="shield-check" size="lg" />
            <div>
              <b>Pago protegido</b>
              <span>Tus datos viajan cifrados de principio a fin.</span>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.shop}>
        <Container as="div">
          <div className={styles.sectionHead}>
            <h2>Compra por categoria</h2>
          </div>

          <div className={styles.cats} role="tablist" aria-label="Categorias">
            <Chip selected={category === null} onClick={() => setCategory(null)} role="tab">
              Todo
            </Chip>
            {categories.map((cat) => (
              <Chip
                key={cat.idProductType}
                selected={category === cat.idProductType}
                onClick={() => setCategory(cat.idProductType)}
                role="tab"
              >
                {cat.productTypeName}
              </Chip>
            ))}
          </div>

          <div className={styles.toolbar}>
            <Input
              className={styles.search}
              icon="search"
              type="search"
              placeholder="Buscar prendas"
              aria-label="Buscar prendas"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              className={styles.sort}
              aria-label="Ordenar"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
            >
              <option value="destacados">Destacados</option>
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre</option>
            </Select>
            {!isLoading && !isError && (
              <span className={styles.count}>
                {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className={styles.stateWrap}>
              <Spinner />
            </div>
          ) : isError ? (
            <div className={styles.stateWrap}>
              <ErrorState description={errorMessage ?? 'No se pudieron cargar los productos.'} onRetry={onRetry} />
            </div>
          ) : products.length === 0 ? (
            <div className={styles.stateWrap}>
              <EmptyState
                icon="search"
                title="No hay prendas que coincidan."
                description="Prueba con otra palabra o elige Todo para ver el catalogo completo."
              />
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((product) => (
                <ProductCard key={product.idProduct} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
