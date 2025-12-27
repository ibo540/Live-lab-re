const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        // Get latest session
        const { data: sessions, error: sessionError } = await supabase
            .from('sessions')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1);

        if (sessionError) throw sessionError;

        if (sessions && sessions.length > 0) {
            const sessionId = sessions[0].id;
            // Get a group from this session
            const { data: groups, error: groupError } = await supabase
                .from('groups')
                .select('id')
                .eq('session_id', sessionId)
                .limit(1);

            if (groupError) throw groupError;

            if (groups && groups.length > 0) {
                require('fs').writeFileSync('final_id.txt', groups[0].id);
            } else {
                console.error('No groups found for the latest session.');
            }
        } else {
            console.error('No sessions found.');
        }
    } catch (err) {
        console.error('Error fetching link:', err);
    }
}

run();
