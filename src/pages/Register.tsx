import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRegister } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
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

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate, isPending, error } = useMutation<unknown, Error, Parameters<typeof apiRegister>[0]>({
    mutationFn: apiRegister,
    onSuccess: () => {
      // Arahkan ke halaman login setelah registrasi berhasil
      navigate('/login', { replace: true });
    },
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
          <h1 className='text-display-xs md:text-display-sm font-bold text-neutral-950'>
            Register
          </h1>
          <p className='text-sm font-semibold md:text-md text-neutral-700'>
            Create your account to start borrowing books.
          </p>
        </div>

        <form onSubmit={onSubmit} className='space-y-4 mt-6'>
          <div>
            <label className='block text-sm font-medium text-neutral-950'>
              Name
            </label>
            <Input
              type='text'
              className={errors.name ? 'border-red-500' : ''}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className='text-xs text-red-500 mt-1'>{errors.name}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-neutral-950'>
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
            <label className='block text-sm font-medium text-neutral-950'>
              Nomor Handphone
            </label>
            <Input
              type='tel'
              className={errors.phone ? 'border-red-500' : ''}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className='text-xs text-red-500 mt-1'>{errors.phone}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-neutral-950'>
              Password
            </label>
            <Input
              type='password'
              className={errors.password ? 'border-red-500' : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className='text-xs text-red-500 mt-1'>{errors.password}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-neutral-950'>
              Confirm Password
            </label>
            <Input
              type='password'
              className={errors.confirmPassword ? 'border-red-500' : ''}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={isPending}
          >
            {isPending ? 'Loading…' : 'Submit'}
          </Button>

          {error && (
            <p className='text-xs text-red-500'>{String(error.message)}</p>
          )}
        </form>

        <p className='text-center text-sm md:text-md font-semibold text-neutral-950 mt-4'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='text-primary-300 font-bold text-sm md:text-md hover:underline'
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
