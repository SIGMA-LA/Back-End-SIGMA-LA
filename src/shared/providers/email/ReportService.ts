import PDFDocument from 'pdfkit';
import QuickChart from 'quickchart-js';
import { ObraService } from '../../../models/Obra/obra.service.js';
import { PagoService } from '../../../models/Pago/pago.service.js';
import { emailService } from './EmailService.js';
import { prisma } from '../../db/prismaClient.js';

export class ReportService {
  private obraService = new ObraService();
  private pagoService = new PagoService();

  async generatePDFBuffer(
    stats: { obrasActivas: number; nuevasObrasDelMes: number; cuentasPorCobrar: number },
    facturacion: { ingresosMes: number; ingresosMesPasado: number; porcentajeCrecimiento: number }
  ): Promise<Buffer> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // --- FETCH DATA FOR CHARTS --- (Simulating the frontend dashboards)
    const obrasPorEstadoRaw = await prisma.obra.groupBy({ by: ['estado'], _count: true });
    
    const visitasDeMesRaw = await prisma.visita.groupBy({ by: ['estado'], where: { fecha_hora_visita: { gte: startOfMonth } }, _count: true });
    
    const entregasDeMesRaw = await prisma.entrega.groupBy({ by: ['estado'], where: { fecha_hora_entrega: { gte: startOfMonth } }, _count: true });

    const labels6Meses = [];
    const ingresosMensuales = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const res = await prisma.pago.aggregate({ _sum: { monto: true }, where: { fecha_pago: { gte: start, lte: end } } });
      labels6Meses.push(start.toLocaleString('es-AR', { month: 'short', year: 'numeric' }));
      ingresosMensuales.push(Number(res._sum.monto || 0));
    }
    
    let acc = 0;
    const ingresosAcumulados = ingresosMensuales.map(m => (acc += m));

    // --- GENERATE CHARTS ---
    const chartVentasMensuales = new QuickChart();
    chartVentasMensuales.setConfig({
      type: 'bar',
      data: { labels: labels6Meses, datasets: [{ label: 'Ingresos ($)', data: ingresosMensuales, backgroundColor: '#3b82f6' }] },
      options: { title: { display: true, text: 'Ventas Mensuales (últimos 6 meses)' } }
    });

    const chartObrasEstado = new QuickChart();
    chartObrasEstado.setConfig({
      type: 'outlabeledPie',
      data: { labels: obrasPorEstadoRaw.map(o => o.estado), datasets: [{ data: obrasPorEstadoRaw.map(o => o._count) }] },
      options: { title: { display: true, text: 'Obras por Estado' }, plugins: { legend: false, outlabels: { text: '%l (%v)', color: 'white', stretch: 35, font: { minSize: 12 } } } }
    });

    const chartVisitas = new QuickChart();
    chartVisitas.setConfig({
      type: 'horizontalBar',
      data: { labels: visitasDeMesRaw.map(v => v.estado), datasets: [{ label: 'Visitas', data: visitasDeMesRaw.map(v => v._count), backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'] }] },
      options: { title: { display: true, text: 'Visitas de este mes' }, legend: { display: false }, scales: { xAxes: [{ ticks: { beginAtZero: true } }] } }
    });

    const chartEntregas = new QuickChart();
    chartEntregas.setConfig({
      type: 'horizontalBar',
      data: { labels: entregasDeMesRaw.map(e => e.estado), datasets: [{ label: 'Entregas', data: entregasDeMesRaw.map(e => e._count), backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'] }] },
      options: { title: { display: true, text: 'Entregas de este mes' }, legend: { display: false }, scales: { xAxes: [{ ticks: { beginAtZero: true } }] } }
    });

    const chartAcumulado = new QuickChart();
    chartAcumulado.setConfig({
      type: 'line',
      data: { labels: labels6Meses, datasets: [{ label: 'Ingresos Acumulados ($)', data: ingresosAcumulados, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', fill: true }] },
      options: { title: { display: true, text: 'Ingresos Acumulados (últimos 6 meses)' } }
    });

    const [imgVentas, imgObras, imgVisitas, imgEntregas, imgAcumulado] = await Promise.all([
      chartVentasMensuales.toBinary(), chartObrasEstado.toBinary(), chartVisitas.toBinary(), chartEntregas.toBinary(), chartAcumulado.toBinary()
    ]);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // --- Diseño del PDF ---
      doc.fontSize(20).text('REPORTE MENSUAL DE GESTIÓN', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`);
      doc.moveDown();
      
      doc.fontSize(14).text('Métricas Principales:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`- Nuevas Obras: ${stats.nuevasObrasDelMes}`);
      doc.text(`- Obras Totales Activas: ${stats.obrasActivas}`);
      doc.text(`- Ingresos del Mes: $${facturacion.ingresosMes.toLocaleString('es-AR')}`);
      doc.text(`- Cuentas por Cobrar Total: $${stats.cuentasPorCobrar.toLocaleString('es-AR')}`);
      doc.text(`- Crecimiento vs Mes Pasado: ${facturacion.porcentajeCrecimiento}%`);
      doc.moveDown(2);
      
      // Añadir gráficos lado a lado si es posible, sino secuencialmente
      doc.image(imgVentas, 50, doc.y, { width: 250 });
      doc.image(imgObras, 300, doc.y, { width: 250 });
      
      doc.moveDown(15);
      doc.image(imgVisitas, 50, doc.y, { width: 250 });
      doc.image(imgEntregas, 300, doc.y, { width: 250 });
      
      doc.addPage();
      doc.image(imgAcumulado, 50, 50, { width: 500 });
      
      doc.end();
    });
  }

  async sendMonthlyAdminReport() {
    const stats = await this.obraService.getAdminStats();
    const facturacion = await this.pagoService.getFacturacionStats();

    const admins = await prisma.empleado.findMany({
      where: { rol_actual: 'ADMIN', mail: { not: null } },
      select: { mail: true, nombre: true }
    });

    if (admins.length === 0) return;

    const emails = admins.map(a => a.mail!);

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #2c3e50;">Reporte Mensual de Gestión - SIGMA-LA</h1>
        <p>Resumen de actividad del mes finalizado:</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Métrica</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Valor</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;">Nuevas Obras</td>
            <td style="border: 1px solid #ddd; padding: 12px;">${stats.nuevasObrasDelMes}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;">Ingresos del Mes</td>
            <td style="border: 1px solid #ddd; padding: 12px;">$${facturacion.ingresosMes.toLocaleString('es-AR')}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;">Cuentas por Cobrar Total</td>
            <td style="border: 1px solid #ddd; padding: 12px;">$${stats.cuentasPorCobrar.toLocaleString('es-AR')}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 12px;">Crecimiento vs Mes Pasado</td>
            <td style="border: 1px solid #ddd; padding: 12px; color: ${facturacion.porcentajeCrecimiento >= 0 ? 'green' : 'red'};">
              ${facturacion.porcentajeCrecimiento}%
            </td>
          </tr>
        </table>
        
        <p style="margin-top: 20px; font-size: 12px; color: #777;">
          Se adjunta el reporte detallado en formato PDF.<br>
          Este reporte fue generado automáticamente por el sistema.
        </p>
      </div>
    `;

    const pdfBuffer = await this.generatePDFBuffer(stats, facturacion);
    const fileName = `Reporte_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`;

    await emailService.send({
      to: emails,
      subject: `Reporte Mensual de Sistema - SIGMA-LA`,
      body: htmlBody,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  }
}
