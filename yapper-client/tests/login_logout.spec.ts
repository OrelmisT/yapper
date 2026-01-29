import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();



test("login", async ({page}) => {
  await page.goto('/')

  //automatically redirects to login
  await expect(page).toHaveURL('/login')

  //login
  await page.locator('input[name="email"]').fill(process.env.TEST_USER_EMAIL || 'dummyemail@example.com')
  await page.locator('input[name="password"]').fill(process.env.TEST_USER_PASSWORD || "dummypassword")

  await page.locator('input[type="submit"]').click()

  // wait for redirect to main page
  await page.waitForURL('/')

}) 


test("logout", async ({page}) => {
   await page.goto('/')

  //automatically redirects to login
  await expect(page).toHaveURL('/login')

  //login
  await page.locator('input[name="email"]').fill(process.env.TEST_USER_EMAIL || 'dummyemail@example.com')
  await page.locator('input[name="password"]').fill(process.env.TEST_USER_PASSWORD || "dummypassword")

  await page.locator('input[type="submit"]').click()

  // wait for redirect to main page
  await page.waitForURL('/')


  await page.locator('p[id="logout-button"]').click()

  // wait for redirect to login page
  await page.waitForURL('/login')

  // check that home page redirects to login
  await page.goto('/')
  await page.waitForURL('/login')

})