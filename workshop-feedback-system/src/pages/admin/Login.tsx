import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { auth } from '../../services/firebase';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // If already logged in, redirect
  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.log("Project ID:", auth.app.options.projectId);
      console.log("Auth Domain:", auth.app.options.authDomain);
      console.log("Login Email:", data.email);
      setAuthError(error.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Portal</h1>
          <p className="text-slate-500">Sign in to manage workshops and feedback</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {authError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"
            >
              {authError}
            </motion.div>
          )}

          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full mt-2"
            size="lg"
          >
            Sign In
          </Button>
        </form>
        

      </motion.div>
    </div>
  );
};

export default Login;

