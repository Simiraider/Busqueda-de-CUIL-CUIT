const puppeteer = require('puppeteer');
const readline = require('readline-sync');

(async () => {
  const nombreCompleto = readline.question('Nombre completo a buscar: ');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('\n🔎 Abriendo Nosis...');
    await page.goto('https://informes.nosis.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    await page.waitForSelector('#Busqueda_Texto');
    await page.click('#Busqueda_Texto');
    await page.type('#Busqueda_Texto', nombreCompleto);
    await page.keyboard.press('Enter');

    console.log('⌛ Esperando resultados reales...');

    // Esperar a que aparezca al menos un resultado con texto real (sin @)
    await page.waitForFunction(() => {
      const nombres = document.querySelectorAll('.col-12.col-md-9.col-xl-10.rz');
      return Array.from(nombres).some(el => !el.textContent.includes('@'));
    });

    // Extraer los datos reales
    const resultados = await page.evaluate(() => {
      const nombres = Array.from(document.querySelectorAll('.col-12.col-md-9.col-xl-10.rz')).map(e => e.textContent.trim());
      const cuits = Array.from(document.querySelectorAll('.col-5.col-md-3.col-xl-2.cuit')).map(e => e.textContent.trim());
      return nombres.map((nombre, i) => ({
        nombre,
        cuit: cuits[i] || 'No encontrado'
      }));
    });

    if (resultados.length === 0) {
      console.log('❌ No se encontraron resultados');
    } else {
      console.log('\n📋 Resultados encontrados:');
      resultados.forEach((r, i) => {
        console.log(`${i + 1}. ${r.nombre} — ${r.cuit}`);
      });
    }
  } catch (error) {
    console.error('⚠️ Error al buscar:', error.message);
  } finally {
    await browser.close();
  }
})();
