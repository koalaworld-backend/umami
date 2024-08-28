import { Metadata } from 'next';
import SignupPage from './SignupPage';

export default async function () {
  return <SignupPage />;
}

export const metadata: Metadata = {
  title: 'Sign up',
};
