const SPREADSHEET_ID = 'PASTE_SPREADSHEET_ID_HERE';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ordersSheet = ss.getSheetByName('Orders');
    const itemsSheet = ss.getSheetByName('Order Items');

    if (!ordersSheet) {
      return output({ success: false, error: 'Orders sheet not found.' });
    }

    let data = {};

    if (e && e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    const submittedAt = data.submittedAt || new Date().toISOString();
    const items = Array.isArray(data.items) ? data.items : [];

    ordersSheet.appendRow([
      submittedAt,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.address || '',
      data.shippingNeeded || '',
      data.venmoName || '',
      data.paid ? 'Yes' : 'No',
      data.pickup || '',
      data.notes || '',
      Number(data.total || 0),
      Number(data.itemCount || 0),
      JSON.stringify(items),
      'New'
    ]);

    if (itemsSheet) {
      items.forEach(function (item) {
        itemsSheet.appendRow([
          submittedAt,
          data.name || '',
          data.phone || '',
          data.email || '',
          item.shirtType || '',
          item.shirtBrand || '',
          item.color || '',
          item.size || '',
          Number(item.quantity || 0),
          Number(item.unitPrice || 0),
          Number(item.lineTotal || 0),
          data.paid ? 'Yes' : 'No',
          data.shippingNeeded || '',
          'New'
        ]);
      });
    }

    return output({ success: true, message: 'Order saved successfully.' });
  } catch (err) {
    return output({ success: false, error: String(err) });
  }
}

function doGet() {
  return output({ success: true, message: 'Web app is running.' });
}

function output(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
