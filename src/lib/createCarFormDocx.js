/**
 * Generate a Create Car form as DOCX for agencies to print and fill by hand.
 * Uses the same fields as CreateCarPage.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

const BLANK = '________________________________________________________________';

function fieldLine(label, required = false) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}${required ? ' *' : ''}: `, bold: true }),
      new TextRun(BLANK),
    ],
    spacing: { after: 120 },
  });
}

function sectionTitle(title) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  });
}

/**
 * Build the Create Car form DOCX and return a Blob.
 * @returns {Promise<Blob>}
 */
export async function buildCreateCarFormDocx() {
  const children = [
    new Paragraph({
      text: 'Create Car – Agency Form',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: 'Print this form and fill it by hand with a pen. You can then enter the same information online or hand the form to the office.',
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
    }),

    sectionTitle('Basic Information'),
    fieldLine('Make', true),
    fieldLine('Model', true),
    fieldLine('Year', true),
    fieldLine('License Plate', true),
    fieldLine('Color'),
    fieldLine('Mileage (km)'),

    sectionTitle('Technical Specifications'),
    fieldLine('Fuel Type (Petrol / Diesel / Electric / Hybrid)', true),
    fieldLine('Transmission (Automatic / Manual)', true),
    fieldLine('Wheels Drive (4x4 / Front / Rear / Autoblock)'),
    fieldLine('Seats', true),
    fieldLine('Doors', true),
    fieldLine('Category (Luxury / Sport / Commercial / Industrial / Normal / Event / Sea)', true),

    sectionTitle('Features & Add-ons'),
    new Paragraph({
      text: 'Features (tick as applicable): GPS, Bluetooth, Backup Camera, Sunroof, Leather Seats, Apple CarPlay, Android Auto, Heated Seats, Cruise Control, Parking Sensors',
      spacing: { after: 120 },
    }),
    new Paragraph({ text: BLANK, spacing: { after: 120 } }),
    new Paragraph({
      text: 'Add-ons (tick as applicable): Child Seat, GPS Device, Phone Holder, WiFi Hotspot, Roof Rack',
      spacing: { after: 120 },
    }),
    new Paragraph({ text: BLANK, spacing: { after: 120 } }),
    new Paragraph({
      text: 'Reason of rent (tick as applicable): Vacation, Business Trip, Wedding, Daily Use, Long Trip, Airport Transfer',
      spacing: { after: 120 },
    }),
    new Paragraph({ text: BLANK, spacing: { after: 240 } }),

    sectionTitle('Pricing & Rental Terms'),
    fieldLine('Daily Rate ($)', true),
    fieldLine('Holiday Rate ($)'),
    fieldLine('Min Rental Days'),
    fieldLine('Max Driving Mileage per day (km)'),
    new Paragraph({
      text: '☐ Require Deposit    If yes, Deposit Amount ($): ____________',
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: '☐ Delivery Available    If yes, Delivery Fee ($): ____________',
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: '☐ Driver Available    If yes, Driver Fee per day ($): ____________',
      spacing: { after: 240 },
    }),

    sectionTitle('Delivery & Driver Options'),
    new Paragraph({ text: 'Delivery / driver options are listed above.', spacing: { after: 240 } }),

    sectionTitle('Car Images'),
    new Paragraph({
      text: 'Attach or upload: Main image *, Front, Back, Left, Right (as per online form).',
      spacing: { after: 240 },
    }),

    sectionTitle('Location Information'),
    new Paragraph({ text: 'Live Location – Address (region):', spacing: { after: 60 } }),
    new Paragraph({ text: 'Governorate: ________________    Coordinates / Google Maps link: ' + BLANK, spacing: { after: 120 } }),
    new Paragraph({ text: 'Delivery Location – Address (region):', spacing: { after: 60 } }),
    new Paragraph({ text: 'Governorate: ________________    Coordinates: ' + BLANK, spacing: { after: 120 } }),
    new Paragraph({ text: 'Return Location – Address (region):', spacing: { after: 60 } }),
    new Paragraph({ text: 'Governorate: ________________    Coordinates: ' + BLANK, spacing: { after: 240 } }),

    new Paragraph({
      text: 'Notes (optional):',
      spacing: { before: 120, after: 60 },
    }),
    new Paragraph({ text: BLANK, spacing: { after: 120 } }),
    new Paragraph({ text: BLANK, spacing: { after: 120 } }),

    new Paragraph({
      text: '— End of form —',
      alignment: AlignmentType.CENTER,
      spacing: { before: 240 },
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

/**
 * Trigger download of the form DOCX in the browser.
 * @param {string} [filename] - Optional filename (default: create-car-form.docx)
 */
export async function downloadCreateCarFormDocx(filename = 'create-car-form.docx') {
  const blob = await buildCreateCarFormDocx();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
