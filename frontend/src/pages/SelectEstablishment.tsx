import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';

export default function SelectEstablishment() {
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned) return alert('Insira o número do barbeiro (somente dígitos)');

        localStorage.setItem('selectedBarberPhone', cleaned);
        navigate('/home');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">Escolha o Estabelecimento</h1>
                <p className="text-sm text-gray-500 mb-6 text-center">Insira o número do dono/barbeiro para acessar a agenda da barbearia.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Phone size={16} /> Número do Barbeiro</label>
                        <input
                            type="tel"
                            placeholder="Ex: 11999999999"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        Entrar na Agenda
                    </button>
                </form>
            </div>
        </div>
    );
}
