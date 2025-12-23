import { useEffect, useState } from 'react';
import { getAppointments, updateAppointmentStatus, getServices, createService, deleteService } from '../api';
import type { Appointment, Service } from '../types';
import { Check, X, Clock, Calendar, Trash2, Plus, LayoutList, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Form states
    const [newService, setNewService] = useState({ title: '', price: '', duration_minutes: '' });

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
            return;
        }
        fetchData();
    }, [activeTab]);

    const fetchData = () => {
        setLoading(true);
        if (activeTab === 'appointments') {
            getAppointments()
                .then((data) => setAppointments(data))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        } else {
            getServices()
                .then((data) => setServices(data))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        if (!confirm(`Deseja alterar status para ${status}?`)) return;
        try {
            await updateAppointmentStatus(id, status);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar status');
        }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newService.title || !newService.price || !newService.duration_minutes) return;

        try {
            await createService({
                title: newService.title,
                price: parseFloat(newService.price),
                duration_minutes: parseInt(newService.duration_minutes)
            });
            setNewService({ title: '', price: '', duration_minutes: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar serviço');
        }
    };

    const handleDeleteService = async (id: number) => {
        if (!confirm('Tem certeza que deseja remover este serviço?')) return;
        try {
            await deleteService(id);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Erro ao remover serviço');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'CANCELED': return 'bg-red-100 text-red-700';
            case 'DONE': return 'bg-blue-100 text-blue-700';
            default: return 'bg-yellow-100 text-yellow-700'; // PENDING
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-900">Painel do Barbeiro</h1>
                    <nav className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                                activeTab === 'appointments' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-500 hover:text-slate-700'
                            }`}
                        >
                            <CalendarDays size={16} /> Agenda
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                                activeTab === 'services' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-500 hover:text-slate-700'
                            }`}
                        >
                            <LayoutList size={16} /> Serviços
                        </button>
                    </nav>
                </div>
                <button 
                    onClick={() => {
                        localStorage.removeItem('isAdmin');
                        navigate('/admin');
                    }}
                    className="text-sm text-red-600 font-medium hover:underline"
                >
                    Sair
                </button>
            </header>

            <main className="max-w-5xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {activeTab === 'appointments' ? 'Agendamentos' : 'Gerenciar Serviços'}
                    </h2>
                    <button onClick={fetchData} className="text-sm text-gray-500 hover:text-slate-900 underline">
                        Atualizar Lista
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Carregando...</div>
                ) : activeTab === 'appointments' ? (
                    <div className="space-y-4">
                        {appointments.length === 0 && (
                            <p className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                Nenhum agendamento encontrado.
                            </p>
                        )}
                        {appointments.map((app) => (
                            <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-900">{app.client_name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 flex items-center gap-2 text-sm">
                                        <Calendar size={14} /> {new Date(app.appointment_time).toLocaleDateString()} 
                                        <Clock size={14} className="ml-2" /> {new Date(app.appointment_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {app.service?.title} • {app.client_phone}
                                    </p>
                                    {app.notes && <p className="text-gray-400 text-xs mt-2 italic">Obs: {app.notes}</p>}
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    {app.status !== 'DONE' && app.status !== 'CANCELED' && (
                                        <>
                                            <button 
                                                onClick={() => handleStatusChange(app.id, 'CONFIRMED')}
                                                className="flex-1 md:flex-none px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium text-sm flex items-center justify-center gap-1"
                                            >
                                                <Check size={16} /> Confirmar
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(app.id, 'CANCELED')}
                                                className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium text-sm flex items-center justify-center gap-1"
                                            >
                                                <X size={16} /> Cancelar
                                            </button>
                                        </>
                                    )}
                                    {app.status === 'CONFIRMED' && (
                                        <button 
                                            onClick={() => handleStatusChange(app.id, 'DONE')}
                                            className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium text-sm flex items-center justify-center gap-1"
                                        >
                                            <Check size={16} /> Concluir
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Create Service Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-yellow-500" /> Novo Serviço
                            </h3>
                            <form onSubmit={handleCreateService} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nome do Serviço</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Corte Degrade"
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                                        value={newService.title}
                                        onChange={(e) => setNewService({...newService, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Preço (R$)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                                        value={newService.price}
                                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Duração (min)</label>
                                    <input 
                                        type="number" 
                                        placeholder="30"
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
                                        value={newService.duration_minutes}
                                        onChange={(e) => setNewService({...newService, duration_minutes: e.target.value})}
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition"
                                >
                                    Adicionar
                                </button>
                            </form>
                        </div>

                        {/* Services List */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {services.map((service) => (
                                <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{service.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Clock size={14}/> {service.duration_minutes} min</span>
                                            <span className="font-semibold text-slate-900">R$ {service.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteService(service.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Remover serviço"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
