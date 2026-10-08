# Bridge Test Lab

An illustrated bridge builder based on Tyler Walker’s Bridge Tester idea. The landscape and vehicle sprites are generated game assets. Bridge members, connections, movement, stress colours and collapse are drawn at runtime.

## Play

Connect endpoints on the construction grid. Road members join neighbouring points along the road line. Wood and steel support the deck above or below it. All joints transfer rotation and force. Crossing beams do not join unless they share an endpoint. Choose a car, pickup, pickup with a loaded trailer, school bus, freight semi, tanker semi or tank; compare saved trials in the field notebook. Challenges require the named vehicle and budget; design missions also check their structure and fixed wind. Free build has no budget limit.

The driving surface needs eight Road sections. Missing sections are highlighted in the scene, and a gap result names the two points that need Road. An empty or incomplete restored design starts with Road selected. To convert a wood or steel beam on the road line, select Road and connect the same two neighbouring points; Undo restores the previous material. Road alone allows the vehicle to move but can bend too far without triangular bracing.

Pointer and keyboard construction are supported, with equivalent labelled point controls below the scene. Designs and the latest 40 trials persist locally under a new key, leaving the earlier classroom lab’s stored data untouched. JSON designs and CSV notebooks can be exported. Invalid imports leave the current bridge intact.

## Bridge and load experiments

Four view-only bridge examples are available: a deep steel beam frame, the original wood truss, a raised steel arch with vertical ties, and a suspension design with braced steel towers, bank-anchored backstays, a segmented main cable and cable hangers. The player starts with Road only and builds the supports by hand. Start over returns to Road only and can be undone. The examples never replace the player’s design. Cable is a fourth construction material, at $26 per grid unit; keyboard shortcut 5 selects it while the existing shortcut 4 continues to select Erase.

The illustrated fleet replaces the load slider: Car 10, Pickup 25, Pickup + trailer 37.5, School bus 45, Freight semi 60, Tanker semi 75, and Tank 90 relative load units. Pickup and trailer use three contacts, freight semis five, tankers six, and tanks six distributed track contacts. Contact fractions sum to the vehicle weight; each load is distributed to adjacent deck joints and contributes local road bending. These are classroom units, not tonnes. The first seven sequential levels require Car, Pickup, Pickup + trailer, School bus, Freight semi, Tanker semi, then Tank. Five design missions follow: Efficient truss (Pickup, $1,000), Steel beam (Bus, $1,250), Arch crossing (Pickup + trailer, $1,300), Suspension (Car, $1,250), and Storm crossing (Tank in gusty wind, $1,900). Each win requires the level’s exact vehicle, its fixed weight, a successful crossing and its budget. Next challenge keeps the current bridge and advances to the next mission. Players may use the reversible road-only action to try a new structure. Design missions use lighter vehicles to investigate a different way of carrying load. Completed levels can be replayed; later vehicles and levels stay locked until earned. Free build lets players use any vehicle without earning progression.

The notebook and CSV record bridge design, vehicle, load percentage, load units, wind, cost, outcome, stress and maximum deck bending. Restoring a trial restores its load and wind. Earlier trials and imports open in Free build; they do not unlock levels. New challenge designs restore only at unlocked levels. JSON version 4 exports these settings and identifies designs built in the challenge journey. Versions 1, 2 and 3 remain supported, including old percentage loads; restored historical tests keep that weight and show it as a saved load. Choosing a fleet vehicle returns to its fixed weight. The existing browser storage key is retained so current work is preserved. Undo also restores the previous starting-design label.

## Model

`engine.js` is a dependency-free linear 2D frame solver with three degrees of freedom at each endpoint. Euler–Bernoulli bending and axial stiffness are assembled in global coordinates; fixed bank translations leave joint rotation free. A Cholesky factorization is reused for moving axle loads. Road loads are distributed to neighbouring joints. Stress is the sum of relative axial and bending utilization; compression capacity includes a length-dependent Euler buckling limit. A deck bend above 45 world pixels fails the classroom serviceability limit. Self-weight and optional lateral wind are included.

Cable elements use current endpoint separation and a rest length 0.3% shorter than their installed length. Tension is `EA * max(0, length/rest_length - 1)`; compression force and bending stiffness are exactly zero. The tangent includes material and geometric stiffness. Cable-only nodes have translation degrees of freedom, without invented rotational stiffness. A damped Newton solve minimizes total potential energy; temporary tangent regularization helps slack cables re-engage, contributes no force or energy, and is removed when checking final equilibrium. A singular or unconverged equilibrium fails. A previous converged solution accelerates the next axle position. Frame-only bridges retain the original linear calculation. The scan records maximum bending across the whole crossing, separately from the position of maximum stress.

All dimensions, stiffness, material capacity, vehicle weights and prices are scaled classroom units. Interior axle-load bending is approximated; this is not a nonlinear dynamic or real engineering safety model. After a computed failure, falling debris and the vehicle are illustrative animation, not another structural calculation.

Reference for the beam stiffness formulation: TU Delft, [Euler–Bernoulli beam elements](https://teachbooks.tudelft.nl/computational-modelling/structural_linear/euler_bernouilli.html) and [2D frame analysis](https://teachbooks.tudelft.nl/computational-modelling/structural_linear/space_frame.html).

Cable formulation references: [OpenSees corotational truss](https://opensees.github.io/OpenSeesDocumentation/user/manual/model/elements/CorotationalTruss.html) and [COMSOL modeling wires and cables](https://doc.comsol.com/6.3/doc/com.comsol.help.sme/sme_ug_modeling.05.053.html). This is an independently implemented classroom approximation, not either software package.

## Verify

Run `node verification/engine.test.js` for 76 assertions covering original frame behavior, load scaling, structural features, tension and slack, suspension weight equilibrium, backstay removal, and old/new design import settings. Browser verification covers editing, undo, fleet choices, over-budget goals, supported and failed crossings, trial restoration, state-preserving resize and small/short viewport layouts.

Original source snapshots in `../sources/` remain unchanged. This edition replaces only the live `bridge/` game and its preview.

## Vehicle artwork

New transparent sprites were created with the built-in imagegen tool from the original vehicle artwork as a style reference. The shared prompt requested a detailed hand-painted, flat left-side vehicle facing right, all contact points on a horizontal baseline, full silhouette, genuine alpha transparency, and no text, logos, scenery or motion trails. Subjects were an orange pickup towing timber, a red freight semi, a navy silver-tanker semi, and an olive tracked tank. Final cropped game assets are `assets/trailer.webp`, `assets/semi.webp`, `assets/tanker.webp`, and `assets/tank.webp`.

## Budget goals

Tests are allowed above budget so students can compare strength and cost. Completing a challenge requires a successful crossing, the required vehicle and load, a cost at or below its budget. The build-cost panel and over-budget crossing result explicitly identify the missing budget goal. Free build has no budget limit. Notebook entries distinguish crossing success from challenge completion.

## Challenge journey

`progression.js` defines twelve ordered missions, budgets, structural goals, fixed wind, three hints per mission, win eligibility and session migration. The original seven level IDs and progression version remain unchanged: current players keep their bridge, notebook and earned levels, and previous seven-level finishers unlock Level 8. Progress is recorded only by a completed in-budget run of the unlocked level’s required vehicle at its fixed weight, with any required structure and wind. Structure checks use shared endpoints: a steel beam frame needs a continuous lower path between anchors; an arch needs a raised steel path between anchors; suspension needs towers, backstays, main cable and at least three hangers. Trusses need at least four non-collinear triangles. Failed runs, over-budget crossings, Free build, repeat wins and imported progress cannot skip or unlock later levels. Progress persists beside the player’s bridge and notebook using the existing browser key. Browsers with pre-journey work start Level 1 on Road only; their previous bridge remains available in Free build. Campaign and Free build drafts are kept separately so switching modes cannot transfer an example or old completed bridge into the challenge journey.

Completed beam, truss, arch and suspension structures are rendered inside a separate view-only guide. There is no load-template action. The player’s design, undo history and progress remain unchanged when viewing examples. The former starting-design loader is replaced by Bridge examples and a reversible Start over · road only action.

Run `node verification/progression.test.js` to verify sequential gating, budget failures, replay, full completion, fixed loads, migration, and challenge-file compatibility. The original 76 physics checks still run separately.

## Design guidance and test readings

Peak stress, its colour legend and the taut/slack cable count sit in a wrapping strip outside the canvas, directly below the scene. They remain visible after a test and never cover the bridge or vehicle. Each mission has a visible design hint and two more tips in an expandable panel below the construction tools. View-only examples add build-order suggestions and an expandable explanation of triangles, frame depth, tension/compression and shared joints. No example can be loaded into a player’s bridge.
