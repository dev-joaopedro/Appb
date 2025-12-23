import { useEffect, useState } from 'react';
import { getServices } from '../api';
import type { Service } from '../types';
import { Scissors, Clock, Calendar } from 'lucide-react';
import BookingModal from '../components/BookingModal';

export default function Home() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    useEffect(() => {
        getServices()
            .then((data) => setServices(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-slate-900 text-white py-12 px-4 text-center">
                <h1 className="text-4xl font-bold mb-2">BarberShop Express</h1>
                <p className="text-gray-400">Agende seu corte em segundos, sem cadastro.</p>
                <button 
                    onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-6 bg-yellow-500 text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition flex items-center mx-auto gap-2"
                >
                    <Calendar size={20} />
                    Agendar Agora
                </button>
            </header>

            {/* Services */}
            <main id="services" className="max-w-4xl mx-auto py-12 px-4">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                    <Scissors className="text-yellow-500" />
                    Nossos Serviços
                </h2>

                {loading ? (
                    <p>Carregando serviços...</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <div 
                                key={service.id} 
                                onClick={() => setSelectedService(service)}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800 group-hover:text-yellow-600 transition">{service.title}</h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                            <Clock size={14} />
                                            <span>{service.duration_minutes} min</span>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">
                                        R$ {service.price.toFixed(2)}
                                    </span>
                                </div>
                                <button className="w-full mt-4 py-2 bg-gray-50 text-slate-700 font-semibold rounded-lg group-hover:bg-yellow-50 group-hover:text-yellow-700 transition">
                                    Selecionar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {selectedService && (
                <BookingModal 
                    service={selectedService} 
                    onClose={() => setSelectedService(null)} 
                />
            )}
        </div>
    );
}
