import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Check } from 'lucide-react';
import type { Service } from '../types';
import { getAvailableSlots, createAppointment } from '../api';

interface BookingModalProps {
    service: Service;
    onClose: () => void;
}

export default function BookingModal({ service, onClose }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Buscar slots quando a data mudar
    useEffect(() => {
        if (date) {
            setLoading(true);
            getAvailableSlots(date)
                .then((data) => setSlots(data.slots))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const appointmentTime = `${date}T${selectedSlot}:00Z`; // Formato ISO simplificado
            await createAppointment({
                client_name: name,
                client_phone: phone,
                service_id: service.id,
                appointment_time: appointmentTime,
                notes: 'Agendado via App'
            });
            setSuccess(true);
        } catch (error) {
            alert('Erro ao agendar. Tente novamente.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Agendamento Confirmado!</h2>
                    <p className="text-gray-600 mb-6">
                        Te esperamos dia {date.split('-').reverse().join('/')} às {selectedSlot}.
                    </p>
                    <a 
                        href={`https://wa.me/55${phone}?text=Olá ${name}, seu agendamento para ${service.title} dia ${date.split('-').reverse().join('/')} às ${selectedSlot} foi confirmado!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-400 transition mb-3"
                    >
                        Receber Comprovante no WhatsApp
                    </a>
                    <button 
                        onClick={onClose}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Agendar {service.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-slate-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar size={16} /> Escolha a Data
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                                    value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            {date && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                        <Clock size={16} /> Horários Disponíveis
                                    </label>
                                    {loading ? (
                                        <div className="text-center py-4 text-gray-500">Buscando horários...</div>
                                    ) : slots.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-2 px-1 rounded-lg text-sm font-medium transition ${
                                                        selectedSlot === slot 
                                                        ? 'bg-slate-900 text-white shadow-md' 
                                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-orange-500 bg-orange-50 rounded-xl">
                                            Sem horários livres para esta data.
                                        </div>
                                    )}
                                </div>
                            )}

                            <button 
                                disabled={!date || !selectedSlot}
                                onClick={() => setStep(2)}
                                className="w-full mt-4 bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuar
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <User size={16} /> Seu Nome
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                                    placeholder="Ex: João Silva"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Phone size={16} /> Seu WhatsApp
                                </label>
                                <input 
                                    type="tel" 
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                                    placeholder="Ex: 11999999999"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mt-4">
                                <p><strong>Serviço:</strong> {service.title}</p>
                                <p><strong>Data:</strong> {date.split('-').reverse().join('/')} às {selectedSlot}</p>
                                <p><strong>Valor:</strong> R$ {service.price.toFixed(2)}</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Voltar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-70"
                                >
                                    {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
