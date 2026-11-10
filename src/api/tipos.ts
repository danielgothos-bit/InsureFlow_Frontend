export type Rol = "asegurado" | "agente" | "perito" | "admin";
export interface Usuario {
  id: number; username: string; email: string; first_name: string; last_name: string; role: Rol;
  id_asegurado?: string; id_perito?: string; is_active?: boolean;
}
export type Producto = "auto" | "hogar" | "vida";
export interface Poliza {
  id_poliza: string; id_asegurado: string; product_type: Producto; status: string; premium: string;
  effective_date: string; expiry_date: string;
  coverage?: { plan?: string; plan_nombre?: string; suma_asegurada?: number; placa?: string; direccion?: string; coberturas?: string[] };
  beneficiarios?: { nombre: string; relacion: string; porcentaje: string }[];
}
export interface Cotizacion { plan: string; plan_nombre: string; prima_mensual: number; prima_anual: number; suma_asegurada: number; coberturas: string[] }
export interface Siniestro {
  id_siniestro: string; id_poliza: string; id_asegurado: string; status: string; descripcion: string;
  estimated_amount: string; incident_date: string; reported_at: string;
}
export interface Historial { historial: { new_status: string; changed_at: string }[] }
export interface Inspeccion { id_inspeccion: string; id_siniestro: string; id_perito: string; status: string; scheduled_at: string; findings?: string }
export interface Pago { id_pago?: string; amount: string; status: string; method: string; paid_at?: string; due_date?: string }
export interface Documento { id_documento: string; document_type: string; nombre_archivo: string; uploaded_at: string }
export interface Notificacion { id_notificacion?: string; mensaje: string; canal: string; status: string; sent_at: string; id_siniestro?: string }
export interface Asegurado {
  id_asegurado: string; nombre: string; apellido: string; national_id: string; email: string; telefono: string;
  direccion: string; kyc_status: string; fecha_registro: string;
}
export interface Perito { id_perito: string; nombre: string; especialidad: string; zona: string; carga_activa: number; disponible: boolean }
