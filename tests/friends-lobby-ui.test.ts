import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,unlinkSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
const require=createRequire(import.meta.url);
const {build}=require(require.resolve('esbuild',{paths:['node_modules/.pnpm/node_modules']}));
const cache=process.cwd()+'/node_modules/.cache/friends-lobby-ui.mjs';mkdirSync(process.cwd()+'/node_modules/.cache',{recursive:true});
await build({stdin:{contents:"export {CrewRecovery} from './components/noise/crew-recovery';export {HeistBriefing} from './components/noise/briefing';export {FriendsLobby} from './components/noise/friends-lobby';export {reviewFixture} from './components/noise/review-fixtures';export {view} from './lib/noise/engine';",resolveDir:process.cwd()},outfile:cache,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom/server']});
const {CrewRecovery,HeistBriefing,FriendsLobby,reviewFixture,view}=await import(pathToFileURL(cache).href);unlinkSync(cache);
function render(n:number,mode:string,guest=false,helpers=false){const g=reviewFixture(`friends-lobby-${n}-${mode}${helpers?'-helpers':''}${guest?'-guest':''}`),v=view(g,g.seats[0].id);return renderToStaticMarkup(createElement(FriendsLobby,{v,host:v.you===v.host,busy:false,copied:null,connectionMode:'Direct',seatModes:{},send:()=>{},onCopy:()=>{}}));}
for(const mode of ['coop','rivals'])for(const n of [1,2,3,4])for(const guest of n===1?[false]:[false,true])test(`UI ${n} humans ${mode}, ${guest?'guest':'host'}`,()=>{const html=render(n,mode,guest);assert.match(html,/Room code/);assert.equal((html.match(/>Copy invite link</g)||[]).length,1);assert.doesNotMatch(html,/Fill empty|Friends vs|\+ Bot|TAP TO COPY/);if(n===1){assert.match(html,/Waiting for a friend to join/);assert.doesNotMatch(html,/Crew format|Enter the gallery|Echo helper|Difficulty/);}else if(guest){assert.equal((html.match(/<button/g)||[]).length,2);assert.doesNotMatch(html,/disabled=/);assert.match(html,mode==='coop'?/Difficulty:/ : /Rival matches use Normal/);}else{assert.match(html,/aria-label="Crew format"/);assert.match(html,/>Co-op</);assert.match(html,/>Rivals</);assert.match(html,/Enter the gallery/);if(mode==='coop'){assert.match(html,/aria-label="Difficulty"/);assert.equal(html.includes('+ Echo helper'),n<4);}else{assert.doesNotMatch(html,/aria-label="Difficulty"/);assert.match(html,/Rival matches use Normal/);assert.equal(html.includes('2v2: each crew gets a bot'),n===2);}}});
test('UI two-human rivals shows a checked 2v2 toggle and one bot per crew',()=>{const html=render(2,'rivals',false,true);assert.match(html,/checked=""/);assert.equal((html.match(/>BOT</g)||[]).length,2);});

test('briefing helper advice follows viewer crew and museum lore is absent',()=>{for(const mode of ['coop','duos'])for(const hasCrewBot of [false,true]){const g=reviewFixture('flagship-start');const html=renderToStaticMarkup(createElement(HeistBriefing,{arena:g.arena,training:false,crewMode:mode,hasCrewBot,touch:true,busy:false,ready:false,onReady:()=>{},onRules:()=>{}}));assert.equal(html.includes('Solo? Tell Echo'),hasCrewBot);assert.doesNotMatch(html,/patrons bought immortality/);}});
test('host can remove human guests, guest has no removal controls',()=>{assert.match(render(2,'coop'),/aria-label="Remove Raven"/);assert.doesNotMatch(render(2,'coop',true),/aria-label="Remove /);});

test('seat-lost panel offers rejoin and hideout without host-only waiting text',()=>{const html=renderToStaticMarkup(createElement(CrewRecovery,{code:'MKYR5X',message:'The crew has started or filled up.',busy:false,onRejoin:()=>{},onHome:()=>{}}));assert.match(html,/You left the crew/);assert.match(html,/>Rejoin</);assert.match(html,/>Back to hideout</);assert.doesNotMatch(html,/Waiting for a friend/);});
test('a guest with a missing seat never sees the host invitation waiting line',()=>{const g=reviewFixture('friends-lobby-1-coop'),v=view(g,'gone');const html=renderToStaticMarkup(createElement(FriendsLobby,{v,host:false,busy:false,copied:null,connectionMode:'Relay',seatModes:{},send:()=>{},onCopy:()=>{}}));assert.doesNotMatch(html,/Waiting for a friend/);assert.match(html,/Waiting for the host/);});

test('host-removed panel has only Back to hideout, never Rejoin',()=>{const html=renderToStaticMarkup(createElement(CrewRecovery,{code:'MKYR5X',message:'The host removed you from this crew.',removed:true,busy:false,onRejoin:()=>{},onHome:()=>{}}));assert.match(html,/The host removed you from the crew/);assert.match(html,/Ask the host to start a new crew\./);assert.equal((html.match(/<button/g)||[]).length,1);assert.match(html,/>Back to hideout</);assert.doesNotMatch(html,/>Rejoin</);});

test('both museum briefings keep objectives compact and reserve exceptions for More rules',()=>{
 for(const museum of ['velmont','archive'])for(const mode of ['coop','rivals','duel'])for(const crew of ['human','bot']){
  const g=reviewFixture(`polish-brief-${mode}-${museum}-${crew}`);
  const html=renderToStaticMarkup(createElement(HeistBriefing,{arena:g.arena,training:false,crewMode:g.crewMode,hasCrewBot:crew==='bot'&&mode!=='duel',duel:mode==='duel',touch:true,busy:false,ready:false,onReady:()=>{},onRules:()=>{}}));
  assert.match(html,mode==='coop'?/Bank .*2,600/:/Richest crew wins/);
  assert.match(html,museum==='archive'?/Map Room/:/Security/);
  const plateRoom=museum==='archive'?'Map Room':'Security';
  const plain=html.replace(/<[^>]*>/g,'');
  assert.ok(plain.includes(mode==='duel'?`Crown $1,200 · 1:00 · Step on ${plateRoom} plate to unlock it.`:`Crown $1,200 · 1:00 · Hold ${plateRoom} plate.`));
  assert.equal((html.match(/quick-step-number/g)||[]).length,4);
  assert.doesNotMatch(html,/1v1 exception|Noise on you brings guards|unlocks the Crown permanently/);
  assert.equal(html.includes('Solo? Tell Echo'),crew==='bot'&&mode!=='duel');
 }
});
