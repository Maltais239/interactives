#!/usr/bin/env python3
"""Generates all Social Studies 7-9 activity pages + the index hub."""
import json, os, html

ROOT = "/home/claude/ss"

# Each activity is a self-describing dict consumed by assets/engine.js
ACTIVITIES = [
# ============================ GRADE 7 ============================
{
 "grade":7,"slug":"confederation-terms","tier":1,"dok":"DOK 1 · Match",
 "type":"match","title":"Confederation: Key Terms","cat":"Time & Place",
 "subtitle":"Drag each term onto its definition. (How has Canada changed since Confederation?)",
 "pairs":[
   {"key":"a","left":"The 1867 union of colonies into one country","right":"Confederation","emoji":"🤝"},
   {"key":"b","left":"The name for the self-governing country Canada became in 1867","right":"Dominion","emoji":"🍁"},
   {"key":"c","left":"The 1867 law that created Canada and split federal & provincial powers","right":"British North America Act","emoji":"📜"},
   {"key":"d","left":"Leaders who negotiated Canada's creation at Charlottetown, Quebec & London","right":"Fathers of Confederation","emoji":"🎩"},
   {"key":"e","left":"Vast territory purchased from the Hudson's Bay Company in 1870","right":"Rupert's Land","emoji":"🗺️"},
   {"key":"f","left":"Certificates issued to Métis in exchange for land rights","right":"Scrip","emoji":"🎟️"},
   {"key":"g","left":"Temporary government Louis Riel formed at Red River in 1869","right":"Provisional government","emoji":"🏴"},
 ]},
{
 "grade":7,"slug":"joining-confederation","tier":2,"dok":"DOK 2 · Sequence",
 "type":"sequence","title":"Joining Confederation","cat":"Time & Place",
 "subtitle":"Put the provinces and territories in the order they entered Confederation, earliest to latest.",
 "items":[
   {"key":"a","label":"Ontario, Quebec, Nova Scotia & New Brunswick (1867)","order":1,"emoji":"🍁"},
   {"key":"b","label":"Manitoba & the Northwest Territories (1870)","order":2,"emoji":"🌾"},
   {"key":"c","label":"British Columbia (1871)","order":3,"emoji":"🏔️"},
   {"key":"d","label":"Prince Edward Island (1873)","order":4,"emoji":"🦞"},
   {"key":"e","label":"Yukon (1898)","order":5,"emoji":"⛏️"},
   {"key":"f","label":"Alberta & Saskatchewan (1905)","order":6,"emoji":"🌻"},
   {"key":"g","label":"Newfoundland & Labrador (1949)","order":7,"emoji":"🐟"},
   {"key":"h","label":"Nunavut (1999)","order":8,"emoji":"❄️"},
 ]},
{
 "grade":7,"slug":"tariffs-vs-free-trade","tier":2,"dok":"DOK 2 · Sort",
 "type":"categorize","title":"Tariffs vs. Free Trade","cat":"Systems",
 "subtitle":"Sort each feature under the trade approach it describes.",
 "categories":[{"name":"Tariffs","sub":"Macdonald's National Policy"},{"name":"Free Trade","sub":"e.g. NAFTA"}],
 "items":[
   {"key":"a","label":"Taxes on imported goods","category":"Tariffs","emoji":"💰","text":True},
   {"key":"b","label":"Protects Canadian industry from competition","category":"Tariffs","emoji":"🛡️","text":True},
   {"key":"c","label":"Encourages buying Canadian-made products","category":"Tariffs","emoji":"🏭","text":True},
   {"key":"d","label":"Part of the National Policy","category":"Tariffs","emoji":"🚂","text":True},
   {"key":"e","label":"No taxes between trading countries","category":"Free Trade","emoji":"🤝","text":True},
   {"key":"f","label":"Gives consumers more choice","category":"Free Trade","emoji":"🛒","text":True},
   {"key":"g","label":"Often means lower prices for shoppers","category":"Free Trade","emoji":"🏷️","text":True},
   {"key":"h","label":"NAFTA is an example","category":"Free Trade","emoji":"🌎","text":True},
 ]},
{
 "grade":7,"slug":"economy-terms","tier":1,"dok":"DOK 1 · Match",
 "type":"match","title":"Post-Confederation Economy","cat":"Systems",
 "subtitle":"Match each economic term to its meaning.",
 "pairs":[
   {"key":"a","left":"Total value of goods & services a country produces","right":"GDP","emoji":"📊"},
   {"key":"b","left":"Money moved to reduce gaps between richer & poorer regions","right":"Equalization payments","emoji":"⚖️"},
   {"key":"c","left":"Created in the 1930s to regulate banking & the money supply","right":"Bank of Canada","emoji":"🏦"},
   {"key":"d","left":"Macdonald's plan of tariffs, railway & western settlement","right":"National Policy","emoji":"🚂"},
   {"key":"e","left":"A tax placed on imported goods","right":"Tariff","emoji":"💵"},
   {"key":"f","left":"Wheat, oil & other raw materials central to Canada's economy","right":"Natural resources","emoji":"🌾"},
 ]},
{
 "grade":7,"slug":"sovereignty-wwi","tier":2,"dok":"DOK 2 · Match",
 "type":"match","title":"WWI & Canadian Sovereignty","cat":"Time & Place",
 "subtitle":"Match each battle, group, or milestone to its significance.",
 "pairs":[
   {"key":"a","left":"1917 victory often called a defining moment for Canada","right":"Vimy Ridge","emoji":"⛰️"},
   {"key":"b","left":"Newfoundland Regiment suffered devastating losses here (1916)","right":"Beaumont-Hamel","emoji":"🌰"},
   {"key":"c","left":"Canada's largest Black battalion in the First World War","right":"No. 2 Construction Battalion","emoji":"🛠️"},
   {"key":"d","left":"Famed Francophone unit, the 'Van Doos'","right":"Royal 22e Régiment","emoji":"⚜️"},
   {"key":"e","left":"1931 law giving Canada control of its foreign affairs","right":"Statute of Westminster","emoji":"📜"},
   {"key":"f","left":"Day honouring those who served and died","right":"Remembrance Day","emoji":"🌺"},
 ]},
{
 "grade":7,"slug":"rights-and-discrimination","tier":3,"dok":"DOK 3 · Sort",
 "type":"categorize","title":"Discrimination & Steps Toward Equality","cat":"Citizenship",
 "subtitle":"Sort each example by whether it was a discriminatory policy or a step toward equality in Canada.",
 "categories":[{"name":"Discriminatory Policy"},{"name":"Step Toward Equality"}],
 "items":[
   {"key":"a","label":"The Chinese Head Tax","category":"Discriminatory Policy","emoji":"💸","text":True},
   {"key":"b","label":"Laws that once denied women the vote","category":"Discriminatory Policy","emoji":"🚫","text":True},
   {"key":"c","label":"Immigration bans on certain groups","category":"Discriminatory Policy","emoji":"⛔","text":True},
   {"key":"d","label":"The Famous Five and the 'Persons' Case","category":"Step Toward Equality","emoji":"✊","text":True},
   {"key":"e","label":"The Charter of Rights & Freedoms (1982)","category":"Step Toward Equality","emoji":"📜","text":True},
   {"key":"f","label":"Government apologies & reparations","category":"Step Toward Equality","emoji":"🕊️","text":True},
   {"key":"g","label":"Section 28 guaranteeing gender equality","category":"Step Toward Equality","emoji":"⚖️","text":True},
   {"key":"h","label":"Multiculturalism awareness campaigns","category":"Step Toward Equality","emoji":"🌍","text":True},
 ]},

# ============================ GRADE 8 ============================
{
 "grade":8,"slug":"individualism-collectivism","tier":1,"dok":"DOK 1 · Sort",
 "type":"categorize","title":"Individualism vs. Collectivism","cat":"Time & Place",
 "subtitle":"Sort each value under the foundation of ideology it belongs to.",
 "categories":["Individualism","Collectivism"],
 "items":[
   {"key":"a","label":"Self-reliance","category":"Individualism","emoji":"🧍","text":True},
   {"key":"b","label":"Private property","category":"Individualism","emoji":"🏠","text":True},
   {"key":"c","label":"Competition","category":"Individualism","emoji":"🏁","text":True},
   {"key":"d","label":"Individual rights & freedoms","category":"Individualism","emoji":"🗽","text":True},
   {"key":"e","label":"Economic freedom","category":"Individualism","emoji":"💼","text":True},
   {"key":"f","label":"The common good","category":"Collectivism","emoji":"🤝","text":True},
   {"key":"g","label":"Public property","category":"Collectivism","emoji":"🏛️","text":True},
   {"key":"h","label":"Economic equality","category":"Collectivism","emoji":"⚖️","text":True},
   {"key":"i","label":"Cooperation","category":"Collectivism","emoji":"🧩","text":True},
   {"key":"j","label":"Collective responsibility","category":"Collectivism","emoji":"👥","text":True},
 ]},
{
 "grade":8,"slug":"economic-sectors","tier":1,"dok":"DOK 1 · Sort",
 "type":"categorize","title":"Economic Sectors","cat":"Systems",
 "subtitle":"Sort each job or activity into the correct economic sector.",
 "categories":[{"name":"Primary","sub":"extract raw materials"},{"name":"Secondary","sub":"make products"},{"name":"Tertiary","sub":"provide services"}],
 "items":[
   {"key":"a","label":"Farming wheat","category":"Primary","emoji":"🌾","text":True},
   {"key":"b","label":"Mining oil","category":"Primary","emoji":"⛏️","text":True},
   {"key":"c","label":"Commercial fishing","category":"Primary","emoji":"🎣","text":True},
   {"key":"d","label":"Building cars","category":"Secondary","emoji":"🚗","text":True},
   {"key":"e","label":"Making paper","category":"Secondary","emoji":"📄","text":True},
   {"key":"f","label":"Refining oil into gasoline","category":"Secondary","emoji":"⛽","text":True},
   {"key":"g","label":"Teaching","category":"Tertiary","emoji":"🍎","text":True},
   {"key":"h","label":"Selling groceries","category":"Tertiary","emoji":"🛒","text":True},
   {"key":"i","label":"Banking services","category":"Tertiary","emoji":"🏦","text":True},
 ]},
{
 "grade":8,"slug":"four-economic-systems","tier":2,"dok":"DOK 2 · Sort",
 "type":"categorize","title":"Four Economic Systems","cat":"Systems",
 "subtitle":"Sort each description under the economic system it best fits.",
 "categories":["Traditional","Command","Market","Mixed"],
 "items":[
   {"key":"a","label":"Decisions based on custom & tradition","category":"Traditional","emoji":"🪶","text":True},
   {"key":"b","label":"Built on hunting, farming & bartering","category":"Traditional","emoji":"🌾","text":True},
   {"key":"c","label":"Government makes the economic decisions","category":"Command","emoji":"🏛️","text":True},
   {"key":"d","label":"Public ownership & central planning","category":"Command","emoji":"📋","text":True},
   {"key":"e","label":"Supply & demand guide producers","category":"Market","emoji":"📈","text":True},
   {"key":"f","label":"Profit motive & private property","category":"Market","emoji":"💰","text":True},
   {"key":"g","label":"Balances private business with public programs","category":"Mixed","emoji":"⚖️","text":True},
   {"key":"h","label":"Canada: public healthcare, private stores","category":"Mixed","emoji":"🍁","text":True},
 ]},
{
 "grade":8,"slug":"economic-spectrum","tier":3,"dok":"DOK 3 · Spectrum",
 "type":"spectrum","title":"The Economic Spectrum","cat":"Systems",
 "subtitle":"Place each system or feature along the spectrum from individual freedom to government control.",
 "poles":["Most individual freedom","Most government control"],
 "categories":["Market","Mixed","Command"],
 "items":[
   {"key":"a","label":"Free market economy","category":"Market","emoji":"📈","text":True},
   {"key":"b","label":"Limited government intervention","category":"Market","emoji":"🏷️","text":True},
   {"key":"c","label":"Mixed economy","category":"Mixed","emoji":"⚖️","text":True},
   {"key":"d","label":"Canada","category":"Mixed","emoji":"🍁","text":True},
   {"key":"e","label":"Command (planned) economy","category":"Command","emoji":"📋","text":True},
   {"key":"f","label":"Government controls distribution","category":"Command","emoji":"🏛️","text":True},
 ]},
{
 "grade":8,"slug":"three-branches","tier":1,"dok":"DOK 1 · Sort",
 "type":"categorize","title":"Three Branches of Government","cat":"Systems",
 "subtitle":"Sort each role or function under the correct branch of government.",
 "categories":["Executive","Legislative","Judicial"],
 "items":[
   {"key":"a","label":"Prime Minister & Cabinet","category":"Executive","emoji":"👔","text":True},
   {"key":"b","label":"Carries out & enforces laws","category":"Executive","emoji":"⚙️","text":True},
   {"key":"c","label":"Issues orders in council","category":"Executive","emoji":"📋","text":True},
   {"key":"d","label":"House of Commons & Senate","category":"Legislative","emoji":"🏛️","text":True},
   {"key":"e","label":"Proposes, debates & passes laws","category":"Legislative","emoji":"📜","text":True},
   {"key":"f","label":"Members of Parliament","category":"Legislative","emoji":"🗳️","text":True},
   {"key":"g","label":"The courts & judges","category":"Judicial","emoji":"⚖️","text":True},
   {"key":"h","label":"Interprets & applies the law","category":"Judicial","emoji":"📖","text":True},
 ]},
{
 "grade":8,"slug":"parliamentary-vs-presidential","tier":3,"dok":"DOK 3 · Compare",
 "type":"compare","title":"Parliamentary vs. Presidential","cat":"Systems",
 "subtitle":"Sort each feature: only Canada, only the U.S., or both democracies.",
 "categories":[{"name":"Canada only","sub":"Parliamentary"},{"name":"Both"},{"name":"U.S. only","sub":"Presidential"}],
 "items":[
   {"key":"a","label":"Leader is the Prime Minister","category":"Canada only","emoji":"🍁","text":True},
   {"key":"b","label":"Leader sits in the legislature as an MP","category":"Canada only","emoji":"🏛️","text":True},
   {"key":"c","label":"Governor General represents the Crown","category":"Canada only","emoji":"👑","text":True},
   {"key":"d","label":"Leader is the President","category":"U.S. only","emoji":"🦅","text":True},
   {"key":"e","label":"Leader is elected separately from the legislature","category":"U.S. only","emoji":"🗳️","text":True},
   {"key":"f","label":"Leader can veto laws","category":"U.S. only","emoji":"✋","text":True},
   {"key":"g","label":"Separates power into three branches","category":"Both","emoji":"⚖️","text":True},
   {"key":"h","label":"Holds regular elections","category":"Both","emoji":"📥","text":True},
   {"key":"i","label":"Has a written constitution","category":"Both","emoji":"📜","text":True},
 ]},
{
 "grade":8,"slug":"political-control-spectrum","tier":2,"dok":"DOK 2 · Spectrum",
 "type":"spectrum","title":"Totalitarian ↔ Anarchy","cat":"Systems",
 "subtitle":"Place each feature along the spectrum of political control.",
 "poles":["Total control","No control"],
 "categories":[{"name":"Totalitarian"},{"name":"Democracy"},{"name":"Anarchy"}],
 "items":[
   {"key":"a","label":"One ruler controls everything","category":"Totalitarian","emoji":"👁️","text":True},
   {"key":"b","label":"Censorship & propaganda","category":"Totalitarian","emoji":"📡","text":True},
   {"key":"c","label":"Citizens vote in regular elections","category":"Democracy","emoji":"🗳️","text":True},
   {"key":"d","label":"Rights, freedoms & rule of law","category":"Democracy","emoji":"⚖️","text":True},
   {"key":"e","label":"Political opposition is allowed","category":"Democracy","emoji":"🙋","text":True},
   {"key":"f","label":"No government or central authority","category":"Anarchy","emoji":"💥","text":True},
 ]},
{
 "grade":8,"slug":"party-systems","tier":1,"dok":"DOK 1 · Sort",
 "type":"categorize","title":"Party Systems of the World","cat":"Systems",
 "subtitle":"Sort each example or description by type of party system.",
 "categories":["One-party","Two-party","Multiparty"],
 "items":[
   {"key":"a","label":"China","category":"One-party","emoji":"🔒","text":True},
   {"key":"b","label":"Only one party legally holds power","category":"One-party","emoji":"1️⃣","text":True},
   {"key":"c","label":"United States","category":"Two-party","emoji":"2️⃣","text":True},
   {"key":"d","label":"Two major parties dominate","category":"Two-party","emoji":"⚖️","text":True},
   {"key":"e","label":"Canada & Alberta","category":"Multiparty","emoji":"🍁","text":True},
   {"key":"f","label":"Switzerland, Sweden & Bhutan","category":"Multiparty","emoji":"🌍","text":True},
   {"key":"g","label":"Many parties compete for power","category":"Multiparty","emoji":"🎭","text":True},
 ]},

# ============================ GRADE 9 ============================
{
 "grade":9,"slug":"push-pull-factors","tier":1,"dok":"DOK 1 · Sort",
 "type":"categorize","title":"Push & Pull Factors","cat":"Time & Place",
 "subtitle":"Sort each migration factor as something that pushes people away or pulls them toward a place.",
 "categories":[{"name":"Push","sub":"drives people away"},{"name":"Pull","sub":"draws people in"}],
 "items":[
   {"key":"a","label":"War or conflict at home","category":"Push","emoji":"⚔️","text":True},
   {"key":"b","label":"Drought or famine","category":"Push","emoji":"🌵","text":True},
   {"key":"c","label":"Persecution or discrimination","category":"Push","emoji":"🚫","text":True},
   {"key":"d","label":"Lack of jobs","category":"Push","emoji":"📉","text":True},
   {"key":"e","label":"Better job opportunities","category":"Pull","emoji":"💼","text":True},
   {"key":"f","label":"Safety & political stability","category":"Pull","emoji":"🕊️","text":True},
   {"key":"g","label":"Family already living there","category":"Pull","emoji":"👪","text":True},
   {"key":"h","label":"Freedom & rights","category":"Pull","emoji":"🗽","text":True},
 ]},
{
 "grade":9,"slug":"urbanization-impacts","tier":2,"dok":"DOK 2 · Sort",
 "type":"categorize","title":"Impacts of Urbanization","cat":"Time & Place",
 "subtitle":"Sort each impact of post-war urbanization as social, economic, or environmental.",
 "categories":["Social","Economic","Environmental"],
 "items":[
   {"key":"a","label":"More diverse, pluralistic cities","category":"Social","emoji":"🌍","text":True},
   {"key":"b","label":"Rapid growth of suburbs & housing","category":"Social","emoji":"🏘️","text":True},
   {"key":"c","label":"Oil & gas industry boom","category":"Economic","emoji":"🛢️","text":True},
   {"key":"d","label":"New manufacturing jobs","category":"Economic","emoji":"🏭","text":True},
   {"key":"e","label":"Growth of auto & paper industries","category":"Economic","emoji":"🚗","text":True},
   {"key":"f","label":"Air & water pollution","category":"Environmental","emoji":"💨","text":True},
   {"key":"g","label":"Loss of farmland to development","category":"Environmental","emoji":"🌾","text":True},
   {"key":"h","label":"Changes to wildlife migration","category":"Environmental","emoji":"🦌","text":True},
 ]},
{
 "grade":9,"slug":"international-organizations","tier":2,"dok":"DOK 2 · Match",
 "type":"match","title":"Canada on the World Stage","cat":"Time & Place",
 "subtitle":"Match each organization or milestone to its description.",
 "pairs":[
   {"key":"a","left":"Global body promoting peace, founded after WWII","right":"United Nations","emoji":"🌐"},
   {"key":"b","left":"Military alliance of North Atlantic nations","right":"NATO","emoji":"🛡️"},
   {"key":"c","left":"Joint Canada–U.S. aerospace defence command","right":"NORAD","emoji":"✈️"},
   {"key":"d","left":"Early agreement to reduce trade tariffs","right":"GATT","emoji":"📦"},
   {"key":"e","left":"Role Canada became famous for after the Suez Crisis","right":"Peacekeeping","emoji":"🕊️"},
   {"key":"f","left":"1931 law granting Canada control of foreign affairs","right":"Statute of Westminster","emoji":"📜"},
 ]},
{
 "grade":9,"slug":"wwii-contributions","tier":2,"dok":"DOK 2 · Sequence",
 "type":"sequence","title":"Canada in the Second World War","cat":"Time & Place",
 "subtitle":"Order these Canadian contributions to WWII from earliest to latest.",
 "items":[
   {"key":"a","label":"Battle of the Atlantic begins (1939)","order":1,"emoji":"🌊"},
   {"key":"b","label":"Defence of Hong Kong (1941)","order":2,"emoji":"🛡️"},
   {"key":"c","label":"Dieppe Raid (1942)","order":3,"emoji":"⚓"},
   {"key":"d","label":"Allied invasion of Italy (1943)","order":4,"emoji":"🍝"},
   {"key":"e","label":"D-Day — Juno Beach (1944)","order":5,"emoji":"🏖️"},
   {"key":"f","label":"Liberation of the Netherlands (1945)","order":6,"emoji":"🌷"},
   {"key":"g","label":"Victory in Europe Day (1945)","order":7,"emoji":"🎉"},
 ]},
{
 "grade":9,"slug":"how-a-bill-becomes-law","tier":3,"dok":"DOK 3 · Sequence",
 "type":"sequence","title":"How a Bill Becomes Law","cat":"Systems",
 "subtitle":"Put the federal law-making steps in the correct order.",
 "items":[
   {"key":"a","label":"Memorandum to Cabinet","order":1,"emoji":"📝"},
   {"key":"b","label":"Bill drafted in Cabinet","order":2,"emoji":"✍️"},
   {"key":"c","label":"First reading (introduced)","order":3,"emoji":"1️⃣"},
   {"key":"d","label":"Second reading (debate on principle)","order":4,"emoji":"2️⃣"},
   {"key":"e","label":"Committee stage (detailed review)","order":5,"emoji":"🔍"},
   {"key":"f","label":"Report stage","order":6,"emoji":"📋"},
   {"key":"g","label":"Third reading (final vote)","order":7,"emoji":"3️⃣"},
   {"key":"h","label":"Royal Assent by the Governor General","order":8,"emoji":"👑"},
 ]},
{
 "grade":9,"slug":"federal-vs-provincial","tier":2,"dok":"DOK 2 · Sort",
 "type":"categorize","title":"Who Governs What?","cat":"Systems",
 "subtitle":"Sort each responsibility under federal or provincial jurisdiction (Constitution Act, 1867).",
 "categories":[{"name":"Federal"},{"name":"Provincial"}],
 "items":[
   {"key":"a","label":"National defence","category":"Federal","emoji":"🛡️","text":True},
   {"key":"b","label":"Foreign affairs","category":"Federal","emoji":"🌐","text":True},
   {"key":"c","label":"Banking & currency","category":"Federal","emoji":"🏦","text":True},
   {"key":"d","label":"Criminal law","category":"Federal","emoji":"⚖️","text":True},
   {"key":"e","label":"Fisheries","category":"Federal","emoji":"🐟","text":True},
   {"key":"f","label":"Education","category":"Provincial","emoji":"🏫","text":True},
   {"key":"g","label":"Health care","category":"Provincial","emoji":"🏥","text":True},
   {"key":"h","label":"Prisons (provincial)","category":"Provincial","emoji":"🔑","text":True},
   {"key":"i","label":"Resource development (e.g. Alberta)","category":"Provincial","emoji":"🛢️","text":True},
 ]},
{
 "grade":9,"slug":"public-vs-private","tier":2,"dok":"DOK 2 · Sort",
 "type":"categorize","title":"Canada's Mixed Economy","cat":"Systems",
 "subtitle":"Sort each service as publicly provided by government or privately provided by business.",
 "categories":[{"name":"Public","sub":"government"},{"name":"Private","sub":"business"}],
 "items":[
   {"key":"a","label":"Universal healthcare","category":"Public","emoji":"🏥","text":True},
   {"key":"b","label":"Old-age pensions","category":"Public","emoji":"👵","text":True},
   {"key":"c","label":"Public schools","category":"Public","emoji":"🏫","text":True},
   {"key":"d","label":"Crown corporations (mail, CBC)","category":"Public","emoji":"📮","text":True},
   {"key":"e","label":"A family-owned restaurant","category":"Private","emoji":"🍽️","text":True},
   {"key":"f","label":"A tech start-up for profit","category":"Private","emoji":"💻","text":True},
   {"key":"g","label":"A private dental clinic","category":"Private","emoji":"🦷","text":True},
   {"key":"h","label":"A grocery store chain","category":"Private","emoji":"🛒","text":True},
 ]},
{
 "grade":9,"slug":"evolving-rights-timeline","tier":2,"dok":"DOK 2 · Sequence",
 "type":"sequence","title":"Evolving Rights in Canada","cat":"Citizenship",
 "subtitle":"Order these milestones in Canadian rights and citizenship, earliest to latest.",
 "items":[
   {"key":"a","label":"Canadian Citizenship Act (1947)","order":1,"emoji":"🪪"},
   {"key":"b","label":"Canadian Bill of Rights (1960)","order":2,"emoji":"📜"},
   {"key":"c","label":"Official Languages Act (1969)","order":3,"emoji":"🗣️"},
   {"key":"d","label":"Multiculturalism Policy (1971)","order":4,"emoji":"🌍"},
   {"key":"e","label":"Constitution Act & Charter (1982)","order":5,"emoji":"🍁"},
 ]},
]

# -------------------------------------------------------------------
PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body data-grade="{grade}">
<script src="../assets/engine.js"></script>
<script>Activity.init({config});</script>
</body>
</html>
"""

def clean(cfg):
    c = {k: v for k, v in cfg.items() if k not in ("tier", "cat")}
    c["home"] = "../index.html"
    return c

for a in ACTIVITIES:
    cfg = clean(a)
    out = PAGE.format(title=html.escape(a["title"]), grade=a["grade"],
                      config=json.dumps(cfg, ensure_ascii=False))
    path = os.path.join(ROOT, f"grade-{a['grade']}", f"{a['slug']}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)

print(f"Wrote {len(ACTIVITIES)} activity pages.")

# ----------------------- INDEX HUB -----------------------
GRADE_THEME = {7:"#0984e3",8:"#6c5ce7",9:"#00897b"}
GRADE_TITLE = {7:"Grade 7 — Canada Since Confederation",
               8:"Grade 8 — Ideologies, Economic & Political Systems",
               9:"Grade 9 — Building a Modern Canada"}
TIER_NAME = {1:"Remember & Identify",2:"Understand & Apply",3:"Analyze & Evaluate"}

cards_by_grade = {7:[],8:[],9:[]}
for a in ACTIVITIES:
    cards_by_grade[a["grade"]].append(a)

def card(a):
    return (f'<a class="card" href="grade-{a["grade"]}/{a["slug"]}.html">'
            f'<span class="ctype">{html.escape(a["dok"])}</span>'
            f'<span class="ctitle">{html.escape(a["title"])}</span>'
            f'<span class="ctag">{html.escape(a["cat"])}</span></a>')

sections = ""
for g in (7,8,9):
    acts = sorted(cards_by_grade[g], key=lambda x:(x["tier"], x["title"]))
    rows = ""
    for tier in (1,2,3):
        tier_acts = [a for a in acts if a["tier"]==tier]
        if not tier_acts: continue
        rows += (f'<div class="tier"><div class="tier-label">'
                 f'<b>DOK {tier}</b> · {TIER_NAME[tier]}</div>'
                 f'<div class="cards">{"".join(card(a) for a in tier_acts)}</div></div>')
    sections += (f'<section data-grade="{g}"><h2>{html.escape(GRADE_TITLE[g])}</h2>{rows}</section>')

INDEX = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Social Studies 7–9 · Interactive Activities</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;}}
body{{margin:0;font-family:'Poppins',system-ui,sans-serif;background:#2d3436;color:#fff;padding:28px 18px 60px;}}
.wrap{{max-width:1000px;margin:0 auto;}}
header.hero{{text-align:center;margin-bottom:8px;}}
header.hero h1{{font-size:2.1rem;margin:0 0 6px;}}
header.hero p{{opacity:.85;margin:0 auto;max-width:640px;font-size:.95rem;}}
.legend{{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:18px 0 30px;}}
.legend span{{font-size:.72rem;background:rgba(255,255,255,.1);padding:5px 11px;border-radius:20px;opacity:.9;}}
section{{margin-bottom:34px;}}
section h2{{font-size:1.25rem;border-left:5px solid var(--c);padding-left:12px;margin:0 0 14px;}}
section[data-grade="7"]{{--c:#0984e3;}}
section[data-grade="8"]{{--c:#6c5ce7;}}
section[data-grade="9"]{{--c:#00897b;}}
.tier{{margin-bottom:16px;}}
.tier-label{{font-size:.78rem;opacity:.7;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;}}
.tier-label b{{color:var(--c);opacity:1;}}
.cards{{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;}}
.card{{display:flex;flex-direction:column;gap:6px;background:#dfe6e9;color:#2d3436;border-radius:10px;
  padding:14px 16px;text-decoration:none;border-left:5px solid var(--c);transition:transform .12s,box-shadow .12s;}}
.card:hover{{transform:translateY(-3px);box-shadow:0 8px 18px rgba(0,0,0,.35);}}
.ctype{{font-size:.68rem;font-weight:700;color:var(--c);text-transform:uppercase;letter-spacing:.03em;}}
.ctitle{{font-size:1rem;font-weight:700;line-height:1.2;}}
.ctag{{font-size:.72rem;opacity:.65;}}
footer{{text-align:center;opacity:.6;font-size:.78rem;margin-top:40px;}}
</style>
</head>
<body>
<div class="wrap">
<header class="hero">
  <h1>Social Studies 7–9</h1>
  <p>Interactive drag-and-drop activities, organized from simple recall to deeper analysis. Tap any card to play — works on phones, tablets and computers.</p>
</header>
<div class="legend">
  <span>🟦 Sort &amp; Categorize</span><span>🔗 Match</span><span>📅 Sequence</span>
  <span>⚖️ Compare</span><span>📈 Spectrum</span>
</div>
{sections}
<footer>{len(ACTIVITIES)} activities · aligned to the Alberta Social Studies 7–9 curriculum · built to grow.</footer>
</div>
</body>
</html>
"""
with open(os.path.join(ROOT,"index.html"),"w",encoding="utf-8") as f:
    f.write(INDEX)
print("Wrote index.html")
