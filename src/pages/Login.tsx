import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { apiLogin } from '../lib/api';
import { authStart, authSuccess, authError } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod'; // Import zod for schema validation
import logoBooky from '../assets/images/logo-booky.png';

// Define the schema for validation
const loginSchema = z.object({
  email: z.string().superRefine((val, ctx) => {
    if (!val.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email wajib diisi',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email tidak valid',
      });
    }
  }),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // state untuk error Zod

  const { mutate, isPending, error } = useMutation({
    mutationFn: apiLogin,
    onMutate: () => dispatch(authStart()),
    onSuccess: (data) => {
      if (!data?.user || !data?.token) {
        dispatch(authError('Data login tidak lengkap'));
        return;
      }

      dispatch(
        authSuccess({
          token: data.token,
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.role,
          },
        })
      );
      navigate('/books', { replace: true });
    },
    onError: (err: Error) => dispatch(authError(err.message)),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validasi input dengan Zod sebelum mutate
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((err: z.ZodIssue) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    mutate({ email, password }); // hanya kirim data valid
  };

  return (
    <div className='min-h-screen bg-neutral-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-[393px] md:max-w-[560px] md:w-full bg-white rounded-xl shadow-lg p-6 md:p-8'>
        <div className='space-y-1'>
          <Link to='/' className='inline-block'>
            <img src={logoBooky} alt='Booky Logo' className='h-8 md:h-10' />
          </Link>
          <h1 className='text-display-xs md:text-display-sm md:text-xl font-bold text-neutral-950'>
            Login
          </h1>
          <p className='text-sm font-semibold md:text-md text-neutral-700'>
            Sign in to manage your library account.
          </p>
        </div>

        <form onSubmit={onSubmit} className='space-y-4 mt-6'>
          <div>
            <label className='block text-sm font-bold text-neutral-950'>
              Email
            </label>
            <input
              type='email'
              className={`mt-1 w-full rounded-xl border px-md py-sm text-sm ${
                errors.email ? 'border-red-500' : 'border-neutral-300'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className='text-xs text-red-500 mt-1'>{errors.email}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-bold text-neutral-950'>
              Password
            </label>
            <input
              type='password'
              className={`mt-1 w-full rounded-xl border px-md py-sm text-sm ${
                errors.password ? 'border-red-500' : 'border-neutral-300'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className='text-xs text-red-500 mt-1'>{errors.password}</p>
            )}
          </div>

          <button
            type='submit'
            className='w-full bg-primary-300 text-white py-sm rounded-full text-md font-bold hover:bg-primary-200 transition disabled:opacity-60'
            disabled={isPending}
          >
            {isPending ? 'Loading…' : 'Login'}
          </button>

          {error && (
            <p className='text-xs text-red-500'>{String(error.message)}</p>
          )}
        </form>

        <p className='text-center text-sm md:text-md font-semibold text-neutral-950 mt-4'>
          Don't have an account?{' '}
          <Link
            to='/register'
            className='text-primary-300 text-sm md:text-md font-bold hover:underline'
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
