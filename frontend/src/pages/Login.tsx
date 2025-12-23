import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Login() {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Login Hardcoded para MVP
        if (password === 'admin123') {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');
        } else {
            alert('Senha incorreta!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                        <Lock className="text-white" size={32} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">Acesso Restrito</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input 
                            type="password" 
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
