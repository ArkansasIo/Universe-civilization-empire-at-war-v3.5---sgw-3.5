/** Galactic Technology Archive: 23 nodes in each doctrine, 92 total. Balance values are provisional. */
export type TechnologyDoctrine = 'offensive' | 'defensive' | 'covert' | 'espionage';
export interface ArchiveTechnology {
 id:string; doctrine:TechnologyDoctrine; index:number; name:string; moduleClass:string; subclass:string;
 type:string; subtype:string; tier:1|2|3|4|5; maxLevel:number;
 baseCost:{metal:number;crystal:number;deuterium:number;naquadah:number};
 researchSeconds:number; prerequisites:string[]; effects:Record<string,number>; effectSummary:string; tags:string[];
}
const BRANCHES:Record<TechnologyDoctrine,Array<{className:string;subclass:string;names:string[];type:string;subtype:string;stat:string;base:number;summary:string}>>={
 offensive:[
 {className:'Weapons',subclass:'Energy Systems',names:['Focused Beam Emitters','Plasma Lance Arrays','Quantum Pulse Cannons','Antimatter Warheads','Singularity Drivers','Overcharged Capacitors'],type:'weapon-system',subtype:'energy',stat:'weaponDamage',base:2.2,summary:'weapon damage and penetration'},
 {className:'Targeting',subclass:'Targeting Systems',names:['Predictive Targeting','Multi-vector Tracking','Weakpoint Analysis','Fleet Fire Control','Adaptive Ballistics','Command Target Locks'],type:'targeting-system',subtype:'precision',stat:'accuracy',base:1.4,summary:'accuracy and critical chance'},
 {className:'Propulsion',subclass:'Combat Drives',names:['Combat Thrust Mapping','Pursuit Drives','Vector Intercept Logic','Afterburner Coils','Breach Acceleration','Rapid Redeployment'],type:'propulsion',subtype:'mobility',stat:'fleetSpeed',base:1.3,summary:'fleet speed and initiative'},
 {className:'Fleet Command',subclass:'Strike Doctrine',names:['Coordinated Salvos','Formation Breakers','Siege Synchronization','Capital Ship Doctrine','Rapid Assault Planning'],type:'command-doctrine',subtype:'tactics',stat:'fleetDamage',base:1.6,summary:'fleet damage and siege performance'}],
 defensive:[
 {className:'Shields',subclass:'Shield Engineering',names:['Harmonic Shielding','Layered Deflector Fields','Adaptive Shield Matrix','Phase-shift Barriers','Reflective Plasma Screen','Shield Recharge Control'],type:'shield-system',subtype:'barrier',stat:'shieldStrength',base:2.1,summary:'shield strength and recharge'},
 {className:'Armor',subclass:'Hull Engineering',names:['Composite Hull Weave','Reactive Armor Tiles','Nanite Self-sealing','Kinetic Dissipation','Ablative Plating','Capital Hull Reinforcement'],type:'armor-system',subtype:'resilience',stat:'hullIntegrity',base:2,summary:'hull integrity and damage reduction'},
 {className:'Fortification',subclass:'Planetary Defense',names:['Orbital Bastions','Planetary Shield Grid','Hardened Bunkers','Automated Turret Logic','Siege Resistance','Colony Emergency Barriers'],type:'fortification',subtype:'planetary',stat:'planetDefense',base:1.8,summary:'planet defense and siege resistance'},
 {className:'Countermeasures',subclass:'Protection Systems',names:['Decoy Drone Networks','Electronic Hardening','Threat Prediction','Interceptor Coordination','Damage Control AI','Emergency Power Routing'],type:'countermeasure',subtype:'protection',stat:'evasion',base:1.2,summary:'evasion and repair rate'}],
 covert:[
 {className:'Infiltration',subclass:'Agent Operations',names:['Identity Masking','Deep Cover Protocols','Access Credential Studies','Silent Boarding','Agent Safehouses','Compartmented Cells'],type:'infiltration-system',subtype:'access',stat:'infiltrationSuccess',base:1.5,summary:'mission success and agent capacity'},
 {className:'Disruption',subclass:'Disruption Operations',names:['Industrial Disruption','Reactor Interference','Supply Chain Disruption','Docking Signal Spoofing','Infrastructure Weakpoint Mapping','Precision Disruption'],type:'disruption-system',subtype:'operations',stat:'disruptionSuccess',base:1.4,summary:'operation success and impact'},
 {className:'Concealment',subclass:'Stealth Systems',names:['Signature Dampening','Masked Transponders','Low-emission Drives','Thermal Shroud','Ghost Route Planning','Covert Fleet Staging'],type:'concealment-system',subtype:'stealth',stat:'stealth',base:1.6,summary:'stealth and detection resistance'},
 {className:'Secure Signals',subclass:'Communications',names:['Encrypted Dead Drops','Signal Pattern Mimicry','Counter-trace Routines','Secure Agent Relay','Black Channel Routing','Beacon Integrity Detection'],type:'signals-system',subtype:'communications',stat:'covertSecurity',base:1.3,summary:'secure communications and information quality'}],
 espionage:[
 {className:'Reconnaissance',subclass:'Signal Analysis',names:['Long-range Signal Analysis','Probe Sensor Calibration','Encrypted Traffic Parsing','Fleet Signature Catalog','Anomaly Triangulation','Deep-field Listening'],type:'recon-system',subtype:'collection',stat:'scanRange',base:1.7,summary:'scan range and report quality'},
 {className:'Counter-espionage',subclass:'Counterintelligence',names:['Probe Detection Grid','False Data Recognition','Agent Vetting Matrix','Secure Command Channels','Intel Compartmentalization','Counter-infiltration AI'],type:'counterintelligence',subtype:'protection',stat:'espionageDefense',base:1.5,summary:'espionage defense and report integrity'},
 {className:'Analysis',subclass:'Intelligence Analysis',names:['Resource Flow Analysis','Technology Fingerprinting','Commander Pattern Analysis','Planetary Activity Models','Fleet Movement Forecasts','Espionage Report Fusion'],type:'analysis-system',subtype:'analysis',stat:'reportDetail',base:1.4,summary:'report detail and analysis speed'},
 {className:'Probe Safety',subclass:'Recon Support',names:['Probe Evasion Logic','Disposable Probe Swarms','Agent Extraction Routes','Signal Burst Suppression','Low-observable Sensors','Secure Intel Retrieval'],type:'survival-system',subtype:'survivability',stat:'probeSurvival',base:1.3,summary:'probe and agent survivability'}]
};
const records:ArchiveTechnology[]=[];
for(const doctrine of Object.keys(BRANCHES) as TechnologyDoctrine[]){
 const flattened=BRANCHES[doctrine].flatMap(seed=>seed.names.map(name=>({seed,name})));
 flattened.slice(0,23).forEach(({seed,name},i)=>{
  const tier=Math.min(5,Math.floor(i/5)+1) as ArchiveTechnology['tier'];
  const id='archive-'+doctrine+'-'+String(i+1).padStart(2,'0');
  records.push({id,doctrine,index:i+1,name,moduleClass:seed.className,subclass:seed.subclass,type:seed.type,subtype:seed.subtype,tier,maxLevel:10,
   baseCost:{metal:Math.round(250*Math.pow(2.1,tier-1)),crystal:Math.round(180*Math.pow(2.15,tier-1)),deuterium:Math.round(80*Math.pow(2.2,tier-1)),naquadah:Math.round(25*Math.pow(2,tier-1))},
   researchSeconds:Math.round(60*Math.pow(1.8,tier-1)),prerequisites:i?['archive-'+doctrine+'-'+String(i).padStart(2,'0')]:[],
   effects:{[seed.stat]:Number((seed.base*tier).toFixed(2))},effectSummary:seed.summary+'; final effect scaling is handled by the research service.',
   tags:[doctrine,seed.className.toLowerCase().replace(/\s+/g,'-'),seed.subclass.toLowerCase().replace(/\s+/g,'-'),'tier-'+tier]});
 });
}
export const GALACTIC_TECHNOLOGY_ARCHIVE:readonly ArchiveTechnology[]=records;
export const TECHNOLOGY_BY_ID:ReadonlyMap<string,ArchiveTechnology>=new Map(records.map(t=>[t.id,t]));
export const TECHNOLOGY_BY_DOCTRINE:ReadonlyMap<TechnologyDoctrine,readonly ArchiveTechnology[]>=new Map((Object.keys(BRANCHES) as TechnologyDoctrine[]).map(d=>[d,records.filter(t=>t.doctrine===d)]));
export function validateTechnologyArchive():string[]{
 const errors:string[]=[];const ids=new Set<string>();
 for(const t of records){if(ids.has(t.id))errors.push('Duplicate technology ID: '+t.id);ids.add(t.id);if(!t.name||!t.effectSummary)errors.push('Incomplete record: '+t.id);if(Object.values(t.baseCost).some(v=>!Number.isFinite(v)||v<0))errors.push('Invalid cost: '+t.id);}
 for(const d of ['offensive','defensive','covert','espionage'] as const)if(records.filter(t=>t.doctrine===d).length!==23)errors.push('Expected 23 '+d+' modules.');
 if(records.length!==92)errors.push('Expected 92 total modules; found '+records.length);
 return errors;
}