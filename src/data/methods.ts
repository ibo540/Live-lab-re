export type Case = {
    id: string;
    label: string;
    conditions: Record<string, boolean>;
    outcome: boolean;
};

export type MethodScenario = {
    id: string;
    title: string;
    description: string;
    question: string;
    cases: Case[];
    options: string[];
    correctAnswer: string;
    counterExample?: Case;
    counterExampleExplanation?: string;
    scenarioText: string;
};

export const METHODS: Record<string, MethodScenario> = {
    difference: {
        id: 'difference',
        title: 'Method of Difference',
        description: 'Find the single factor that varies between the two cases.',
        scenarioText: 'You are investigating why Professor Smith was late to class. You have data from two different days. On Day 1, he was late. On Day 2, he was on time. Everything was exactly the same on both days, except for one thing.',
        question: 'Which factor explains the difference in the outcome?',
        cases: [
            {
                id: 'c1',
                label: 'Case 1',
                conditions: {
                    Morning: true,
                    Commute: true,
                    BackToBack: true,
                    Meeting: true,
                    // Noise (Same in both)
                    WoreSuit: true,
                    HadBreakfast: true,
                    CheckedEmail: true
                },
                outcome: true, // TRUE = Late
            },
            {
                id: 'c2',
                label: 'Case 2',
                conditions: {
                    Morning: true,
                    Commute: true,
                    BackToBack: true,
                    Meeting: false,
                    // Noise (Same in both)
                    WoreSuit: true,
                    HadBreakfast: true,
                    CheckedEmail: true
                },
                outcome: false, // FALSE = Not Late
            },
        ],
        options: ['Morning Class', 'Commute Problems', 'Back-to-back Teaching', 'Department Meeting', 'Wore Suit'],
        correctAnswer: 'Department Meeting',
        counterExample: {
            id: 'c3',
            label: 'Counterexample',
            conditions: { Morning: false, Commute: false, BackToBack: false, Meeting: false },
            outcome: true,
        },
        counterExampleExplanation: 'This case shows the professor was late even without the meeting, suggesting the meeting is not a necessary cause.'
    },
    agreement: {
        id: 'agreement',
        title: 'Method of Agreement',
        description: 'Find the single factor that is shared between the two cases.',
        scenarioText: 'You are looking at two different days where Professor Smith was late. The days were completely different in almost every way (weather, traffic, schedule), except for one shared factor. What is the one thing present in both cases?',
        question: 'Which shared factor could explain the lateness?',
        cases: [
            {
                id: 'c1',
                label: 'Case 1',
                conditions: {
                    Morning: true,
                    Commute: false,
                    BackToBack: false,
                    Meeting: false,
                    // Noise (Different in both)
                    WoreSuit: true,
                    HadBreakfast: false,
                    CheckedEmail: true
                },
                outcome: true,
            },
            {
                id: 'c2',
                label: 'Case 2',
                conditions: {
                    Morning: true,
                    Commute: true,
                    BackToBack: true,
                    Meeting: true,
                    // Noise (Different in both)
                    WoreSuit: false,
                    HadBreakfast: true,
                    CheckedEmail: false
                },
                outcome: true,
            },
        ],
        options: ['Morning Class', 'Commute Problems', 'Back-to-back Teaching', 'Department Meeting', 'Wore Suit'],
        correctAnswer: 'Morning Class',
        counterExample: {
            id: 'c3',
            label: 'Counterexample',
            conditions: { Morning: false, Commute: true, BackToBack: true, Meeting: false },
            outcome: true,
        },
        counterExampleExplanation: 'Here, the professor was late despite it NOT being a morning class, showing "Morning Class" is not sufficient.'
    },
    nested: {
        id: 'nested',
        title: 'Nested Case Design: Faculties Nested Within One University',
        description: 'Comparison of sub-units (faculties) within the same larger unit (university) to control for institutional factors.',
        scenarioText: 'A large public university introduces a new attendance policy that affects eligibility for course credit. The policy applies equally to all faculties. Tuition fees, grading rules, exam schedules, university leadership, and disciplinary procedures are identical across the university.\n\nIn the semester following the policy change, a student protest occurs in one faculty. No protest occurs in two other faculties.\n\nA researcher seeks to explain why the protest occurred in only one faculty. The university is treated as the larger case. Faculties are treated as cases nested within the same institutional context.',
        question: 'Based on the table, which factor best explains why students protested in the Agriculture faculty?',
        cases: [
            {
                id: 'n1',
                label: 'Business Admin',
                conditions: {
                    'Class Size (Large)': true,
                    'Student Org Strength (Strong)': false,
                    'Attendance Policy (New)': true,
                    'University Leadership': true
                },
                outcome: false,
            },
            {
                id: 'n2',
                label: 'Computer Engineering',
                conditions: {
                    'Class Size (Large)': true,
                    'Student Org Strength (Strong)': false,
                    'Attendance Policy (New)': true,
                    'University Leadership': true
                },
                outcome: false,
            },
            {
                id: 'n3',
                label: 'Agriculture',
                conditions: {
                    'Class Size (Large)': true,
                    'Student Org Strength (Strong)': true, // This is the differing factor
                    'Attendance Policy (New)': true,
                    'University Leadership': true
                },
                outcome: true, // Protest Occurred
            }
        ],
        options: [
            'Class size',
            'Attendance policy',
            'Student organization strength',
            'University leadership'
        ],
        correctAnswer: 'Student organization strength',
    },
    qca: {
        id: 'qca',
        title: 'Qualitative Comparative Analysis (QCA)',
        description: 'Analyze combinations of conditions.',
        scenarioText: 'We have collected data from 8 different days. Lateness seems complex—it might not be just one cause, but a combination of factors. Look at the truth table below to find which combination of conditions consistently leads to the professor being late.',
        question: 'Which condition or combination leads to lateness?',
        cases: [
            // Simplified Truth Table Representation
            { id: '1', label: 'Row 1', conditions: { 'A (Morning Class)': false, 'C (Back-to-Back)': false, 'D (Dept. Meeting)': false }, outcome: false },
            { id: '2', label: 'Row 2', conditions: { 'A (Morning Class)': false, 'C (Back-to-Back)': false, 'D (Dept. Meeting)': true }, outcome: true },
            { id: '3', label: 'Row 3', conditions: { 'A (Morning Class)': false, 'C (Back-to-Back)': true, 'D (Dept. Meeting)': false }, outcome: false },
            { id: '4', label: 'Row 4', conditions: { 'A (Morning Class)': false, 'C (Back-to-Back)': true, 'D (Dept. Meeting)': true }, outcome: true },
            { id: '5', label: 'Row 5', conditions: { 'A (Morning Class)': true, 'C (Back-to-Back)': false, 'D (Dept. Meeting)': false }, outcome: false },
            { id: '6', label: 'Row 6', conditions: { 'A (Morning Class)': true, 'C (Back-to-Back)': false, 'D (Dept. Meeting)': true }, outcome: true },
            { id: '7', label: 'Row 7', conditions: { 'A (Morning Class)': true, 'C (Back-to-Back)': true, 'D (Dept. Meeting)': false }, outcome: true }, // A + C also causes it?
            { id: '8', label: 'Row 8', conditions: { 'A (Morning Class)': true, 'C (Back-to-Back)': true, 'D (Dept. Meeting)': true }, outcome: true },
        ],
        options: [
            'Meeting (D) is the only cause',
            'Morning (A) AND Back-to-Back (C)',
            'Either Meeting (D) OR (Morning (A) AND Back-to-Back (C))',
            'No clear pattern'
        ],
        correctAnswer: 'Either Meeting (D) OR (Morning (A) AND Back-to-Back (C))'
    }
};
