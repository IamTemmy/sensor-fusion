import {test,expect,type Page} from '@playwright/test';
async function friends(p:Page){await p.goto('/');await p.getByRole('button',{name:/Play with friends/}).click();}
async function start(p:Page){await p.getByRole('button',{name:/Enter the gallery/}).click();await p.getByRole('button',{name:/LET’S GO/}).click();}
async function leave(p:Page){p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Leave',exact:true}).click();}
test('code + link, refresh, rematch, host leaves',async({browser,baseURL})=>{
 const contexts=await Promise.all([1,2,3].map(()=>browser.newContext({baseURL})));
 const [host,guest,linked]=await Promise.all(contexts.map(c=>c.newPage()));
 try{
  await friends(host);await host.getByRole('button',{name:/Host a room/}).click();
  const text=await host.locator('.crew-code').innerText();const code=text.match(/[A-Z0-9]{6}/)![0];
  await friends(guest);await guest.getByLabel('Crew code',{exact:true}).fill(code);await guest.getByRole('button',{name:'Join →',exact:true}).click();
  await expect(guest.getByText('Waiting for the host to start.',{exact:true})).toBeVisible();
  await linked.goto('/?crew='+code);await linked.getByRole('button',{name:/Join crew/}).click();await expect(linked.locator('.crew-code')).toContainText(code);
  await start(host);
  for(const p of [guest,linked])await p.getByRole('button',{name:/LET’S GO/}).click();
  for(const p of [host,guest,linked])await expect(p.locator('.active-heist')).toBeVisible();
  // Reload the invite in the same storage context: must reclaim, not duplicate, the seat.
  await guest.goto('/?crew='+code);await expect(guest.locator('.active-heist')).toBeVisible({timeout:20000});await expect(guest).not.toHaveURL(/crew=/);
  // Let the real match finish; no direct simulation manipulation.
  await expect(host.getByRole('button',{name:/RUN IT BACK/})).toBeVisible({timeout:110000});await host.getByRole('button',{name:/RUN IT BACK/}).click();
  await expect(guest.getByRole('button',{name:/LET’S GO/})).toBeVisible({timeout:20000});
  await leave(host);await expect(guest.getByText('The host left, so the job ended. Ask them for a new invite.',{exact:true})).toBeVisible({timeout:20000});await expect(guest.locator('.results-awards')).toHaveCount(0);
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});

for(const size of [{width:390,height:844},{width:360,height:740},{width:1280,height:800}]){
 for(const step of ['grab','alarm','bank','board'])test(`first heist ${step} fits ${size.width}x${size.height}`,async({page})=>{
  await page.setViewportSize(size);
  await page.addInitScript(({step})=>localStorage.setItem('velmont-first-heist-v1',JSON.stringify({step,code:'VISUAL',match:1,attempts:1,heldIds:[]})),{step});
  await page.goto('/?visualReview=next-guide-'+step);
  const tip=page.locator('.first-heist');await expect(tip).toBeVisible();await expect(tip).toContainText(`${['grab','alarm','bank','board'].indexOf(step)+1}/4`);
  expect(await tip.evaluate(e=>e.scrollHeight<=e.clientHeight)).toBe(true);
  const box=await tip.boundingBox();expect(box).not.toBeNull();
  for(const action of await page.locator('button.action, .hand-state').all()){if(!await action.isVisible())continue;const b=await action.boundingBox();expect(box!.x<b!.x+b!.width&&box!.x+box!.width>b!.x&&box!.y<b!.y+b!.height&&box!.y+box!.height>b!.y).toBe(false);}
  await page.screenshot({path:`outputs/preview-tests/guide-${step}-${size.width}.png`});
 });
}
test('skip survives reload',async({page})=>{await page.goto('/?visualReview=next-guide-grab');await page.getByRole('button',{name:'Skip guided first heist'}).click();await page.reload();await expect(page.locator('.first-heist')).toHaveCount(0);});
for(const width of [1280,390])for(const state of ['next-bubble','next-ring','recap-coop'])test(`capture ${state} at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:800});await page.addInitScript(()=>localStorage.setItem('velmont-first-heist-v1','done'));
 await page.goto('/?visualReview='+state);await expect(page.locator(state==='recap-coop'?'.heist-recap':'.active-heist')).toBeVisible();
 if(state==='recap-coop')await page.locator('.loot-audit summary').click();
 await page.screenshot({path:`outputs/preview-tests/${state}-${width}.png`});
});
