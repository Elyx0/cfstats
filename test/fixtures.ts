const tests = {
    empty: {
        settings: [],
        components: [],
        expected: []
    },
    settingsEmpty: {
        settings: [],
        components: [{name: 'comp_a'}, {name: 'comp_b'}],
        expected: []
    },
    componentsEmpty: {
        settings: [{name: 'setting_a'}, {name: 'setting_b'}],
        components: [],
        expected: [{name: 'setting_a'}, {name: 'setting_b'}]
    },
    oneRequire: {
        settings: [{name: 'setting_a', requires: ['comp_a']}],
        components: [{name: 'comp_a'}, {name: 'comp_b'}],
    },
    mixedNoRequire: {
        settings: [{name: 'setting_a'}, {name: 'setting_b'}],
        components: [{name: 'comp_a'}, {name: 'comp_b'}],
        expected: [{name: 'setting_a'}, {name: 'setting_b'}]
    },
    mixedOneResult: {
        settings: [
            {name: 'setting_a', requires: ['comp_a']},
            {name: 'setting_b', requires: ['comp_c']}
        ],
        components: [{name: 'comp_a'}, {name: 'comp_b'}],
        expected: [{name: 'setting_a'}]
    },
    mixedTwoResultsOneSetting: {
        settings: [
            {name: 'setting_a', requires: ['comp_a', 'comp_b']},
            {name: 'setting_b', requires: ['comp_c']}
        ],
        components: [{name: 'comp_b'}, {name: 'comp_a'}],
        expected: [{name: 'setting_a'}]
    },
    mixedTwoResultsTwoSettings: {
        settings: [
            {name: 'setting_a', requires: ['comp_a']},
            {name: 'setting_b', requires: ['comp_b']}
        ],
        components: [{name: 'comp_b'}, {name: 'comp_a'}],
        expected: [{name: 'setting_a'},{name: 'setting_b'}]
    },
    mixedNoResultThreeSettings: {
        settings: [
            {name: 'setting_a', requires: ['comp_x']},
            {name: 'setting_b', requires: ['comp_z']},
            {name: 'setting_a', requires: ['comp_y']}
        ],
        components: [{name: 'comp_b'}, {name: 'comp_a'}],
        expected: []
    },
    sampleTestCase: {
        settings: [
            {name: 'Mixer', requires: ['audio','pcb']},
            {name: 'AttractLoop', requires: []},
            {name: 'Volume', requires: ['audio']},
        ],
        components: [
            {name: 'audio'},
            {name: 'LED array'},
        ],
        expected: [
            {name: 'Mixer'},
            {name: 'AttractLoop'},
            {name: 'Volume'},
        ]
    },
    enhancedTestCase: {
        settings: [
            {name: 'Mixer', requires: ['audio','pcb']},
            {name: 'AttractLoop', requires: []},
            {name: 'Volume', requires: ['audio']},
            {name: 'Picture', requires: ['camera']},
            {name: 'Voice', requires: ['microphone','audio']},
            {name: 'Touch', requires: ['pressure']},
            {name: 'Weather', requires: ['thermometer','clock']},
            {name: 'Alarms', requires: ['clock','audio']}
        ],
        components: [
            {name: 'audio'},
            {name: 'LED array'},
            {name: 'clock'}
        ],
        expected: [
            {name: 'Mixer'},
            {name: 'AttractLoop'},
            {name: 'Volume'},
            {name: 'Voice'},
            {name: 'Weather'},
            {name: 'Alarms'}
        ]
    },
    // Not part of requirements:
    // Resolving sub dependencies would be trivial
    subDependencies: {
        settings: [
            {name: 'setting_a', requires: ['setting_b']},
            {name: 'setting_b', requires: ['setting_c']},
            {name: 'setting_c', requires: ['comp_a']},
            {name: 'setting_d', requires: ['comp_z']}
        ],
        components: [{name: 'comp_b'}, {name: 'comp_a'}],
        expected: [{name: 'setting_a'},{name: 'setting_b'},{name: 'setting_c'}]
    },
    // Not part of requirements
    // Requires to keep a traversal list to detect circular reference
    dependencyLoop: {
        settings: [
            {name: 'setting_a', requires: ['setting_b','comp_a']},
            {name: 'setting_b', requires: ['setting_c']},
            {name: 'setting_c', requires: ['setting_a']}
        ],
        components: [{name: 'comp_b'}, {name: 'comp_a'}],
        expected: []
    }
};

export default tests;
