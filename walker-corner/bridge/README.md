# Bridge Test Lab

An illustrated bridge builder based on Tyler Walker’s Bridge Tester idea. The landscape and vehicle sprites are generated game assets. Bridge members, connections, movement, stress colours and collapse are drawn at runtime.

## Play

Connect endpoints on the construction grid. Road members join neighbouring points along the road line. Wood and steel support the deck above or below it. All joints transfer rotation and force. Crossing beams do not join unless they share an endpoint. Test a car, truck or school bus; compare saved trials in the field notebook. Challenges require the named vehicle and budget. Free build has no budget limit.

The driving surface needs eight Road sections. Missing sections are highlighted in the scene, and a gap result names the two points that need Road. An empty or incomplete restored design starts with Road selected. To convert a wood or steel beam on the road line, select Road and connect the same two neighbouring points; Undo restores the previous material. Road alone allows the vehicle to move but can bend too far without triangular bracing.

Pointer and keyboard construction are supported, with equivalent labelled point controls below the scene. Designs and the latest 40 trials persist locally under a new key, leaving the earlier classroom lab’s stored data untouched. JSON designs and CSV notebooks can be exported. Invalid imports leave the current bridge intact.

## Model

`engine.js` is a dependency-free linear 2D frame solver with three degrees of freedom at each endpoint. Euler–Bernoulli bending and axial stiffness are assembled in global coordinates; fixed bank translations leave joint rotation free. A Cholesky factorization is reused for moving axle loads. Road loads are distributed to neighbouring joints. Stress is the sum of relative axial and bending utilization; compression capacity includes a length-dependent Euler buckling limit. A deck bend above 45 world pixels fails the classroom serviceability limit. Self-weight and optional lateral wind are included.

All dimensions, stiffness, material capacity, vehicle weights and prices are scaled classroom units. Interior axle-load bending is approximated; this is not a nonlinear dynamic or real engineering safety model. After a computed failure, falling debris and the vehicle are illustrative animation, not another structural calculation.

Reference for the beam stiffness formulation: TU Delft, [Euler–Bernoulli beam elements](https://teachbooks.tudelft.nl/computational-modelling/structural_linear/euler_bernouilli.html) and [2D frame analysis](https://teachbooks.tudelft.nl/computational-modelling/structural_linear/space_frame.html).

## Verify

Run `node verification/engine.test.js`. Browser verification covers editing, undo, supported and failed crossings, saved trials, state-preserving resize and small/short viewport layouts.

Original source snapshots in `../sources/` remain unchanged. This edition replaces only the live `bridge/` game and its preview.
