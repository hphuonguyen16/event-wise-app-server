// create QR code

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const createQRCode = async (data, fileName) => {
    // let img = "";
    let qr = await QRCode.toDataURL(data, {
      width: 300,
      margin: 10,
      scale: 10,
    });
 
    return qr;
};

module.exports = createQRCode;