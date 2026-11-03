import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewAllowed} from '../lib/noise/review-access.ts';
test('review pages are denied in live builds and allowed on isolated test site',()=>{
 assert.equal(reviewAllowed('velmont-next-preview.iamtemmy.chatgpt.site','production'),true);
 for(const host of ['velmont.iamtemmy.chatgpt.site','localhost','example.com'])assert.equal(reviewAllowed(host,'production'),false);
 assert.equal(reviewAllowed('localhost','development'),true);
 const source=readFileSync('middleware.ts','utf8');assert.match(source,/status:404/);assert.match(source,/\/type-review/);assert.match(source,/\/intro-review/);
});
test('game fonts preserve Bungee; Manrope is limited to explanation selectors without metric overrides',()=>{
 const css=readFileSync('app/globals.css','utf8');
 assert.doesNotMatch(css,/bigshoulders|cormorant/i);
 const narrow=css.slice(css.indexOf('/* Only explanatory copy')).replace(/\/\*[\s\S]*?\*\//g,'');
 assert.doesNotMatch(narrow,/font-size|line-height|text-transform|letter-spacing|padding/);
 assert.match(narrow,/font-family:Manrope/);
 assert.doesNotMatch(readFileSync('components/noise/type-pair.ts','utf8'),/type-review.css|typePair/);
 assert.match(css,/font-family:'Bungee'/);
});
