import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { apiLogin } from '../lib/api';
import {
  authStart,
  authError,
  authSuccessToken,
  authSuccessUser,
} from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod'; // Import zod for schema validation
import logoBooky from '../assets/images/logo-booky.png';
import { apiMe, apiForgotPassword } from '../lib/api';
import { Icon } from '@iconify/react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // state untuk error Zod

  const { mutate, isPending, error } = useMutation({
    mutationFn: apiLogin,
    onMutate: () => dispatch(authStart()),
    onSuccess: async (data) => {
      if (!data?.token) {
        dispatch(authError('Token tidak ditemukan'));
        return;
      }

      // Set token dulu agar route guard langsung mengizinkan akses
      dispatch(authSuccessToken(data.token));
      navigate('/', { replace: true });

      // Ambil profil user; kalau gagal, biarkan user tetap login dengan token
      try {
        const user = await apiMe(data.token);
        dispatch(authSuccessUser(user));
      } catch (err) {
        // optional: simpan error tanpa menggagalkan login
        const message = err instanceof Error ? err.message : String(err);
        dispatch(authError(message));
      }
    },
    onError: (err: Error) => dispatch(authError(err.message)),
  });

  const {
    mutate: forgotMutate,
    isPending: isPendingForgot,
    error: errorForgot,
    isSuccess: successForgot,
  } = useMutation({
    mutationFn: apiForgotPassword,
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

  const onForgotPassword = () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email wajib diisi' }));
      return;
    }
    forgotMutate({ email });
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
            <Input
              type='email'
              className={errors.email ? 'border-red-500' : ''}
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
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type='button'
                aria-label='Toggle password visibility'
                className='absolute bg-white border-none right-3 top-1/2 -translate-y-1/2 text-neutral-600'
                onClick={() => setShowPassword((v) => !v)}
              >
                <Icon
                  icon={
                    showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'
                  }
                  width={20}
                  height={20}
                />
              </button>
            </div>
            {errors.password && (
              <p className='text-xs text-red-500 mt-1'>{errors.password}</p>
            )}
          </div>

          <Button
            type='submit'
            className='w-full bg-primary-300 rounded-full hover:bg-primary-400'
            disabled={isPending}
          >
            {isPending ? 'Loading…' : 'Login'}
          </Button>

          <div className='mt-2 flex justify-center'>
            <button
              type='button'
              className='text-primary-300 bg-transparent border-none text-sm md:text-md font-bold hover:underline'
              onClick={onForgotPassword}
              disabled={isPendingForgot}
            >
              {isPendingForgot ? 'Sending…' : 'Forgot Password?'}
            </button>
          </div>

          {error && (
            <p className='text-xs text-red-500'>{String(error.message)}</p>
          )}
          {errorForgot && (
            <p className='text-xs text-red-500'>
              {String(errorForgot.message)}
            </p>
          )}
          {successForgot && (
            <p className='text-xs text-neutral-700'>
              Reset email sent if account exists.
            </p>
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
