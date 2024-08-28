'use client';
import SignupForm from './SignupForm';
import styles from './SignupPage.module.css';

export function SignupPage() {
  if (process.env.disableLogin) {
    return null;
  }

  return (
    <div className={styles.page}>
      <SignupForm />
    </div>
  );
}

export default SignupPage;
