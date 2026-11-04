import clsx from 'clsx';
import { Link } from '@tanstack/react-router';
import { Button, Checkbox, Container, Input } from '@components';
import { useRegisterPage } from '@hooks';
import styles from './RegisterPage.module.scss';

export function RegisterPage() {
  const {
    form,
    setField,
    acceptedTerms,
    setAcceptedTerms,
    passwordChecks,
    errorMessage,
    isSubmitting,
    onSubmit,
  } = useRegisterPage();

  return (
    <Container as="main" className={styles.page}>
      <div className={styles.card}>
        <h1>Crea tu cuenta</h1>
        <p className={styles.sub}>Con tu cuenta puedes comprar, guardar tu bolsa y seguir tus pedidos.</p>
        <form onSubmit={onSubmit} noValidate className={styles.form}>
          <div className={styles.row2}>
            <Input
              placeholder="Nombre"
              aria-label="Nombre"
              autoComplete="given-name"
              value={form.userFirstName}
              onChange={(event) => setField('userFirstName')(event.target.value)}
            />
            <Input
              placeholder="Apellidos"
              aria-label="Apellidos"
              autoComplete="family-name"
              value={form.userLastName}
              onChange={(event) => setField('userLastName')(event.target.value)}
            />
          </div>
          <Input
            type="email"
            icon="mail"
            placeholder="Correo electronico"
            aria-label="Correo electronico"
            autoComplete="email"
            value={form.userEmail}
            onChange={(event) => setField('userEmail')(event.target.value)}
          />
          <Input
            type="date"
            label="Fecha de nacimiento"
            aria-label="Fecha de nacimiento"
            value={form.userBirthday}
            onChange={(event) => setField('userBirthday')(event.target.value)}
          />
          <Input
            type="password"
            icon="lock"
            placeholder="Contrasenia"
            aria-label="Contrasenia"
            autoComplete="new-password"
            value={form.userPassword}
            onChange={(event) => setField('userPassword')(event.target.value)}
          />
          <Input
            type="password"
            icon="lock"
            placeholder="Confirma la contrasenia"
            aria-label="Confirma la contrasenia"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => setField('confirmPassword')(event.target.value)}
          />
          <ul className={styles.rules}>
            <li className={clsx(passwordChecks.length && styles.ruleOk)}>Al menos 8 caracteres</li>
            <li className={clsx(passwordChecks.match && styles.ruleOk)}>Ambas contrasenias coinciden</li>
          </ul>
          <Checkbox
            label="Acepto las condiciones de uso y la politica de privacidad."
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}
          <Button type="submit" size="lg" block disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
        <p className={styles.switch}>
          Ya tienes una cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </div>
    </Container>
  );
}
