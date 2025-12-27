import { supabase } from '@/lib/supabase';

export async function createGroupsForSession(sessionId: string) {
    const methods = ['difference', 'agreement', 'nested', 'qca'] as const;

    // Create one group for each method
    const groupsToInsert = methods.map((method, index) => ({
        session_id: sessionId,
        method_type: method,
        group_number: index + 1
    }));

    const { data, error } = await (supabase.from('groups') as any).insert(groupsToInsert).select();

    if (error) {
        console.error('Error creating groups:', error);
        return null;
    }
    return data; // Returns the created groups with IDs
}
