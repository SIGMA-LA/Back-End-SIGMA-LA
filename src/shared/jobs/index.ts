import cron from 'node-cron';
import { ReportService } from '../providers/email/ReportService.js';

const reportService = new ReportService();

export function setupJobs() {
  // Se ejecuta el primer día de cada mes a las 00:00: '0 0 1 * *'
  cron.schedule('0 0 1 * *', async () => {
    console.log('[JOBS] Generando reporte mensual para ADMINs...');
    try {
      await reportService.sendMonthlyAdminReport();
      console.log('[JOBS] Reporte mensual enviado con éxito.');
    } catch (error) {
      console.error('[JOBS] Error al enviar reporte mensual:', error);
    }
  });
}
