import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { apiRegister } from '../lib/api';
import { authStart, authSuccess, authError } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod'; // Import zod for schema validation
import logoBooky from '../assets/images/logo-booky.png';

// Define the schema for validation
const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 huruf'),
    email: z.string().email('Email tidak valid'),
    phone: z.string().superRefine((val, ctx) => {
      if (!/^[0-9]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor handphone hanya boleh angka',
        });
      } else if (val.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor handphone minimal 10 digit',
        });
      } else if (val.length > 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Nomor handphone maksimal 13 digit',
        });
      }
    }),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak sama',
    path: ['confirmPassword'],
  });

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate, isPending, error } = useMutation({
    mutationFn: apiRegister,
    onMutate: () => dispatch(authStart()),
    onSuccess: (data) => {
      console.log('Response register:', data);
      if (!data?.user || !data?.token) {
        dispatch(authError('Data register tidak lengkap'));
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
    const parsed = registerSchema.safeParse({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((err: z.ZodIssue) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return; // stop kalau input tidak valid
    }

    setErrors({});
    mutate({ name, email, phone, password }); // hanya kirim data valid
  };

  return (
    <div className='min-h-screen bg-neutral-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-[393px] md:max-w-[560px] md:w-full bg-white rounded-xl shadow-lg p-6 md:p-8'>
        <div className='space-y-1'>
          <Link to='/' className='inline-block'>
            <img
              src={logoBooky}
              alt='Booky Logo'
              className='h-8 md:h-10'
            />
          </Link>
          <h1 className='text-lg md:text-xl font-semibold text-neutral-800'>
            Register
          </h1>
          <p className='text-sm md:text-md text-neutral-600'>
            Create your account to start borrowing books.
          </p>
        </div>

        <form onSubmit={onSubmit} className='space-y-4 mt-6'>
          <div>
            <label className='block text-sm font-medium text-neutral-700'>
              Nama
            </label>
            <input
              type='text'
              className={`mt-1 w-full rounded-xl border px-md py-sm text-sm ${
                errors.name ? 'border-red-500' : 'border-neutral-300'
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className='text-xs text-red-500 mt-1'>{errors.name}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-neutral-700'>
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
            <label className='block text-sm font-medium text-neutral-700'>
              Nomor Handphone
            </label>
            <input
              type='tel'
              className={`mt-1 w-full rounded-xl border px-md py-sm text-sm ${
                errors.phone ? 'border-red-500' : 'border-neutral-300'
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className='text-xs text-red-500 mt-1'>{errors.phone}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-neutral-700'>
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

          <div>
            <label className='block text-sm font-medium text-neutral-700'>
              Confirm Password
            </label>
            <input
              type='password'
              className={`mt-1 w-full rounded-xl border px-md py-sm text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-neutral-300'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type='submit'
            className='w-full bg-primary-300 text-white py-sm rounded-full text-sm font-medium hover:bg-primary-200 transition disabled:opacity-60'
            disabled={isPending}
          >
            {isPending ? 'Loading…' : 'Submit'}
          </button>

          {error && (
            <p className='text-xs text-red-500'>{String(error.message)}</p>
          )}
        </form>

        <p className='text-center text-sm text-neutral-600 mt-4'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-primary-300 font-medium hover:underline'
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
