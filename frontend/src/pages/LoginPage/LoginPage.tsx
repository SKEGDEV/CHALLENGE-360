import { Link } from '@tanstack/react-router';
import { Button, Container, Input } from '@components';
import { useLoginPage } from '@hooks';
import styles from './LoginPage.module.scss';

export function LoginPage() {
  const { userEmail, setUserEmail, userPassword, setUserPassword, errorMessage, isSubmitting, onSubmit } =
    useLoginPage();

  return (
    <Container as="main" className={styles.page}>
      <div className={styles.card}>
        <h1>Inicia sesion</h1>
        <p className={styles.sub}>Entra con tu cuenta para comprar y ver el estado de tus pedidos.</p>
        <form onSubmit={onSubmit} noValidate className={styles.form}>
          <Input
            type="email"
            icon="mail"
            placeholder="Correo electronico"
            aria-label="Correo electronico"
            autoComplete="username"
            value={userEmail}
            onChange={(event) => setUserEmail(event.target.value)}
          />
          <Input
            type="password"
            icon="lock"
            placeholder="Contrasenia"
            aria-label="Contrasenia"
            autoComplete="current-password"
            value={userPassword}
            onChange={(event) => setUserPassword(event.target.value)}
          />
          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}
          <Button type="submit" size="lg" block disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}
          </Button>
        </form>
        <p className={styles.switch}>
          No tienes una cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </div>
    </Container>
  );
}
