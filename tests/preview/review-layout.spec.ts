import {test,expect,type Page} from '@playwright/test';
async function fixture(page:Page,state:string){
 await page.addInitScript(({state})=>{
  localStorage.setItem('velmont-first-heist-v1',state.startsWith('next-guide-')?JSON.stringify({step:state.slice(11),code:'VISUAL',match:1,soloStart:0,attempts:1,heldIds:[]}):'done');
  localStorage.removeItem('velmont-tips-v37');
 },{state});
 await page.goto('/?visualReview='+state);await expect(page.locator('.active-heist')).toBeVisible();
}
for(const size of [{width:844,height:390},{width:740,height:360}])for(const state of ['next-guide-grab','next-guide-alarm','next-guide-bank','next-guide-board','next-context-tip'])test(`${state} unobstructed at ${size.width}x${size.height}`,async({page})=>{
 await page.setViewportSize(size);await fixture(page,state);
 const tip=page.locator('.context-tip');await expect(tip).toBeVisible();
 if(state.startsWith('next-guide-'))await expect(tip).toContainText(`${['grab','alarm','bank','board'].indexOf(state.slice(11))+1}/4`);
 expect(await tip.evaluate(e=>e.scrollHeight<=e.clientHeight)).toBe(true);
 const box=(await tip.boundingBox())!;
 for(const item of await page.locator('canvas,button.action,.thumbstick').all()){
  if(!await item.isVisible())continue;const b=(await item.boundingBox())!;
  expect(box.x<b.x+b.width&&box.x+box.width>b.x&&box.y<b.y+b.height&&box.y+box.height>b.y).toBe(false);
 }
 await page.screenshot({path:`outputs/preview-tests/${state}-${size.width}.png`});
});
test('desktop error preserves canvas height with and without a guide',async({page})=>{
 await page.setViewportSize({width:1280,height:800});
 for(const state of ['next-error','next-guide-grab']){
  await fixture(page,state);const canvas=page.locator('canvas');const before=(await canvas.boundingBox())!;
  await page.keyboard.press('g');await expect(page.locator('.in-play-error')).toContainText('hands are already free');
  const during=(await canvas.boundingBox())!;expect(during.height).toBe(before.height);expect(during.y).toBe(before.y);
  const error=(await page.locator('.in-play-error').boundingBox())!;expect(error.y).toBeGreaterThanOrEqual(during.y+during.height);
  await page.screenshot({path:`outputs/preview-tests/error-${state}-1280.png`});
 }
});
for(const size of [{width:1280,height:800},{width:390,height:844}])test(`departed crew readable at ${size.width}`,async({page})=>{
 await page.setViewportSize(size);await fixture(page,'next-crew-departed');
 await expect(page.locator('.live-objective')).not.toContainText('crewDepartureAt');
 await expect(page.locator('.spectator')).not.toContainText('Hop out');
 await expect(page.locator('.spectator')).toContainText('van has left');
 await page.screenshot({path:`outputs/preview-tests/departed-${size.width}.png`});
});
