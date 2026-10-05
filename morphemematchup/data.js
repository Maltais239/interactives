window.MatchFamilies=[
            { 
                root: 'port', 
                affixes: {
                    'im': { reusable: true, isPrefix: true },
                    'ex': { reusable: true, isPrefix: true },
                    're': { reusable: true, isPrefix: true },
                    'sup': { reusable: true, isPrefix: true },
                    'trans': { reusable: true, isPrefix: true },
                    'er': { reusable: true, isPrefix: false },
                    'able': { reusable: true, isPrefix: false },
                    'ing': { reusable: true, isPrefix: false },
                    'ed': { reusable: true, isPrefix: false }
                },
                decoys: ['un', 'dis', 'ly', 'ive'], 
                validCombos: [
                    'import', 'export', 'report', 'support', 'transport',
                    'porter', 'importer', 'exporter', 'reporter', 'supporter', 'transporter',
                    'portable', 'importable', 'exportable', 'reportable', 'supportable', 'transportable',
                    'porting', 'importing', 'exporting', 'reporting', 'supporting', 'transporting',
                    'ported', 'imported', 'exported', 'reported', 'supported', 'transported'
                ] 
            },
            { 
                root: 'act', 
                affixes: {
                    're': { reusable: true, isPrefix: true },
                    'en': { reusable: true, isPrefix: true },
                    'inter': { reusable: true, isPrefix: true },
                    'or': { reusable: true, isPrefix: false },
                    'ion': { reusable: true, isPrefix: false },
                    'ive': { reusable: true, isPrefix: false },
                    'ing': { reusable: true, isPrefix: false },
                    'ed': { reusable: true, isPrefix: false },
                    'ual': { reusable: true, isPrefix: false }
                },
                decoys: ['dis', 'pre', 'ment'], 
                validCombos: [
                    'actor', 'action', 'active', 'acting', 'acted', 'actual',
                    'react', 'reactor', 'reaction', 'reactive', 'reacting', 'reacted',
                    'enact', 'enactor', 'enacting', 'enacted',
                    'interact', 'interactor', 'interaction', 'interactive', 'interacting', 'interacted'
                ] 
            },
            { 
                root: 'form', 
                affixes: {
                    'con': { reusable: true, isPrefix: true },
                    'de': { reusable: true, isPrefix: true },
                    're': { reusable: true, isPrefix: true },
                    'in': { reusable: true, isPrefix: true },
                    'al': { reusable: true, isPrefix: false },
                    'ation': { reusable: true, isPrefix: false },
                    'ing': { reusable: true, isPrefix: false },
                    'ed': { reusable: true, isPrefix: false },
                    'er': { reusable: true, isPrefix: false }
                },
                decoys: ['pre', 'un', 'ive'], 
                validCombos: [
                    'former', 'formal', 'formation', 'forming', 'formed',
                    'conform', 'conformer', 'conformation', 'conforming', 'conformed',
                    'deform', 'deformer', 'deformation', 'deforming', 'deformed',
                    'reform', 'reformer', 'reformation', 'reforming', 'reformed',
                    'inform', 'informer', 'information', 'informing', 'informed', 'informal'
                ] 
            },
            { 
                root: 'struct', 
                affixes: {
                    'con': { reusable: true, isPrefix: true },
                    'de': { reusable: true, isPrefix: true },
                    'in': { reusable: true, isPrefix: true },
                    're': { reusable: true, isPrefix: true },
                    'ion': { reusable: true, isPrefix: false },
                    'ure': { reusable: true, isPrefix: false },
                    'ing': { reusable: true, isPrefix: false },
                    'ed': { reusable: true, isPrefix: false },
                    'or': { reusable: true, isPrefix: false }
                },
                decoys: ['pre', 'un', 'sub'], 
                validCombos: [
                    'structure',
                    'construct', 'constructor', 'construction', 'constructing', 'constructed',
                    'destruct', 'destructor', 'destruction', 'destructing', 'destructed',
                    'instruct', 'instructor', 'instruction', 'instructing', 'instructed',
                    'restructure', 'restructuring', 'restructured'
                ] 
            }
        ];