import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, School, Lock, ArrowRight, ArrowLeft, Chrome, Facebook, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, updateProfile } from 'firebase/auth';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    collegeName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';

    if (!formData.collegeName.trim()) newErrors.collegeName = 'College Name is required';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // Update profile with full name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName
      });

      navigate('/dashboard', { state: { isNewUser: true } });
    } catch (error) {
      console.error("Signup Error:", error);
      let message = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') message = 'This email is already registered';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      if (error.code === 'auth/weak-password') message = 'Password is too weak';
      setErrors({ auth: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Google Auth Error:", error);
      setErrors({ auth: "Failed to sign up with Google" });
    }
  };

  const handleFacebookSignUp = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Facebook Auth Error:", error);
      setErrors({ auth: "Failed to sign up with Facebook" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 -z-10 w-full h-full overflow-hidden opacity-30">
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-ll-pale-blue blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-ll-light-blue blur-3xl opacity-40"></div>
      </div>

      {/* Back to Home Link */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-ll-dark hover:text-ll-blue transition-colors font-semibold group z-20"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm p-8 md:p-12 transform transition-all mt-16 mb-8 lg:mt-0">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-ll-dark mb-2">Create Account</h2>
            <p className="text-gray-500">Join LearnLens and unlock meaningful insights</p>
          </div>

          {errors.auth && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errors.auth}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-ll-dark mb-2 ml-1">Full Name</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${errors.fullName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-ll-blue'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border ${errors.fullName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-ll-pale-blue'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-ll-dark`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-ll-dark mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-ll-blue'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-ll-pale-blue'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-ll-dark`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* College Name */}
            <div>
              <label className="block text-sm font-bold text-ll-dark mb-2 ml-1">College Name</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${errors.collegeName ? 'text-red-400' : 'text-gray-400 group-focus-within:text-ll-blue'}`}>
                  <School className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border ${errors.collegeName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-ll-pale-blue'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-ll-dark`}
                  placeholder="Example Tech College"
                />
              </div>
              {errors.collegeName && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.collegeName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-ll-dark mb-2 ml-1">Password</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-ll-blue'}`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border ${errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-ll-pale-blue'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-ll-dark`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-ll-dark mb-2 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-focus-within:text-ll-blue'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-ll-pale-blue'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-ll-dark`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 bg-ll-dark hover:bg-ll-blue text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-grow h-px bg-slate-100"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Or register with</span>
            <div className="flex-grow h-px bg-slate-100"></div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleSignUp}
              className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-semibold text-gray-700 hover:border-ll-light-blue group"
            >
              <Chrome className="w-5 h-5 text-red-500 transition-transform group-hover:scale-110" />
              Google
            </button>
            <button
              onClick={handleFacebookSignUp}
              className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-semibold text-gray-700 hover:border-ll-light-blue group"
            >
              <Facebook className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
              Facebook
            </button>
          </div>

          <p className="mt-10 text-center text-gray-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-ll-blue font-bold hover:text-ll-dark transition-colors underline decoration-2 underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
