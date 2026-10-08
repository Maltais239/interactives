# Bridge Test Lab

An illustrated bridge builder based on Tyler Walker’s Bridge Tester idea. The landscape and vehicle sprites are generated game assets. Bridge members, connections, movement, stress colours and collapse are drawn at runtime.

## Play

Connect endpoints on the construction grid. Road members join neighbouring points along the road line. Wood and steel support the deck above or below it. All joints transfer rotation and force. Crossing beams do not join unless they share an endpoint. Test a car, truck or school bus; compare saved trials in the field notebook. Challenges require the named vehicle and budget. Free build has no budget limit.

The driving surface needs eight Road sections. Missing sections are highlighted in the scene, and a gap result names the two points that need Road. An empty or incomplete restored design starts with Road selected. To convert a wood or steel beam on the road line, select Road and connect the same two neighbouring points; Undo restores the previous material. Road alone allows the vehicle to move but can bend too far without triangular bracing.

Pointer and keyboard construction are supported, with equivalent labelled point controls below the scene. Designs and the latest 40 trials persist locally under a new key, leaving the earlier classroom lab’s stored data untouched. JSON designs and CSV notebooks can be exported. Invalid imports leave the current bridge intact.

## Bridge and load experiments

Four starting structures are available: a deep steel beam frame, the original wood truss, a raised steel arch with vertical ties, and a suspension design with braced steel towers, bank-anchored backstays, a segmented main cable and cable hangers. Road-only, unbraced and empty designs remain available. Cable is a fourth construction material, at $26 per grid unit; keyboard shortcut 5 selects it while the existing shortcut 4 continues to select Erase.

Vehicle load ranges from 50% to 200% in steps of 10%. At 100%, Car is 10 relative load units, Truck is 25, and Bus is 45. The same percentage scales both moving axle loads and interior deck bending. These are classroom units, not tonnes. Heavy haul requires a truck at 150% or more. Beam, truss, arch and suspension challenges also require structural features, a minimum load and a budget: changing the label or reducing the load does not satisfy them.

The notebook and CSV record bridge design, vehicle, load percentage, load units, wind, cost, outcome, stress and maximum deck bending. Restoring a trial restores its load and wind. JSON version 2 exports these settings; version 1 designs and older browser trials open at their original 100% load. The existing browser storage key is retained so current work is preserved. Undo also restores the previous starting-design label.

## Model

`engine.js` is a dependency-free linear 2D frame solver with three degrees of freedom at each endpoint. Euler–Bernoulli bending and axial stiffness are assembled in global coordinates; fixed bank translations leave joint rotation free. A Cholesky factorization is reused for moving axle loads. Road loads are distributed to neighbouring joints. Stress is the sum of relative axial and bending utilization; compression capacity includes a length-dependent Euler buckling limit. A deck bend above 45 world pixels fails the classroom serviceability limit. Self-weight and optional lateral wind are included.

Cable elements use current endpoint separation and a rest length 0.3% shorter than their installed length. Tension is `EA * max(0, length/rest_length - 1)`; compression force and bending stiffness are exactly zero. The tangent includes material and geometric stiffness. Cable-only nodes have translation degrees of freedom, without invented rotational stiffness. A damped Newton solve minimizes total potential energy; temporary tangent regularization helps slack cables re-engage, contributes no force or energy, and is removed when checking final equilibrium. A singular or unconverged equilibrium fails. A previous converged solution accelerates the next axle position. Frame-only bridges retain the original linear calculation. The scan records maximum bending across the whole crossing, separately from the position of maximum stress.

All dimensions, stiffness, material capacity, vehicle weights and prices are scaled classroom units. Interior axle-load bending is approximated; this is not a nonlinear dynamic or real engineering safety model. After a computed failure, falling debris and the vehicle are illustrative animation, not another structural calculation.

Reference for the beam stiffness formulation: TU Delft, [Euler–Bernoulli beam elements](https://teachbooks.tudelft.nl/computational-modelling/structural_linear/euler_bernouilli.html) and [2D frame analysis](https://teachbooks.tudelft.nl/computational-modelling/structural_linear/space_frame.html).

Cable formulation references: [OpenSees corotational truss](https://opensees.github.io/OpenSeesDocumentation/user/manual/model/elements/CorotationalTruss.html) and [COMSOL modeling wires and cables](https://doc.comsol.com/6.3/doc/com.comsol.help.sme/sme_ug_modeling.05.053.html). This is an independently implemented classroom approximation, not either software package.

## Verify

Run `node verification/engine.test.js` for 50 assertions covering original frame behavior, load scaling, structural features, tension and slack, suspension weight equilibrium, backstay removal, and old/new design import settings. Browser verification covers editing, undo, load controls, supported and failed crossings, trial restoration, state-preserving resize and small/short viewport layouts.

Original source snapshots in `../sources/` remain unchanged. This edition replaces only the live `bridge/` game and its preview.
