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
await build({stdin:{contents:"export {FriendsLobby} from './components/noise/friends-lobby';export {reviewFixture} from './components/noise/review-fixtures';export {view} from './lib/noise/engine';",resolveDir:process.cwd()},outfile:cache,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom/server']});
const {FriendsLobby,reviewFixture,view}=await import(pathToFileURL(cache).href);unlinkSync(cache);
function render(n:number,mode:string,guest=false,helpers=false){const g=reviewFixture(`friends-lobby-${n}-${mode}${helpers?'-helpers':''}${guest?'-guest':''}`),v=view(g,g.seats[0].id);return renderToStaticMarkup(createElement(FriendsLobby,{v,host:v.you===v.host,busy:false,copied:null,connectionMode:'Direct',seatModes:{},send:()=>{},onCopy:()=>{}}));}
for(const mode of ['coop','rivals'])for(const n of [1,2,3,4])for(const guest of n===1?[false]:[false,true])test(`UI ${n} humans ${mode}, ${guest?'guest':'host'}`,()=>{const html=render(n,mode,guest);assert.match(html,/Room code/);assert.equal((html.match(/>Copy invite link</g)||[]).length,1);assert.doesNotMatch(html,/Fill empty|Friends vs|\+ Bot|TAP TO COPY/);if(n===1){assert.match(html,/Waiting for a friend to join/);assert.doesNotMatch(html,/Crew format|Enter the gallery|Echo helper|Difficulty/);}else if(guest){assert.equal((html.match(/<button/g)||[]).length,2);assert.doesNotMatch(html,/disabled=/);assert.match(html,mode==='coop'?/Difficulty:/ : /Rival matches use Normal/);}else{assert.match(html,/aria-label="Crew format"/);assert.match(html,/>Co-op</);assert.match(html,/>Rivals</);assert.match(html,/Enter the gallery/);if(mode==='coop'){assert.match(html,/aria-label="Difficulty"/);assert.equal(html.includes('+ Echo helper'),n<4);}else{assert.doesNotMatch(html,/aria-label="Difficulty"/);assert.match(html,/Rival matches use Normal/);assert.equal(html.includes('2v2: each crew gets a bot'),n===2);}}});
test('UI two-human rivals shows a checked 2v2 toggle and one bot per crew',()=>{const html=render(2,'rivals',false,true);assert.match(html,/checked=""/);assert.equal((html.match(/ECHO HELPER/g)||[]).length,2);});
