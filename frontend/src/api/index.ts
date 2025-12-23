import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const getServices = async () => {
    const response = await api.get('/services');
    return response.data.data;
};

export const createService = async (service: { title: string; price: number; duration_minutes: number }) => {
    const response = await api.post('/services', service);
    return response.data.data;
};

export const deleteService = async (id: number) => {
    const response = await api.delete(`/services/${id}`);
    return response.data.data;
};

export const getAvailableSlots = async (date: string) => {
    const barberPhone = localStorage.getItem('selectedBarberPhone') || '';
    const qs = `date=${encodeURIComponent(date)}${barberPhone ? `&barber_phone=${encodeURIComponent(barberPhone)}` : ''}`;
    const response = await api.get(`/appointments/slots?${qs}`);
    return response.data; // { date: "...", slots: [...] }
};

export const createAppointment = async (appointment: {
    client_name: string;
    client_phone: string;
    service_id: number;
    appointment_time: string; // ISO string
    notes?: string;
}) => {
    const barberPhone = localStorage.getItem('selectedBarberPhone') || '';
    const payload = { ...appointment, barber_phone: barberPhone };
    const response = await api.post('/appointments', payload);
    return response.data.data;
};

// Admin
export const getAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data.data;
};

export const updateAppointmentStatus = async (id: number, status: string) => {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data.data;
};

export default api;
