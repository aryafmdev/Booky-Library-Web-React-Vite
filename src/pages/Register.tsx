import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { apiRegister } from '../lib/api';
import { authStart, authSuccess, authError } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod'; // Import zod for schema validation

// Define the schema for validation
const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // state untuk error Zod

  const { mutate, isPending, error } = useMutation({
    mutationFn: apiRegister,
    onMutate: () => dispatch(authStart()),
    onSuccess: (data) => {
      dispatch(authSuccess({ token: data.token, user: data.user }));
      navigate('/books', { replace: true });
    },
    onError: (err: Error) => dispatch(authError(err.message)),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 👉 validasi input dengan Zod sebelum mutate
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((err: z.ZodIssue) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return; // stop kalau input tidak valid
    }

    setErrors({});
    mutate(parsed.data); // hanya kirim data valid
  };

  return (
    <div className='mx-auto max-w-md p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Register</h1>
      <form onSubmit={onSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm mb-1'>Nama</label>
          <input
            type='text'
            className='w-full rounded border px-3 py-2'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className='text-red-600 text-sm'>{errors.name}</p>}{' '}
          {/* pesan error Zod */}
        </div>
        <div>
          <label className='block text-sm mb-1'>Email</label>
          <input
            type='email'
            className='w-full rounded border px-3 py-2'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className='text-red-600 text-sm'>{errors.email}</p>
          )}
        </div>
        <div>
          <label className='block text-sm mb-1'>Password</label>
          <input
            type='password'
            className='w-full rounded border px-3 py-2'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className='text-red-600 text-sm'>{errors.password}</p>
          )}
        </div>
        <button
          type='submit'
          className='w-full rounded bg-black text-white py-2 disabled:opacity-60'
          disabled={isPending}
        >
          {isPending ? 'Loading…' : 'Register'}
        </button>
        {error && (
          <p className='text-red-600 text-sm'>{String(error.message)}</p>
        )}
      </form>
      <p className='mt-4 text-sm'>
        Sudah punya akun?{' '}
        <Link to='/login' className='underline'>
          Login
        </Link>
      </p>
    </div>
  );
}
