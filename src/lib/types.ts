export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            sessions: {
                Row: {
                    id: string
                    created_at: string
                    status: 'waiting' | 'active' | 'paused' | 'finished'
                    current_phase: 'intro' | 'qr' | 'work' | 'results' | 'counterexample'
                    student_count: number
                    duration_seconds: number
                    revealed_answer: boolean
                    revealed_counterexample: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    status?: 'waiting' | 'active' | 'paused' | 'finished'
                    current_phase?: 'intro' | 'qr' | 'work' | 'results' | 'counterexample'
                    student_count?: number
                    duration_seconds?: number
                    revealed_answer?: boolean
                    revealed_counterexample?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    status?: 'waiting' | 'active' | 'paused' | 'finished'
                    current_phase?: 'intro' | 'qr' | 'work' | 'results' | 'counterexample'
                    student_count?: number
                    duration_seconds?: number
                    revealed_answer?: boolean
                    revealed_counterexample?: boolean
                }
            }
            groups: {
                Row: {
                    id: string
                    session_id: string
                    method_type: 'difference' | 'agreement' | 'nested' | 'qca'
                    group_number: number
                }
                Insert: {
                    id?: string
                    session_id: string
                    method_type: 'difference' | 'agreement' | 'nested' | 'qca'
                    group_number: number
                }
                Update: {
                    id?: string
                    session_id?: string
                    method_type?: 'difference' | 'agreement' | 'nested' | 'qca'
                    group_number?: number
                }
            }
            submissions: {
                Row: {
                    id: string
                    created_at: string
                    session_id: string
                    group_id: string
                    selected_factor: string
                    justification: string
                    device_hash: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    session_id: string
                    group_id: string
                    selected_factor: string
                    justification?: string
                    device_hash: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    session_id?: string
                    group_id?: string
                    selected_factor?: string
                    justification?: string
                    device_hash?: string
                }
            }
        }
    }
}
