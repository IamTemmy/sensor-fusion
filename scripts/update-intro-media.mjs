import {readdirSync,writeFileSync,readFileSync} from 'node:fs';
const root=new URL('../public/cinematics/intro-v3/',import.meta.url);
const files=readdirSync(root).filter(s=>/^(vo-0[1-6]\.(mp3|wav)|six-shot-0[1-6]-(landscape|portrait)\.(mp4|webm))$/.test(s)).sort();
const content=JSON.stringify({files},null,2)+'\n';
if(process.argv.includes('--check')){
 if(readFileSync(new URL('media.json',root),'utf8')!==content)throw new Error('Run node scripts/update-intro-media.mjs after adding/removing recordings');
}else writeFileSync(new URL('media.json',root),content);
console.log('Intro media manifest: '+files.length+' optional files');
