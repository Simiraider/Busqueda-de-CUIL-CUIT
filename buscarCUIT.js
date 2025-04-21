const puppeteer = require('puppeteer');
const readline = require('readline-sync');

async function buscarEnCuitOnline(nombreApellido) {
  const browser = await puppeteer.launch({
    headless: false, // Mostrar el navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('\n🔎 Buscando en CUITOnline...');
    await page.goto('https://www.cuitonline.com', { waitUntil: 'domcontentloaded' });

    const inputSelector = '#searchBox';
    await page.waitForSelector(inputSelector, { timeout: 15000 });

    await page.type(inputSelector, nombreApellido);
    await page.keyboard.press('Enter');

    // Esperamos que carguen los resultados
    await page.waitForSelector('.results .cuit', { timeout: 15000 });

    const cuits = await page.$$eval('.results .cuit', spans =>
      spans.map(span => span.textContent.trim())
    );

    if (cuits.length === 0) {
      console.log('❌ No se encontraron CUITs');
    } else {
      console.log('\n📋 CUITs encontrados:');
      cuits.forEach((cuit, i) => console.log(`${i + 1}. ${cuit}`));
    }
  } catch (error) {
    console.error('⚠️ Error buscando en CUITOnline:', error.message);
  } finally {
    await browser.close();
  }
}

const nombreApellido = readline.question('Nombre y apellido a buscar: ');
buscarEnCuitOnline(nombreApellido);
