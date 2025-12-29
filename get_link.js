const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getGroup() {
    // Get the most recent session
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

    if (!sessions || sessions.length === 0) {
        console.log('No sessions found');
        return;
    }

    const sessionId = sessions[0].id;

    // Get groups for this session
    const { data: groups } = await supabase
        .from('groups')
        .select('id, method_type')
        .eq('session_id', sessionId)
        .limit(1);

    if (groups && groups.length > 0) {
        console.log(`GROUP_ID=${groups[0].id}`);
        console.log(`METHOD=${groups[0].method_type}`);
    } else {
        console.log('No groups found');
    }
}

getGroup();
