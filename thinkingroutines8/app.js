const phases=[
  {id:"launch",label:"🚀 Launch",title:"Launch the learning",intro:"Surface what students notice, think, know, assume, or wonder before you start teaching."},
  {id:"explore",label:"🔎 Explore",title:"Explore ideas & evidence",intro:"Slow the thinking down. Compare perspectives, examine evidence, and build understanding."},
  {id:"discuss",label:"👥 Discuss",title:"Discuss & make meaning",intro:"Help students test ideas, hear other perspectives, and explain the reasoning behind their thinking."},
  {id:"reflect",label:"💡 Reflect / Act",title:"Reflect, synthesize & act",intro:"Make the learning visible: what changed, what matters, what remains unresolved, and what could happen next?"}
];

const routines={
  tpe:{name:"Think, Puzzle, Explore",tag:"Inquiry starter",short:"Activate prior thinking and turn uncertainty into questions worth investigating.",purpose:"A strong opener when students have some ideas about the topic but need a reason to investigate it more deeply.",time:"8–12 min",group:"Individual → pairs → class",steps:["Give students the topic, question, image, quotation, or short scenario without teaching it first.","Students record what they currently think they know. Treat these as starting ideas, not answers to mark right or wrong.","Students list puzzles, tensions, or questions they genuinely want resolved.","Ask how those puzzles could be explored. Save the thinking and revisit it later in the learning."],prompts:["What are you already thinking about this?","What feels puzzling, uncertain, or worth questioning?","What evidence or information would help us explore that?"],look:["Prior conceptions and assumptions","Student-generated questions","Possible directions for inquiry"],source:"https://www.pz.harvard.edu/resources/think-puzzle-explore"},
  stw:{name:"See, Think, Wonder",tag:"Close observation",short:"Move students from observation to interpretation to curiosity.",purpose:"Best when you can begin with something students can inspect closely: an image, map, graph, artifact, quotation, political cartoon, or short source.",time:"8–15 min",group:"Quiet think → class",steps:["Show one strong source and give silent observation time before discussion.","Collect only observations first: details students can point to in the source.","Move to interpretations. Require students to connect interpretations back to something they noticed.","Finish with genuine questions or wonderings that the class could investigate."],prompts:["What do you notice?","What do you think is going on, and what leads you there?","What does this make you wonder?"],look:["Observation before judgment","Evidence connected to interpretation","Questions that can drive inquiry"],source:"https://pz.harvard.edu/resources/see-think-wonder"},
  bridge:{name:"3–2–1 Bridge",tag:"Before & after",short:"Capture thinking before learning and deliberately bridge it to new understanding.",purpose:"Useful when students already have some prior ideas and you want visible evidence of conceptual change across a lesson or sequence.",time:"5 min + 8 min later",group:"Individual → pairs",steps:["Before learning, students quickly capture three ideas or words, two questions, and one analogy or comparison connected to the topic.","Teach, investigate, read, discuss, or examine new evidence.","Students complete a fresh 3–2–1 after the learning without erasing the first.","Students build the bridge: explain what changed, what stayed, and what caused the shift."],prompts:["What comes to mind right now?","What is different in your second response?","What experience or evidence helped move your thinking?"],look:["Movement in understanding","Persistent questions or misconceptions","Evidence students use to explain change"],source:"https://pz.harvard.edu/resources/3-2-1-bridge"},
  cov:{name:"Circle of Viewpoints",tag:"Perspective taking",short:"Explore how the same issue can look different from different positions.",purpose:"Use this when a curriculum question involves competing interests, beliefs, roles, or experiences and students need to see beyond a simple two-sided debate.",time:"15–25 min",group:"Small groups or class",steps:["Name the issue or event, then brainstorm people, groups, or roles that could reasonably hold different viewpoints.","Assign or let students choose a viewpoint. Give them evidence and context before asking them to speak from it.","Students explain how the issue may look from that position and identify a question that viewpoint might raise.","Step out of the roles. Compare what became visible from different viewpoints and identify what still requires evidence."],prompts:["Whose viewpoint could change how we understand this?","What might matter most from that position?","What new question appears when we look from there?"],look:["Multiple plausible perspectives","Use of context rather than stereotypes","Awareness that perspective shapes interpretation"],source:"https://pz.harvard.edu/thinking-routines-archive"},
  csq:{name:"Claim, Support, Question",tag:"Evidence & reasoning",short:"Turn an interpretation into a claim that must be supported and questioned.",purpose:"Excellent for analysis tasks where students need to move beyond opinion and make a defensible interpretation from evidence.",time:"12–20 min",group:"Individual or groups",steps:["Give students a source set, data, case, reading, or problem to investigate.","Students state one clear claim or interpretation.","They identify the strongest evidence or reasoning that supports the claim.","They add a question: something unexplained, uncertain, missing, or capable of challenging the claim."],prompts:["What is your claim?","What evidence gives that claim support?","What remains uncertain or needs to be tested?"],look:["Claims that answer the actual question","Evidence tied directly to claims","Questions that deepen rather than end inquiry"],source:"https://www.pz.harvard.edu/resources/claim-support-question"},
  stepinside:{name:"Step Inside",tag:"Viewpoint",short:"Examine what a person or role might perceive, know, believe, or care about.",purpose:"Useful for historical and civic situations when students have enough contextual evidence to reason from a particular role without pretending to know another person's inner life.",time:"12–20 min",group:"Pairs or small groups",steps:["Choose a clearly defined person, group, institution, or role connected to the issue.","Provide enough contextual evidence that students are not relying on stereotypes or guessing.","Students consider what this viewpoint could perceive, know or believe, and care about based on the available evidence.","Return to the class perspective and compare viewpoints, noting where evidence is strong and where uncertainty remains."],prompts:["What would this role be able to see or know?","What might matter to them in this situation?","Where are we inferring rather than knowing?"],look:["Context-grounded perspective taking","Distinction between evidence and inference","Recognition of different priorities"],source:"https://pz.harvard.edu/resources/step-inside"},
  seek:{name:"Seek to See",tag:"Dignity & complexity",short:"Look deliberately for complexity, strengths, connection, and human dignity.",purpose:"Especially valuable when studying people who may otherwise be reduced to a label, victim category, stereotype, or single event.",time:"15–25 min",group:"Individual → small group",steps:["Choose a rich first-person story, image, video, or text that provides meaningful context about a person or community.","Invite students to notice a range of possible feelings while avoiding the assumption that one feeling defines the person.","Look for strengths, cultural richness, agency, relationships, and sources of power—not only hardship.","Identify human connections and finish by articulating what preserves the person's complexity and dignity. Reflect on any shift in thinking."],prompts:["What complexity are we noticing in this person or story?","Where do you see strength, agency, connection, or cultural richness?","How can we describe this person in a way that honours their full humanity?"],look:["People represented as more than victims","Complexity rather than a single emotional story","Language that preserves dignity and agency"],source:"https://pz.harvard.edu/resources/seek-see"},
  wmys:{name:"What Makes You Say That?",tag:"Reasoning move",short:"Make students' evidence and reasoning visible with one deceptively powerful question.",purpose:"A flexible routine for moments when students offer an interpretation, assumption, judgment, or explanation and you want to uncover the thinking beneath it.",time:"5–15 min",group:"Any",steps:["Present a source, issue, concept, or question and invite an interpretation.","When a student offers an idea, follow with the routine question rather than immediately evaluating the answer.","Ask students to identify the detail, evidence, experience, or reasoning that led them there.","Invite others to build, question, or offer a different interpretation supported by evidence."],prompts:["What makes you say that?","What are you noticing that supports that idea?","What might someone else point to and interpret differently?"],look:["Evidence-based reasoning","Students explaining how they know","Multiple interpretations supported by evidence"],source:"https://pz.harvard.edu/resources/what-makes-you-say"},
  compass:{name:"Compass Points",tag:"Evaluate a proposition",short:"Examine an idea through excitement, concern, needed information, and a current stance.",purpose:"A good choice when students are considering a policy, proposal, spending choice, civic action, or other decision with trade-offs.",time:"15–25 min",group:"Groups → class",steps:["State one specific proposition or choice clearly enough that students know exactly what is being considered.","Students identify potential upsides or opportunities before moving to concerns and possible downsides.","List what additional information would be needed to evaluate the proposition responsibly.","Students give a current stance or suggestion for moving forward and explain what evidence could change it."],prompts:["What looks promising or beneficial here?","What concerns or risks should be examined?","What do we still need to know before reaching a conclusion?"],look:["Trade-offs rather than slogans","Questions about missing information","Stances that remain open to evidence"],source:"https://www.pz.harvard.edu/resources/compass-points"},
  tug:{name:"Tug for Truth",tag:"Evidence & complexity",short:"Lay out the evidence pulling a contested claim in different directions.",purpose:"Use when a historical or contemporary claim appears simple at first but needs careful evidence, qualification, and attention to complexity.",time:"20–30 min",group:"Small groups → class",steps:["Frame one claim that can be investigated with evidence. Avoid a vague opinion question.","Students add pieces of evidence that pull toward accepting, rejecting, or qualifying the claim.","Discuss the strength and relevance of each piece of evidence rather than counting how many appear on each side.","Identify what evidence would help settle or refine the question and write a more nuanced conclusion."],prompts:["What evidence pulls us toward accepting this claim?","What evidence complicates or weakens it?","What would we need to know to reach a better-supported conclusion?"],look:["Quality of evidence over quantity","Nuance and qualification","Willingness to revise a claim"],source:"https://pz.harvard.edu/resources/tug-truth"},
  cec:{name:"Connect, Extend, Challenge",tag:"Synthesis",short:"Connect new learning to prior understanding, identify what it extends, and surface remaining challenges.",purpose:"Works well after students have taken in substantial new information and need to process how it changes their understanding.",time:"10–18 min",group:"Individual → pairs",steps:["Students identify a meaningful connection between the new learning and something they already understood.","They name one idea that extended, broadened, or complicated their thinking.","They identify a challenge, tension, or puzzle that remains unresolved.","Share selectively, then use the challenges to plan the next investigation or discussion."],prompts:["What connects to something you already understood?","What extended or complicated your thinking?","What remains challenging or unresolved?"],look:["Specific conceptual connections","Evidence of extended thinking","Productive unanswered questions"],source:"https://www.pz.harvard.edu/resources/connect-extend-challenge"},
  headline:{name:"Headlines",tag:"Capture the essence",short:"Distill the most important learning into one concise headline.",purpose:"A fast synthesis routine for the end of a discussion, source investigation, or lesson when you want students to identify the core idea rather than list details.",time:"5–10 min",group:"Individual → class",steps:["Ask students to decide what idea matters most from the learning—not merely the most memorable detail.","Students write a short headline that captures that idea clearly.","Pair-share headlines and explain why each headline captures the essence.","Invite revisions after hearing others, then compare the range of emphasis across the class."],prompts:["What is the idea you would not want someone to miss?","Why does your headline capture the essence?","What would you revise after hearing another perspective?"],look:["Synthesis rather than summary lists","Different defensible emphases","Concise evidence of understanding"],source:"https://pz.harvard.edu/resources/headlines"},
  usedthink:{name:"I Used to Think… Now I Think…",tag:"Reflection",short:"Make a genuine shift in thinking visible and explain what caused it.",purpose:"Best after learning experiences likely to change, deepen, or complicate students' initial ideas.",time:"8–15 min",group:"Individual → pairs",steps:["Return students to an earlier idea, response, prediction, or first impression if one is available.","Students write what they previously thought in a concise, fair way.","They write what they now think, emphasizing how the new idea differs or has become more nuanced.","Students explain what evidence, experience, source, or discussion contributed to the change."],prompts:["What did you think at the beginning?","What do you think now?","What caused your thinking to change, deepen, or become more complicated?"],look:["Authentic conceptual change","Reasons for the shift","Comfort with revising ideas"],source:"https://www.pz.harvard.edu/resources/i-used-think-now-i-think"}
};

const outcomes=[
  {title:"Foundations of Ideologies",tag:"Time & Place",color:"c0",focus:"Students examine the foundations and influences of ideologies.",skills:["Compare Plato & Aristotle","Individualism & collectivism","Explain ideological attraction","Reflect on Holocaust accounts"],map:{
    launch:[
      ["tpe","Best when beginning ideology as a concept: surface students’ existing ideas about how society should be organized and governed.","The word ideology; governance; power; justice; individualism and collectivism."],
      ["stw","Use a carefully chosen historical image, quotation, spectrum, or contrasting source to launch observation before labels are taught.","A visual or quotation connected to governance, power, rights, or competing social priorities."],
      ["bridge","Useful for capturing students’ starting conceptions of individualism and collectivism so you can return to them later.","Individualism vs. collectivism before formal teaching."]
    ],
    explore:[
      ["cov","A natural fit for comparing philosophies and ideological perspectives without reducing them to one correct point of view.","Plato and Aristotle; democrats and aristocrats; individualist and collectivist positions."],
      ["csq","Helps students support interpretations of an ideology with evidence instead of relying on labels or stereotypes.","How individualism or collectivism appears within communism, socialism, liberalism, or conservatism."],
      ["seek","A strong, careful choice for first-person Holocaust accounts because it keeps attention on complexity, strengths, connection, and dignity.","Victim and survivor stories, testimony, primary sources, images, or short biographical accounts."]
    ],
    discuss:[
      ["wmys","Excellent for probing statements like ‘this is individualist’ or ‘this society is collectivist’ and requiring students to explain the evidence behind the label.","Comparing ideological features and positions on a spectrum."],
      ["cov","Use when students need to understand why different individuals or groups could be drawn to different ideological ideas.","Why people or groups might value different approaches to power, rights, responsibility, or social organization."],
      ["tug","Useful for a debatable historical interpretation where the evidence needs to be weighed rather than treated as obvious.","A carefully framed claim about law, leadership, rights, or ideological influence."]
    ],
    reflect:[
      ["usedthink","Perfect for showing how a student’s understanding of ideology has changed from simple labels to more nuanced ideas.","End of the ideology sequence or after comparing several ideologies."],
      ["cec","Helps students connect ideology to prior learning, extend their understanding, and identify tensions they still need to resolve.","After multiple ideologies or historical examples have been studied."],
      ["headline","A quick way to see what students now believe is the central idea about how ideologies shape society.","End of a discussion or lesson on the foundations of ideology."]
    ]}},
  {title:"Economic Systems",tag:"Systems",color:"c1",focus:"Students compare the role of individuals and governments in economic systems.",skills:["Scarcity & 3 economic questions","Market / command / mixed","Spending & taxation","Deficits, debt & trade-offs"],map:{
    launch:[
      ["tpe","Surface what students already think governments and individuals do in an economy before introducing the formal systems.","Scarcity; production, consumption, distribution; individual and government decision making."],
      ["stw","Launch from a graph, budget image, price change, unemployment graphic, or short economic scenario and let students observe before explaining.","GDP/CPI/unemployment examples; public services; a budget or spending scenario."],
      ["compass","When the lesson begins with a concrete economic proposition, this immediately surfaces perceived benefits, concerns, and needed information.","A tax change, spending proposal, public service investment, deficit, or regulation scenario."]
    ],
    explore:[
      ["csq","Strong for building evidence-based comparisons rather than saying one economic system is simply ‘better.’","Market, command, and mixed systems; real-world or historical cases."],
      ["cec","Useful after readings, graphs, videos, or case studies to connect new economic ideas to what students already know.","How events, resources, technology, or policy affect an economic system."],
      ["wmys","Use while students interpret economic data or make claims about who is making decisions in a system.","Graphs, economic indicators, spending choices, or examples of government intervention."]
    ],
    discuss:[
      ["compass","An excellent match for evaluating spending, taxation, regulation, or intervention because students must consider upsides, concerns, and missing information.","Government spending, taxation, intervention, deficits, or borrowing."],
      ["tug","Use for a precise economic claim when evidence pulls in different directions and students need to weigh trade-offs.","Claims about government intervention, deficits, debt, or individual choice."],
      ["csq","Keeps economic discussion anchored in evidence and forces every conclusion to include support and an open question.","Advantages and challenges of different economic systems."]
    ],
    reflect:[
      ["cec","A strong end-of-learning routine because economic systems are highly interconnected and often leave productive tensions.","After comparing systems or studying a real-world economic event."],
      ["headline","Quickly reveals what students think is the key trade-off or principle from the lesson.","End of a lesson on scarcity, systems, spending, taxation, deficits, or debt."],
      ["usedthink","Useful when initial beliefs about markets, government involvement, taxation, or deficits have become more nuanced.","After evidence-rich comparison or case study work."]
    ]}},
  {title:"Political Systems & Rights",tag:"Systems",color:"c2",focus:"Students compare government control and individual rights within political systems.",skills:["Government structures","Democracy & representation","Branches of government","Political parties & participation"],map:{
    launch:[
      ["stw","Ideal for starting with a diagram, chamber image, ballot, institutional photograph, or political-system visual before introducing vocabulary.","Democracy, monarchy, dictatorship, oligarchy, branches of government, parliamentary and presidential systems."],
      ["tpe","Lets students surface what they think governments do and questions they have about how power is organized.","Government control, individual rights, democracy, representation, political parties."],
      ["bridge","Capture students’ first understanding of democracy or government power, then return after the system has been studied in detail.","Parliamentary democracy; government control and individual rights."]
    ],
    explore:[
      ["stepinside","Useful for examining how institutions look from defined civic roles, provided students have evidence about what each role actually does.","Citizen, voter, MP, senator, judge, cabinet minister, opposition member, party volunteer."],
      ["cov","Helps students compare institutional or civic viewpoints without turning the lesson into a winner/loser exercise.","Government and opposition; branches of government; different participants in a political system."],
      ["csq","A strong fit for comparing how systems are structured and making evidence-based claims about similarities and differences.","Parliamentary vs. presidential democracy; branches of government; party systems."]
    ],
    discuss:[
      ["tug","Useful for carefully framed claims about how political systems balance control, rights, representation, or accountability.","Government control vs. individual rights; institutional checks; representation."],
      ["wmys","Keeps discussion grounded when students make claims about how a political system, institution, or party system operates.","Comparisons among political systems and government structures."],
      ["cov","Use to reveal how the same institutional decision may be experienced differently by different participants.","Citizen, elected representative, opposition, executive, judiciary, or other defined roles."]
    ],
    reflect:[
      ["headline","Excellent after a complex systems lesson: students must state what matters most about how the political structure works.","Canada’s parliamentary democracy, branches of government, political parties, or system comparison."],
      ["cec","Helps students connect system structures to the larger idea of balancing government control with rights and freedoms.","After studying institutions, party organization, or comparative systems."],
      ["usedthink","Useful for showing how students’ image of ‘government’ has become more differentiated and precise.","End of a political systems sequence."]
    ]}},
  {title:"Civic Engagement",tag:"Citizenship",color:"c3",focus:"Students examine civic engagement to understand and influence issues and events.",skills:["Investigate issues","Community opportunities","Global impacts","Democratic participation"],map:{
    launch:[
      ["stw","A strong current-issues opener: begin with a neutral image, graph, headline set, map, or source and separate observation from interpretation.","A local, national, or global issue connected to citizens’ lives."],
      ["tpe","Use before researching an issue to surface prior thinking, uncertainties, and student-generated questions.","Any contemporary issue or event selected for investigation."],
      ["bridge","Capture students’ starting thinking about civic engagement itself, then revisit after they study multiple ways citizens can participate.","What it means to be an engaged citizen; ways people can participate."]
    ],
    explore:[
      ["cov","Helps students investigate how an issue can affect citizens, leaders, organizations, and communities differently.","A local or global issue with multiple affected groups and decision-makers."],
      ["csq","Keeps current-issue research from becoming unsupported opinion by requiring claims, evidence, and open questions.","Research into impacts, possible actions, or community opportunities."],
      ["wmys","A simple but powerful move while examining articles, graphs, posts, speeches, or other sources about a current issue.","Claims about impacts, causes, or proposed responses to an issue."]
    ],
    discuss:[
      ["compass","A natural fit when students are examining a possible civic response and need to weigh benefits, concerns, information needs, and next steps.","A community initiative, advocacy idea, volunteer action, protest, campaign activity, or other civic response."],
      ["cov","Helps a class hear more than the loudest or most familiar perspective before discussing possible action.","Citizens, community groups, leaders, people affected by an issue, and decision-makers."],
      ["tug","Use when the class is evaluating a factual or causal claim connected to an issue and has evidence that needs careful weighing.","A contestable claim about an issue’s impact, cause, or proposed response."]
    ],
    reflect:[
      ["bridge","Excellent for showing how students’ understanding of an issue and possible civic action changed through investigation.","After a current-issue inquiry or civic engagement sequence."],
      ["headline","A concise exit routine that captures the most important understanding students are taking from the issue.","End of an issue investigation or discussion."],
      ["cec","Helps students identify how the issue connects to their lives, what extended their thinking, and what questions or challenges remain.","Before planning further inquiry or considering civic action."]
    ]}}
];

let oi=0,pi=0,choice=null;
const $=id=>document.getElementById(id);

function renderOutcomes(){
  $("outcomes").innerHTML=outcomes.map((o,i)=>`<button class="outcome ${o.color} ${i===oi?"on":""}" data-o="${i}"><small>${o.tag}</small><b>${i+1}. ${o.title}</b><span>${o.focus}</span></button>`).join("");
  document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{oi=+b.dataset.o;choice=null;render();$("workspace").scrollIntoView({behavior:"smooth",block:"start"});});
}
function renderPhases(){
  $("phases").innerHTML=phases.map((p,i)=>`<button class="phase p${i} ${i===pi?"on":""}" data-p="${i}">${p.label}</button>`).join("");
  document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{pi=+b.dataset.p;choice=null;renderPhase();});
}
function renderPhase(){
  const o=outcomes[oi],p=phases[pi],items=o.map[p.id];
  $("phaseTitle").textContent=p.title;
  $("phaseIntro").textContent=p.intro;
  $("routines").innerHTML=items.map(([id,why,useWith])=>{const r=routines[id];return `<button class="routine ${choice===id?"on":""}" data-r="${id}"><span class="dot"></span><i>${r.tag}</i><h3>${r.name}</h3><p>${r.short}</p></button>`}).join("");
  document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{choice=b.dataset.r;renderPhase();});
  $("go").disabled=!choice;
  $("selected").textContent=choice?`${routines[choice].name} selected — ready when you are.`:"Choose one routine.";
}
function render(){
  renderOutcomes();renderPhases();
  const o=outcomes[oi];
  $("outTitle").textContent=o.title;
  $("outText").textContent=o.focus;
  $("skills").innerHTML=o.skills.map(s=>`<span>${s}</span>`).join("");
  renderPhase();
}
function openPlan(){
  if(!choice)return;
  const o=outcomes[oi],p=phases[pi],r=routines[choice],match=o.map[p.id].find(x=>x[0]===choice);
  $("crumb").textContent=`Grade 8 • ${o.tag} • ${o.title} • ${p.label.replace(/^.. /,"")}`;
  $("planName").textContent=r.name;
  $("purpose").textContent=r.purpose;
  $("meta").innerHTML=`<span>⏱ ${r.time}</span><span>👥 ${r.group}</span><span>🎯 ${p.title}</span>`;
  $("why").textContent=match[1];
  $("steps").innerHTML=r.steps.map(s=>`<div class="step">${s}</div>`).join("");
  $("use").innerHTML=match[2].split("; ").map(x=>`<li>${x}</li>`).join("");
  $("prompts").innerHTML=r.prompts.map(x=>`<li>${x}</li>`).join("");
  $("look").innerHTML=r.look.map(x=>`<li>${x}</li>`).join("");
  $("source").href=r.source;
  $("source").textContent=`View ${r.name} at Project Zero ↗`;
  $("plan").classList.add("open");
  $("plan").scrollIntoView({behavior:"smooth",block:"start"});
}
$("go").onclick=openPlan;
$("back").onclick=()=>{$("plan").classList.remove("open");$("workspace").scrollIntoView({behavior:"smooth",block:"start"});};
render();