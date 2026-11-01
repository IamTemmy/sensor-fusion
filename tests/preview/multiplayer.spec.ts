import {test,expect,type Page} from '@playwright/test';
async function friends(p:Page){await p.goto('/');await p.getByRole('button',{name:/Play with friends/}).click();}
async function start(p:Page){await p.getByRole('button',{name:/Enter the gallery/}).click();await p.getByRole('button',{name:/LET’S GO/}).click();}
async function leave(p:Page){p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Leave',exact:true}).click();}
test('code + link, refresh, background, rematch, host leaves',async({browser,baseURL})=>{
 const contexts=await Promise.all([1,2,3].map(()=>browser.newContext({baseURL})));
 const [host,guest,linked]=await Promise.all(contexts.map(c=>c.newPage()));
 try{
  await friends(host);await host.getByRole('button',{name:/Host a room/}).click();
  const text=await host.locator('.crew-code').innerText();const code=text.match(/[A-Z0-9]{6}/)![0];
  await friends(guest);await guest.getByLabel('Crew code',{exact:true}).fill(code);await guest.getByRole('button',{name:'Join →',exact:true}).click();
  await expect(guest.getByText('Waiting for the host to start.',{exact:true})).toBeVisible();
  await linked.goto('/?crew='+code);await linked.getByRole('button',{name:/Join crew/}).click();await expect(linked.locator('.crew-code')).toContainText(code);
  await start(host);
  for(const p of [guest,linked]){await p.getByRole('button',{name:/LET’S GO/}).click();await expect(p.locator('.active-heist')).toBeVisible();}
  // Reload the invite in the same storage context: must reclaim, not duplicate, the seat.
  await guest.goto('/?crew='+code);await expect(guest.locator('.active-heist')).toBeVisible({timeout:20000});await expect(guest).not.toHaveURL(/crew=/);
  const cover=await contexts[1].newPage();await cover.goto('about:blank');await cover.bringToFront();await expect.poll(()=>guest.evaluate(()=>document.visibilityState)).toBe('hidden');await cover.waitForTimeout(20000);await guest.bringToFront();await cover.close();await expect(guest.locator('.active-heist')).toBeVisible();
  // Let the real match finish; no direct simulation manipulation.
  await expect(host.getByRole('button',{name:/RUN IT BACK/})).toBeVisible({timeout:110000});await host.getByRole('button',{name:/RUN IT BACK/}).click();
  await expect(guest.getByRole('button',{name:/LET’S GO/})).toBeVisible({timeout:20000});
  await leave(host);await expect(guest.getByText('The host left, so the job ended. Ask them for a new invite.',{exact:true})).toBeVisible({timeout:20000});await expect(guest.locator('.results-awards')).toHaveCount(0);
 }finally{await Promise.all(contexts.map(c=>c.close()));}
});
test('390px first-heist hint and controls fit; skip stays dismissed',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:/Start heist/}).click();await page.getByRole('button',{name:/LET’S GO/}).click();
 await expect(page.getByRole('button',{name:'Skip guided first heist'})).toBeVisible();await expect(page.locator('.first-heist')).toHaveCount(1);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false);
 await page.getByRole('button',{name:'Skip guided first heist'}).click();await expect(page.locator('.first-heist')).toHaveCount(0);
});
