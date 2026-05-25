import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'brightsite2025') { // Simple password for now
      onLogin();
      navigate('/');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]">
      <div className="w-full max-w-md p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brightsite-blue mb-2">Brightsite CRM</h1>
          <p className="text-gray-400">CEO Portal Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brightsite-blue transition-colors"
              placeholder="Enter your access key"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-brightsite-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Access Dashboard
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          Internal system. Authorized access only.
        </p>
      </div>
    </div>
  );
};

export default Login;
