export function generarPDF(datos) {
    if (!datos) return alert('No hay datos de ensayo.');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const canvas = document.querySelector('canvas');
    const img = canvas.toDataURL('image/png');
    doc.setFontSize(16);
    doc.text('Informe de Ensayo Charpy', 15, 20);
    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 30);
    doc.text(`Material: ${datos.material}`, 15, 38);
    doc.text(`Ángulo inicial: ${datos.angulo}°`, 15, 46);
    doc.text(`Energía inicial: ${datos.eInicial} J`, 15, 54);
    doc.text(`Energía absorbida: ${datos.eAbsorbida} J`, 15, 62);
    doc.text(`Resiliencia: ${datos.resiliencia} J/cm²`, 15, 70);
    doc.text(`Tipo fractura: ${datos.tipoFractura}`, 15, 78);
    doc.addImage(img, 'PNG', 15, 90, 80, 60);
    doc.save('informe-charpy.pdf');
}