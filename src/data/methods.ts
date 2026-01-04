export type Case = {
    id: string;
    label: string;
    conditions: Record<string, boolean>;
    outcome: boolean;
    stats?: { noProtest: number; protest: number; };
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
        title: 'Qualitative Comparative Analysis (QCA): Student Protests',
        description: 'Analyze combinations of conditions to find consistent causal paths.',
        scenarioText: 'A university wants to understand why student protests occur on campus. Administrators believe protests do not result from a single factor, but from specific combinations of conditions.\n\nData are collected across multiple academic terms. Instead of analyzing individual cases one by one, the observations are grouped into combinations of conditions. Each combination shows how often protests occurred or did not occur under that configuration.\n\nThree conditions are examined:\n\n**A. Tuition Increase**\nYes. Tuition fees increased during the term\nNo. No tuition increase\n\n**B. Student Mobilization Capacity**\nYes. Active and organized student groups exist\nNo. Weak or fragmented student organization\n\n**C. Trust in University Administration**\nYes. Majority of students trust the administration\nNo. No majority trust\n\nThe outcome of interest is whether student protests occurred.',
        question: 'Based on the truth table and the minimized causal paths, which statement best reflects the QCA finding about student protests?',
        cases: [
            { id: '1', label: '1', conditions: { 'A (Tuition Increase)': false, 'B (Student Mobilization)': false, 'C (Trust in Administration)': true }, outcome: false, stats: { noProtest: 3, protest: 0 } },
            { id: '2', label: '2', conditions: { 'A (Tuition Increase)': false, 'B (Student Mobilization)': false, 'C (Trust in Administration)': false }, outcome: false, stats: { noProtest: 2, protest: 0 } },
            { id: '3', label: '3', conditions: { 'A (Tuition Increase)': false, 'B (Student Mobilization)': true, 'C (Trust in Administration)': true }, outcome: false, stats: { noProtest: 1, protest: 0 } },
            { id: '4', label: '4', conditions: { 'A (Tuition Increase)': false, 'B (Student Mobilization)': true, 'C (Trust in Administration)': false }, outcome: true, stats: { noProtest: 0, protest: 2 } },
            { id: '5', label: '5', conditions: { 'A (Tuition Increase)': true, 'B (Student Mobilization)': false, 'C (Trust in Administration)': true }, outcome: false, stats: { noProtest: 2, protest: 0 } },
            { id: '6', label: '6', conditions: { 'A (Tuition Increase)': true, 'B (Student Mobilization)': false, 'C (Trust in Administration)': false }, outcome: true, stats: { noProtest: 1, protest: 1 } },
            { id: '7', label: '7', conditions: { 'A (Tuition Increase)': true, 'B (Student Mobilization)': true, 'C (Trust in Administration)': true }, outcome: true, stats: { noProtest: 0, protest: 1 } },
            { id: '8', label: '8', conditions: { 'A (Tuition Increase)': true, 'B (Student Mobilization)': true, 'C (Trust in Administration)': false }, outcome: true, stats: { noProtest: 0, protest: 5 } },
        ],
        options: [
            'Student protests occur whenever tuition increases, regardless of other conditions.',
            'Student protests occur only when trust in the administration is low.',
            'Student protests occur when student mobilization is present together with either low trust in the administration or a tuition increase.',
            'Student protests occur only when all three conditions are present at the same time.'
        ],
        correctAnswer: 'Student protests occur when student mobilization is present together with either low trust in the administration or a tuition increase.',
    },
};
