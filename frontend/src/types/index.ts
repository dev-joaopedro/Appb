export interface Service {
    id: number;
    title: string;
    price: number;
    duration_minutes: number;
    active: boolean;
}

export interface Appointment {
    id: number;
    client_name: string;
    client_phone: string;
    service_id: number;
    service?: Service;
    appointment_time: string;
    status: string;
    notes?: string;
}
// Types definition
