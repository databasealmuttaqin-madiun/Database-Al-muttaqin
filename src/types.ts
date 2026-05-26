export type SantriStatus = 'aktif' | 'pulang' | 'sakit';

export interface Santri {
  id?: number;
  nama: string;
  kelas: string;
  status: SantriStatus;
  nfc_id?: string;
  created_at?: string;
}
