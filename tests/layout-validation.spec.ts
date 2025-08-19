import { test, expect, type Page } from '@playwright/test';

// Test viewports as specified in requirements
const viewports = [
  { name: 'Desktop Large', width: 1440, height: 900 },
  { name: 'Desktop Medium', width: 1280, height: 800 },
  { name: 'Desktop Small', width: 1024, height: 768 },
  { name: 'iPad Portrait', width: 768, height: 1024 },
  { name: 'iPhone Portrait', width: 390, height: 844 },
];

async function startSudokuGame(page: Page) {
  await page.goto('/');
  await page.getByTestId('input-player-name').fill('Test Player');
  await page.getByTestId('checkbox-consent').check();
  await page.getByTestId('button-start-game').click();
  
  // Wait for game to load
  await page.waitForSelector('.game-card', { timeout: 10000 });
  await page.waitForSelector('.sudoku-grid .cell', { timeout: 10000 });
}

for (const viewport of viewports) {
  test.describe(`Layout validation on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    test(`validates unified card layout`, async ({ page }) => {
      await startSudokuGame(page);

      // Find all required elements
      const gameCard = page.locator('.game-card');
      const hud = page.locator('.game-card__hud');
      const boardContainer = page.locator('.game-card__board');
      const boardOuter = page.locator('#board-outer');
      const sudokuGrid = page.locator('.sudoku-grid');
      const keypad = page.locator('#keypad');
      const cells = page.locator('.sudoku-grid .cell');

      // Ensure all elements exist
      await expect(gameCard).toBeVisible();
      await expect(hud).toBeVisible();
      await expect(boardContainer).toBeVisible();
      await expect(boardOuter).toBeVisible();
      await expect(sudokuGrid).toBeVisible();
      await expect(keypad).toBeVisible();

      // Assertion 1: 81 cells are present
      await expect(cells).toHaveCount(81);

      // Get bounding boxes for containment checks
      const cardBox = await gameCard.boundingBox();
      const boardBox = await boardOuter.boundingBox();
      const gridBox = await sudokuGrid.boundingBox();
      const keypadBox = await keypad.boundingBox();

      expect(cardBox).not.toBeNull();
      expect(boardBox).not.toBeNull();
      expect(gridBox).not.toBeNull();
      expect(keypadBox).not.toBeNull();

      // Assertion 2: Last row (cells 72-80) are fully visible within #board-outer
      const lastRowCells = cells.nth(72); // Get one of the last row cells
      const lastRowBox = await lastRowCells.boundingBox();
      expect(lastRowBox).not.toBeNull();
      
      if (lastRowBox && boardBox) {
        expect(lastRowBox.y + lastRowBox.height).toBeLessThanOrEqual(boardBox.y + boardBox.height);
      }

      // Assertion 3: No overlap between board and keypad
      if (boardBox && keypadBox) {
        expect(boardBox.y + boardBox.height).toBeLessThanOrEqual(keypadBox.y);
      }

      // Assertion 4: Grid bounding box is fully inside card bounding box
      if (gridBox && cardBox) {
        expect(gridBox.x).toBeGreaterThanOrEqual(cardBox.x);
        expect(gridBox.y).toBeGreaterThanOrEqual(cardBox.y);
        expect(gridBox.x + gridBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width);
        expect(gridBox.y + gridBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height);
      }

      // Assertion 5: Board bounding box is fully inside card bounding box
      if (boardBox && cardBox) {
        expect(boardBox.x).toBeGreaterThanOrEqual(cardBox.x);
        expect(boardBox.y).toBeGreaterThanOrEqual(cardBox.y);
        expect(boardBox.x + boardBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width);
        expect(boardBox.y + boardBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height);
      }
    });

    test(`takes screenshots for visual regression`, async ({ page }) => {
      await startSudokuGame(page);

      // Screenshot of the unified game card
      await expect(page.locator('.game-card')).toHaveScreenshot(`game-card-${viewport.name.toLowerCase().replace(' ', '-')}.png`);
      
      // Screenshot of just the board area
      await expect(page.locator('#board-outer')).toHaveScreenshot(`board-outer-${viewport.name.toLowerCase().replace(' ', '-')}.png`);
    });

    test(`verifies visual consistency`, async ({ page }) => {
      await startSudokuGame(page);

      const gameCard = page.locator('.game-card');
      
      // Check that card has single rounded appearance
      const cardStyles = await gameCard.evaluate((el) => {
        const styles = getComputedStyle(el);
        return {
          background: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          overflow: styles.overflow
        };
      });

      // Verify unified visual appearance
      expect(cardStyles.background).toBe('rgb(255, 255, 255)'); // white background
      expect(cardStyles.borderRadius).toBe('20px'); // consistent radius
      expect(cardStyles.overflow).toBe('hidden'); // keeps content clipped
      expect(cardStyles.boxShadow).toContain('rgba(0, 0, 0, 0.08)'); // consistent shadow
    });
  });
}